from flask import Blueprint, request, jsonify
from database.connection import get_connection
from utils.auth import admin_required, patient_required
from datetime import datetime, timedelta
import uuid

appointments_bp = Blueprint("appointments", __name__)


def generate_appointment_id():
    return "APT-" + uuid.uuid4().hex[:8].upper()

def serialize_value(value):

    if isinstance(value, timedelta):
        total_seconds = int(value.total_seconds())

        hours = total_seconds // 3600
        minutes = (total_seconds % 3600) // 60
        seconds = total_seconds % 60

        return (
            f"{hours:02d}:"
            f"{minutes:02d}:"
            f"{seconds:02d}"
        )

    if hasattr(value, "isoformat"):
        return value.isoformat()

    return value


def serialize_appointment(appointment):
    if not appointment:
        return appointment

    result = dict(appointment)

    for key, value in result.items():
        result[key] = serialize_value(value)

    return result


@appointments_bp.route("/api/appointments", methods=["POST"])
def create_appointment():
    conn = None

    try:
        data = request.get_json(silent=True)

        if not data:
            return jsonify({
                "success": False,
                "message": "Request body is required"
            }), 400

        patient_id = str(data.get("patient_id", "")).strip()
        doctor_id = data.get("doctor_id")
        schedule_id = data.get("schedule_id")
        appointment_time = str(
            data.get("appointment_time", "")
        ).strip()

        if not patient_id:
            return jsonify({
                "success": False,
                "message": "Patient ID is required"
            }), 400

        if not doctor_id:
            return jsonify({
                "success": False,
                "message": "Doctor ID is required"
            }), 400

        if not schedule_id:
            return jsonify({
                "success": False,
                "message": "Schedule ID is required"
            }), 400

        if not appointment_time:
            return jsonify({
                "success": False,
                "message": "Appointment time is required"
            }), 400

        try:
            doctor_id = int(doctor_id)
            schedule_id = int(schedule_id)
        except (ValueError, TypeError):
            return jsonify({
                "success": False,
                "message": "Doctor ID and Schedule ID must be valid numbers"
            }), 400

        conn = get_connection()

        with conn.cursor() as cursor:

            # -------------------------------------------------
            # 1. Verify patient
            # -------------------------------------------------
            cursor.execute("""
                SELECT patient_id
                FROM patients
                WHERE patient_id = %s
            """, (patient_id,))

            patient = cursor.fetchone()

            if not patient:
                return jsonify({
                    "success": False,
                    "message": "Patient not found"
                }), 404

            # -------------------------------------------------
            # 2. Verify doctor
            # -------------------------------------------------
            cursor.execute("""
                 SELECT doctor_id, department_id, name AS doctor_name, status
                 FROM doctors
                 WHERE doctor_id = %s
            """, (doctor_id,))

            doctor = cursor.fetchone()

            if not doctor:
                return jsonify({
                    "success": False,
                    "message": "Doctor not found"
                }), 404

            if doctor["status"] != "ACTIVE":
                return jsonify({
                    "success": False,
                    "message": "Doctor is not active"
                }), 400

            # -------------------------------------------------
            # 3. Verify schedule
            # -------------------------------------------------
            cursor.execute("""
    SELECT
        schedule_id,
        doctor_id,
        schedule_date,
        start_time,
        end_time,
        slot_duration
    FROM doctor_schedules
    WHERE schedule_id = %s
      AND doctor_id = %s
""", (schedule_id, doctor_id))

            schedule = cursor.fetchone()

            if not schedule:
                return jsonify({
                    "success": False,
                    "message": "Doctor schedule not found"
                }), 404

           
            # -------------------------------------------------
            # 4. Validate appointment time format
            # -------------------------------------------------
            try:
                requested_time = datetime.strptime(
                    appointment_time,
                    "%H:%M:%S"
                ).time()
            except ValueError:

                try:
                    requested_time = datetime.strptime(
                        appointment_time,
                        "%H:%M"
                    ).time()

                except ValueError:
                    return jsonify({
                        "success": False,
                        "message": "Appointment time must be in HH:MM or HH:MM:SS format"
                    }), 400

            # -------------------------------------------------
            # 5. Convert schedule values to datetime
            # -------------------------------------------------
            schedule_date = schedule["schedule_date"]

            start_time = schedule["start_time"]
            end_time = schedule["end_time"]

            if hasattr(start_time, "seconds"):
                start_time = (
                    datetime.min + start_time
                ).time()

            if hasattr(end_time, "seconds"):
                end_time = (
                    datetime.min + end_time
                ).time()

            schedule_start = datetime.combine(
                schedule_date,
                start_time
            )

            schedule_end = datetime.combine(
                schedule_date,
                end_time
            )

            requested_datetime = datetime.combine(
                schedule_date,
                requested_time
            )

            # -------------------------------------------------
            # 6. Validate time is inside schedule
            # -------------------------------------------------
            if requested_datetime < schedule_start:
                return jsonify({
                    "success": False,
                    "message": "Appointment time is before the schedule start time"
                }), 400

            if requested_datetime >= schedule_end:
                return jsonify({
                    "success": False,
                    "message": "Appointment time is outside the doctor's schedule"
                }), 400

            # -------------------------------------------------
            # 7. Validate slot interval
            # -------------------------------------------------
            slot_duration = int(schedule["slot_duration"])

            if slot_duration <= 0:
                return jsonify({
                    "success": False,
                    "message": "Invalid schedule slot duration"
                }), 500

            minutes_from_start = int(
                (
                    requested_datetime - schedule_start
                ).total_seconds() / 60
            )

            if minutes_from_start % slot_duration != 0:
                return jsonify({
                    "success": False,
                    "message": (
                        f"Appointment time must be in "
                        f"{slot_duration}-minute intervals "
                        f"starting from "
                        f"{start_time.strftime('%H:%M')}"
                    )
                }), 400

            # -------------------------------------------------
            # 8. Check duplicate doctor slot
            # -------------------------------------------------
            cursor.execute("""
                SELECT appointment_id, status
                FROM appointments
                WHERE doctor_id = %s
                  AND schedule_id = %s
                  AND appointment_time = %s
                  AND status != 'CANCELLED'
                LIMIT 1
            """, (
                doctor_id,
                schedule_id,
                requested_time
            ))

            existing_appointment = cursor.fetchone()

            if existing_appointment:
                return jsonify({
                    "success": False,
                    "message": "This doctor time slot is already booked"
                }), 409

            # -------------------------------------------------
            # 9. Create appointment
            # -------------------------------------------------
            appointment_id = generate_appointment_id()

            cursor.execute("""
                INSERT INTO appointments
                (
                    appointment_id,
                    patient_id,
                    doctor_id,
                    schedule_id,
                    appointment_date,
                    appointment_time,
                    status
                )
                VALUES
                (
                    %s,
                    %s,
                    %s,
                    %s,
                    %s,
                    %s,
                    'BOOKED'
                )
            """, (
                appointment_id,
                patient_id,
                doctor_id,
                schedule_id,
                schedule_date,
                requested_time
            ))

            # -------------------------------------------------
            # 10. Add history
            # -------------------------------------------------
            cursor.execute("""
                INSERT INTO appointment_history
                (
                    appointment_id,
                    old_status,
                    new_status,
                    changed_by,
                    remark
                )
                VALUES
                (
                    %s,
                    NULL,
                    'BOOKED',
                    'PATIENT',
                    'Appointment booked'
                )
            """, (appointment_id,))

            conn.commit()

        return jsonify({
            "success": True,
            "message": "Appointment booked successfully",
            "appointment": {
                "appointment_id": appointment_id,
                "patient_id": patient_id,
                "doctor_id": doctor_id,
                "schedule_id": schedule_id,
                "appointment_date": serialize_value(schedule_date),
                "appointment_time": serialize_value(requested_time),
                "status": "BOOKED"
            }
        }), 201

    except Exception as e:
        if conn:
            conn.rollback()

        print("CREATE APPOINTMENT ERROR:", repr(e))

        return jsonify({
            "success": False,
            "message": "Unable to book appointment"
        }), 500

    finally:
        if conn:
            conn.close()


# ============================================================
# PATIENT APPOINTMENTS
# ============================================================

@appointments_bp.route(
    "/api/appointments/patient/<patient_id>",
    methods=["GET"]
)
@patient_required
def get_patient_appointments(patient_id):

    token_patient_id = request.patient.get("patient_id")

    if token_patient_id != patient_id:
        return jsonify({
            "success": False,
            "message": "You can only access your own appointments"
        }), 403

    conn = None

    try:
        conn = get_connection()

        with conn.cursor() as cursor:
            cursor.execute("""
                SELECT
                    a.appointment_id,
                    a.patient_id,
                    a.doctor_id,
                    a.schedule_id,
                    a.appointment_date,
                    a.appointment_time,
                    a.status,
                    a.created_at,
                    d.name,
                    d.specialization,
                    dep.department_name
                FROM appointments a
                JOIN doctors d
                    ON a.doctor_id = d.doctor_id
                LEFT JOIN departments dep
                    ON d.department_id = dep.department_id
                WHERE a.patient_id = %s
                ORDER BY
                    a.appointment_date DESC,
                    a.appointment_time DESC
            """, (patient_id,))

            appointments = cursor.fetchall()

        appointments = [
            serialize_appointment(appointment)
            for appointment in appointments
        ]

        return jsonify({
            "success": True,
            "count": len(appointments),
            "appointments": appointments
        }), 200

    except Exception as e:
        print("GET PATIENT APPOINTMENTS ERROR:", repr(e))

        return jsonify({
            "success": False,
            "message": "Unable to fetch patient appointments"
        }), 500

    finally:
        if conn:
            conn.close()


# ============================================================
# CANCEL APPOINTMENT
# ============================================================

@appointments_bp.route(
    "/api/appointments/<appointment_id>/cancel",
    methods=["PUT"]
)
@patient_required
def cancel_appointment(appointment_id):

    conn = None

    try:
        conn = get_connection()

        with conn.cursor() as cursor:

            cursor.execute("""
                SELECT
                    appointment_id,
                    patient_id,
                    status
                FROM appointments
                WHERE appointment_id = %s
            """, (appointment_id,))

            appointment = cursor.fetchone()

            if not appointment:
                return jsonify({
                    "success": False,
                    "message": "Appointment not found"
                }), 404

            token_patient_id = request.patient.get("patient_id")

            if appointment["patient_id"] != token_patient_id:
                return jsonify({
                    "success": False,
                    "message": "You can only cancel your own appointment"
                }), 403

            current_status = appointment["status"]

            if current_status not in ["BOOKED", "CONFIRMED"]:
                return jsonify({
                    "success": False,
                    "message": (
                        "Only BOOKED or CONFIRMED appointments "
                        "can be cancelled"
                    )
                }), 400

            cursor.execute("""
                UPDATE appointments
                SET status = 'CANCELLED'
                WHERE appointment_id = %s
            """, (appointment_id,))

            cursor.execute("""
                INSERT INTO appointment_history
                (
                    appointment_id,
                    old_status,
                    new_status,
                    changed_by,
                    remark
                )
                VALUES
                (
                    %s,
                    %s,
                    'CANCELLED',
                    'PATIENT',
                    'Appointment cancelled by patient'
                )
            """, (
                appointment_id,
                current_status
            ))

            conn.commit()

        return jsonify({
            "success": True,
            "message": "Appointment cancelled successfully",
            "appointment_id": appointment_id,
            "status": "CANCELLED"
        }), 200

    except Exception as e:
        if conn:
            conn.rollback()

        print("CANCEL APPOINTMENT ERROR:", repr(e))

        return jsonify({
            "success": False,
            "message": "Unable to cancel appointment"
        }), 500

    finally:
        if conn:
            conn.close()


# ============================================================
# ADMIN UPDATE APPOINTMENT STATUS
# ============================================================

@appointments_bp.route(
    "/api/appointments/<appointment_id>/status",
    methods=["PUT"]
)
@admin_required
def update_appointment_status(appointment_id):

    conn = None

    try:
        data = request.get_json(silent=True)

        if not data:
            return jsonify({
                "success": False,
                "message": "Request body is required"
            }), 400

        new_status = str(
            data.get("status", "")
        ).strip().upper()

        allowed_statuses = [
            "BOOKED",
            "CONFIRMED",
            "WAITING",
            "IN_PROGRESS",
            "COMPLETED",
            "CANCELLED"
        ]

        if new_status not in allowed_statuses:
            return jsonify({
                "success": False,
                "message": "Invalid appointment status"
            }), 400

        conn = get_connection()

        with conn.cursor() as cursor:

            cursor.execute("""
                SELECT
                    appointment_id,
                    patient_id,
                    doctor_id,
                    status
                FROM appointments
                WHERE appointment_id = %s
            """, (appointment_id,))

            appointment = cursor.fetchone()

            if not appointment:
                return jsonify({
                    "success": False,
                    "message": "Appointment not found"
                }), 404

            current_status = appointment["status"]

            valid_transitions = {
                "BOOKED": ["CONFIRMED", "CANCELLED"],
                "CONFIRMED": ["WAITING", "CANCELLED"],
                "WAITING": ["IN_PROGRESS"],
                "IN_PROGRESS": ["COMPLETED"],
                "COMPLETED": [],
                "CANCELLED": []
            }

            if new_status not in valid_transitions.get(
                current_status, []
            ):
                return jsonify({
                    "success": False,
                    "message": (
                        f"Invalid status transition: "
                        f"{current_status} → {new_status}"
                    )
                }), 400

            cursor.execute("""
                UPDATE appointments
                SET status = %s
                WHERE appointment_id = %s
            """, (
                new_status,
                appointment_id
            ))

            admin_username = request.admin.get(
                "username",
                "ADMIN"
            )

            cursor.execute("""
                INSERT INTO appointment_history
                (
                    appointment_id,
                    old_status,
                    new_status,
                    changed_by,
                    remark
                )
                VALUES
                (
                    %s,
                    %s,
                    %s,
                    %s,
                    %s
                )
            """, (
                appointment_id,
                current_status,
                new_status,
                admin_username,
                f"Appointment status changed to {new_status}"
            ))

            conn.commit()

        return jsonify({
            "success": True,
            "message": "Appointment status updated successfully",
            "appointment_id": appointment_id,
            "old_status": current_status,
            "new_status": new_status
        }), 200

    except Exception as e:
        if conn:
            conn.rollback()

        print("UPDATE APPOINTMENT STATUS ERROR:", repr(e))

        return jsonify({
            "success": False,
            "message": "Unable to update appointment status"
        }), 500

    finally:
        if conn:
            conn.close()


# ============================================================
# APPOINTMENT HISTORY
# ============================================================

@appointments_bp.route(
    "/api/appointments/<appointment_id>/history",
    methods=["GET"]
)
@admin_required
def get_appointment_history(appointment_id):

    conn = None

    try:
        conn = get_connection()

        with conn.cursor() as cursor:

            cursor.execute("""
                SELECT appointment_id
                FROM appointments
                WHERE appointment_id = %s
            """, (appointment_id,))

            appointment = cursor.fetchone()

            if not appointment:
                return jsonify({
                    "success": False,
                    "message": "Appointment not found"
                }), 404

            cursor.execute("""
                SELECT
                    history_id,
                    appointment_id,
                    old_status,
                    new_status,
                    changed_by,
                    remark,
                    changed_at
                FROM appointment_history
                WHERE appointment_id = %s
                ORDER BY changed_at ASC
            """, (appointment_id,))

            history = cursor.fetchall()

        history = [
            serialize_appointment(item)
            for item in history
        ]

        return jsonify({
            "success": True,
            "appointment_id": appointment_id,
            "history": history
        }), 200

    except Exception as e:
        print("GET APPOINTMENT HISTORY ERROR:", repr(e))

        return jsonify({
            "success": False,
            "message": "Unable to fetch appointment history"
        }), 500

    finally:
        if conn:
            conn.close()
            # ============================================================
# ADMIN VIEW ALL APPOINTMENTS
# ============================================================

@appointments_bp.route(
    "/api/appointments/admin",
    methods=["GET"]
)
@admin_required
def get_all_appointments():

    conn = None

    try:
        conn = get_connection()

        with conn.cursor() as cursor:

            cursor.execute("""
                SELECT
                    a.appointment_id,
                    a.patient_id,
                    p.name AS patient_name,
                    p.mobile AS patient_mobile,

                    a.doctor_id,
                    d.name AS doctor_name,
                    d.specialization,

                    dep.department_name,

                    a.schedule_id,
                    a.appointment_date,
                    a.appointment_time,
                    a.status,
                    a.created_at

                FROM appointments a

                INNER JOIN patients p
                    ON a.patient_id = p.patient_id

                INNER JOIN doctors d
                    ON a.doctor_id = d.doctor_id

                LEFT JOIN departments dep
                    ON d.department_id = dep.department_id

                ORDER BY
                    a.appointment_date DESC,
                    a.appointment_time DESC

            """)

            appointments = cursor.fetchall()

        appointments = [
            serialize_appointment(appointment)
            for appointment in appointments
        ]

        return jsonify({
            "success": True,
            "count": len(appointments),
            "appointments": appointments
        }), 200

    except Exception as e:

        print(
            "GET ALL APPOINTMENTS ERROR:",
            repr(e)
        )

        return jsonify({
            "success": False,
            "message": "Unable to fetch appointments"
        }), 500

    finally:

        if conn:
            conn.close()