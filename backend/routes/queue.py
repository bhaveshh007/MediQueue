from flask import Blueprint, request, jsonify
from database.connection import get_connection
from utils.auth import admin_required, patient_required

queue_bp = Blueprint("queue", __name__)

AVERAGE_CONSULTATION_MINUTES = 15


# ============================================================
# CREATE QUEUE ENTRY
# PATIENT ONLY
# ============================================================

@queue_bp.route("/api/queue/<appointment_id>", methods=["POST"])
@patient_required
def create_queue_entry(appointment_id):

    conn = None

    try:
        conn = get_connection()

        with conn.cursor() as cursor:

            # ------------------------------------------------
            # Check appointment
            # ------------------------------------------------

            cursor.execute("""
                SELECT
                    appointment_id,
                    patient_id,
                    doctor_id,
                    appointment_date,
                    appointment_time,
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

            # ------------------------------------------------
            # Verify patient owns appointment
            # ------------------------------------------------

            if appointment["patient_id"] != request.patient["patient_id"]:
                return jsonify({
                    "success": False,
                    "message": (
                        "You are not authorized to enter "
                        "this appointment into the queue"
                    )
                }), 403

            # ------------------------------------------------
            # Appointment must be CONFIRMED
            # ------------------------------------------------

            if appointment["status"] != "CONFIRMED":
                return jsonify({
                    "success": False,
                    "message": (
                        "Only confirmed appointments "
                        "can enter the queue"
                    )
                }), 400

            # ------------------------------------------------
            # Check existing queue entry
            # ------------------------------------------------

            cursor.execute("""
                SELECT
                    queue_id,
                    appointment_id,
                    token_number,
                    queue_status,
                    estimated_wait_minutes
                FROM queue_entries
                WHERE appointment_id = %s
            """, (appointment_id,))

            existing = cursor.fetchone()

            if existing:
                return jsonify({
                    "success": True,
                    "message": "Patient already has a queue entry",
                    "queue": existing
                }), 200

            # ------------------------------------------------
            # Generate next token
            # ------------------------------------------------

            cursor.execute("""
                SELECT
                    COALESCE(MAX(q.token_number), 0) + 1
                    AS next_token
                FROM queue_entries q
                INNER JOIN appointments a
                    ON q.appointment_id = a.appointment_id
                WHERE a.doctor_id = %s
                  AND a.appointment_date = %s
            """, (
                appointment["doctor_id"],
                appointment["appointment_date"]
            ))

            result = cursor.fetchone()

            token_number = result["next_token"]

            # ------------------------------------------------
            # Initial estimated wait
            # ------------------------------------------------

            estimated_wait_minutes = (
                (token_number - 1)
                * AVERAGE_CONSULTATION_MINUTES
            )

            # ------------------------------------------------
            # Create queue entry
            # ------------------------------------------------

            cursor.execute("""
                INSERT INTO queue_entries
                (
                    appointment_id,
                    token_number,
                    queue_status,
                    estimated_wait_minutes
                )
                VALUES
                (
                    %s,
                    %s,
                    'WAITING',
                    %s
                )
            """, (
                appointment_id,
                token_number,
                estimated_wait_minutes
            ))

            queue_id = cursor.lastrowid

            conn.commit()

        return jsonify({
            "success": True,
            "message": "Patient added to queue successfully",
            "queue": {
                "queue_id": queue_id,
                "appointment_id": appointment_id,
                "token_number": token_number,
                "queue_status": "WAITING",
                "estimated_wait_minutes": estimated_wait_minutes
            }
        }), 201

    except Exception as e:

        if conn:
            conn.rollback()

        print(
            "CREATE QUEUE ENTRY ERROR:",
            repr(e)
        )

        return jsonify({
            "success": False,
            "message": "Unable to create queue entry"
        }), 500

    finally:

        if conn:
            conn.close()


# ============================================================
# GET DOCTOR QUEUE
# ADMIN ONLY
# ============================================================

@queue_bp.route(
    "/api/queue/doctor/<int:doctor_id>",
    methods=["GET"]
)
@admin_required
def get_doctor_queue(doctor_id):

    conn = None

    try:
        conn = get_connection()

        with conn.cursor() as cursor:

            cursor.execute("""
                SELECT
                    q.queue_id,
                    q.appointment_id,
                    q.token_number,
                    q.queue_status,
                    q.estimated_wait_minutes,
                    a.patient_id,
                    p.name AS patient_name,
                    a.doctor_id,
                    a.appointment_date,
                    a.appointment_time
                FROM queue_entries q
                INNER JOIN appointments a
                    ON q.appointment_id = a.appointment_id
                INNER JOIN patients p
                    ON a.patient_id = p.patient_id
                WHERE a.doctor_id = %s
                  AND q.queue_status IN (
                      'WAITING',
                      'IN_PROGRESS'
                  )
                ORDER BY
                    a.appointment_date ASC,
                    q.token_number ASC
            """, (doctor_id,))

            queue = cursor.fetchall()

        for entry in queue:

            if entry.get("appointment_time") is not None:
                entry["appointment_time"] = str(
                    entry["appointment_time"]
                )

            if entry.get("appointment_date") is not None:
                entry["appointment_date"] = str(
                    entry["appointment_date"]
                )

        return jsonify({
            "success": True,
            "doctor_id": doctor_id,
            "queue": queue
        }), 200

    except Exception as e:

        print(
            "GET DOCTOR QUEUE ERROR:",
            repr(e)
        )

        return jsonify({
            "success": False,
            "message": "Unable to fetch doctor queue"
        }), 500

    finally:

        if conn:
            conn.close()


# ============================================================
# GET PATIENT QUEUE
# PATIENT ONLY
# ============================================================

@queue_bp.route(
    "/api/queue/patient/<patient_id>",
    methods=["GET"]
)
@patient_required
def get_patient_queue(patient_id):

    if request.patient["patient_id"] != patient_id:
        return jsonify({
            "success": False,
            "message": (
                "You are not authorized to access "
                "this patient's queue"
            )
        }), 403

    conn = None

    try:
        conn = get_connection()

        with conn.cursor() as cursor:

            cursor.execute("""
                SELECT
                    q.queue_id,
                    q.appointment_id,
                    q.token_number,
                    q.queue_status,
                    q.estimated_wait_minutes,
                    a.doctor_id,
                    d.name AS doctor_name,
                    d.specialization,
                    a.appointment_date,
                    a.appointment_time
                FROM queue_entries q
                INNER JOIN appointments a
                    ON q.appointment_id = a.appointment_id
                INNER JOIN doctors d
                    ON a.doctor_id = d.doctor_id
                WHERE a.patient_id = %s
                ORDER BY
                    a.appointment_date DESC,
                    a.appointment_time DESC
            """, (patient_id,))

            queue_entries = cursor.fetchall()

        for entry in queue_entries:

            if entry.get("appointment_time") is not None:
                entry["appointment_time"] = str(
                    entry["appointment_time"]
                )

            if entry.get("appointment_date") is not None:
                entry["appointment_date"] = str(
                    entry["appointment_date"]
                )

        return jsonify({
            "success": True,
            "patient_id": patient_id,
            "queue": queue_entries
        }), 200

    except Exception as e:

        print(
            "GET PATIENT QUEUE ERROR:",
            repr(e)
        )

        return jsonify({
            "success": False,
            "message": "Unable to fetch patient queue"
        }), 500

    finally:

        if conn:
            conn.close()


# ============================================================
# GET QUEUE SUMMARY
# PATIENT ONLY
# ============================================================

@queue_bp.route(
    "/api/queue/<appointment_id>/summary",
    methods=["GET"]
)
@patient_required
def get_queue_summary(appointment_id):

    conn = None

    try:
        conn = get_connection()

        with conn.cursor() as cursor:

            # ------------------------------------------------
            # Get patient's queue entry
            # ------------------------------------------------

            cursor.execute("""
                SELECT
                    q.queue_id,
                    q.appointment_id,
                    q.token_number,
                    q.queue_status,
                    q.estimated_wait_minutes,
                    a.patient_id,
                    a.doctor_id,
                    a.appointment_date,
                    a.appointment_time,
                    d.name AS doctor_name,
                    d.specialization
                FROM queue_entries q
                INNER JOIN appointments a
                    ON q.appointment_id = a.appointment_id
                INNER JOIN doctors d
                    ON a.doctor_id = d.doctor_id
                WHERE q.appointment_id = %s
            """, (appointment_id,))

            queue_entry = cursor.fetchone()

            if not queue_entry:
                return jsonify({
                    "success": False,
                    "message": "Queue entry not found"
                }), 404

            # ------------------------------------------------
            # Verify ownership
            # ------------------------------------------------

            if (
                queue_entry["patient_id"]
                != request.patient["patient_id"]
            ):
                return jsonify({
                    "success": False,
                    "message": (
                        "You are not authorized to "
                        "access this queue"
                    )
                }), 403

            doctor_id = queue_entry["doctor_id"]
            appointment_date = queue_entry["appointment_date"]
            my_token = queue_entry["token_number"]

            # ------------------------------------------------
            # Find current token
            # ------------------------------------------------

            cursor.execute("""
                SELECT
                    token_number
                FROM queue_entries q
                INNER JOIN appointments a
                    ON q.appointment_id = a.appointment_id
                WHERE a.doctor_id = %s
                  AND a.appointment_date = %s
                  AND q.queue_status = 'IN_PROGRESS'
                ORDER BY q.token_number ASC
                LIMIT 1
            """, (
                doctor_id,
                appointment_date
            ))

            current_entry = cursor.fetchone()

            if current_entry:

                current_token = current_entry["token_number"]

            else:

                cursor.execute("""
                    SELECT
                        COALESCE(
                            MAX(q.token_number),
                            0
                        ) AS current_token
                    FROM queue_entries q
                    INNER JOIN appointments a
                        ON q.appointment_id = a.appointment_id
                    WHERE a.doctor_id = %s
                      AND a.appointment_date = %s
                      AND q.queue_status = 'COMPLETED'
                """, (
                    doctor_id,
                    appointment_date
                ))

                current_result = cursor.fetchone()

                current_token = current_result["current_token"]

            # ------------------------------------------------
            # Patients ahead
            # ------------------------------------------------

            if queue_entry["queue_status"] in (
                "COMPLETED",
                "CANCELLED"
            ):

                patients_ahead = 0

            else:

                cursor.execute("""
                    SELECT
                        COUNT(*) AS patients_ahead
                    FROM queue_entries q
                    INNER JOIN appointments a
                        ON q.appointment_id = a.appointment_id
                    WHERE a.doctor_id = %s
                      AND a.appointment_date = %s
                      AND q.token_number < %s
                      AND q.queue_status IN (
                          'WAITING',
                          'IN_PROGRESS'
                      )
                """, (
                    doctor_id,
                    appointment_date,
                    my_token
                ))

                ahead_result = cursor.fetchone()

                patients_ahead = ahead_result["patients_ahead"]

            # ------------------------------------------------
            # Dynamic estimated wait
            # ------------------------------------------------

            if queue_entry["queue_status"] == "WAITING":

                estimated_wait_minutes = (
                    patients_ahead
                    * AVERAGE_CONSULTATION_MINUTES
                )

            else:

                estimated_wait_minutes = 0

        return jsonify({
            "success": True,
            "appointment_id": appointment_id,
            "doctor_id": doctor_id,
            "doctor_name": queue_entry["doctor_name"],
            "specialization": queue_entry["specialization"],
            "appointment_date": str(appointment_date),
            "appointment_time": str(
                queue_entry["appointment_time"]
            ),
            "token_number": my_token,
            "current_token": current_token,
            "patients_ahead": patients_ahead,
            "estimated_wait_minutes": estimated_wait_minutes,
            "queue_status": queue_entry["queue_status"]
        }), 200

    except Exception as e:

        print(
            "GET QUEUE SUMMARY ERROR:",
            repr(e)
        )

        return jsonify({
            "success": False,
            "message": "Unable to fetch queue summary"
        }), 500

    finally:

        if conn:
            conn.close()


# ============================================================
# CALL NEXT PATIENT
# ADMIN ONLY
#
# appointment_date is supplied by admin so the queue can be
# managed for a specific appointment date.
# ============================================================

@queue_bp.route(
    "/api/queue/doctor/<int:doctor_id>/call-next",
    methods=["PUT"]
)
@admin_required
def call_next_patient(doctor_id):

    data = request.get_json(silent=True) or {}

    queue_date = data.get("appointment_date")

    if not queue_date:
        return jsonify({
            "success": False,
            "message": "appointment_date is required"
        }), 400

    conn = None

    try:
        conn = get_connection()

        with conn.cursor() as cursor:

            # ------------------------------------------------
            # Find active doctor
            # ------------------------------------------------

            cursor.execute("""
                SELECT
                    doctor_id,
                    name
                FROM doctors
                WHERE doctor_id = %s
                  AND status = 'ACTIVE'
            """, (doctor_id,))

            doctor = cursor.fetchone()

            if not doctor:
                return jsonify({
                    "success": False,
                    "message": "Active doctor not found"
                }), 404

            # ------------------------------------------------
            # Check if another patient is already IN_PROGRESS
            # ------------------------------------------------

            cursor.execute("""
                SELECT
                    q.queue_id,
                    q.token_number,
                    q.appointment_id
                FROM queue_entries q
                INNER JOIN appointments a
                    ON q.appointment_id = a.appointment_id
                WHERE a.doctor_id = %s
                  AND a.appointment_date = %s
                  AND q.queue_status = 'IN_PROGRESS'
                LIMIT 1
            """, (
                doctor_id,
                queue_date
            ))

            current_patient = cursor.fetchone()

            if current_patient:
                return jsonify({
                    "success": False,
                    "message": (
                        "A patient is already "
                        "in progress"
                    ),
                    "current_patient": current_patient
                }), 409

            # ------------------------------------------------
            # Find next WAITING patient
            # ------------------------------------------------

            cursor.execute("""
                SELECT
                    q.queue_id,
                    q.appointment_id,
                    q.token_number,
                    a.patient_id,
                    p.name AS patient_name,
                    a.appointment_date,
                    a.appointment_time
                FROM queue_entries q
                INNER JOIN appointments a
                    ON q.appointment_id = a.appointment_id
                INNER JOIN patients p
                    ON a.patient_id = p.patient_id
                WHERE a.doctor_id = %s
                  AND a.appointment_date = %s
                  AND q.queue_status = 'WAITING'
                ORDER BY
                    q.token_number ASC
                LIMIT 1
            """, (
                doctor_id,
                queue_date
            ))

            next_patient = cursor.fetchone()

            if not next_patient:
                return jsonify({
                    "success": False,
                    "message": "No waiting patients in the queue"
                }), 404

            queue_id = next_patient["queue_id"]
            appointment_id = next_patient["appointment_id"]

            # ------------------------------------------------
            # Move queue to IN_PROGRESS
            # ------------------------------------------------

            cursor.execute("""
                UPDATE queue_entries
                SET
                    queue_status = 'IN_PROGRESS',
                    estimated_wait_minutes = 0
                WHERE queue_id = %s
            """, (queue_id,))

            # ------------------------------------------------
            # Synchronize appointment
            # ------------------------------------------------

            cursor.execute("""
                UPDATE appointments
                SET
                    status = 'IN_PROGRESS'
                WHERE appointment_id = %s
            """, (appointment_id,))

            # ------------------------------------------------
            # Appointment history
            # ------------------------------------------------

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
                    'WAITING',
                    'IN_PROGRESS',
                    %s,
                    'Patient called by admin'
                )
            """, (
                appointment_id,
                request.admin["username"]
            ))

            conn.commit()

        return jsonify({
            "success": True,
            "message": "Next patient called successfully",
            "queue": {
                "queue_id": queue_id,
                "appointment_id": appointment_id,
                "token_number": next_patient["token_number"],
                "patient_id": next_patient["patient_id"],
                "patient_name": next_patient["patient_name"],
                "queue_status": "IN_PROGRESS"
            }
        }), 200

    except Exception as e:

        if conn:
            conn.rollback()

        print(
            "CALL NEXT PATIENT ERROR:",
            repr(e)
        )

        return jsonify({
            "success": False,
            "message": "Unable to call next patient"
        }), 500

    finally:

        if conn:
            conn.close()


# ============================================================
# UPDATE QUEUE STATUS
# ADMIN ONLY
# ============================================================

@queue_bp.route(
    "/api/queue/<int:queue_id>/status",
    methods=["PUT"]
)
@admin_required
def update_queue_status(queue_id):

    data = request.get_json(silent=True)

    if not data:
        return jsonify({
            "success": False,
            "message": "Request body is required"
        }), 400

    new_status = str(
        data.get("status", "")
    ).strip().upper()

    allowed_statuses = {
        "WAITING",
        "IN_PROGRESS",
        "COMPLETED",
        "CANCELLED"
    }

    if new_status not in allowed_statuses:
        return jsonify({
            "success": False,
            "message": "Invalid queue status"
        }), 400

    conn = None

    try:
        conn = get_connection()

        with conn.cursor() as cursor:

            # ------------------------------------------------
            # Find queue entry
            # ------------------------------------------------

            cursor.execute("""
                SELECT
                    q.queue_id,
                    q.appointment_id,
                    q.queue_status,
                    a.status AS appointment_status,
                    a.doctor_id,
                    a.appointment_date
                FROM queue_entries q
                INNER JOIN appointments a
                    ON q.appointment_id = a.appointment_id
                WHERE q.queue_id = %s
            """, (queue_id,))

            queue_entry = cursor.fetchone()

            if not queue_entry:
                return jsonify({
                    "success": False,
                    "message": "Queue entry not found"
                }), 404

            old_status = queue_entry["queue_status"]

            # ------------------------------------------------
            # Valid queue transitions
            # ------------------------------------------------

            allowed_transitions = {
                "WAITING": [
                    "IN_PROGRESS",
                    "CANCELLED"
                ],
                "IN_PROGRESS": [
                    "COMPLETED"
                ],
                "COMPLETED": [],
                "CANCELLED": []
            }

            if new_status not in allowed_transitions.get(
                old_status,
                []
            ):
                return jsonify({
                    "success": False,
                    "message": (
                        f"Invalid queue status transition: "
                        f"{old_status} -> {new_status}"
                    )
                }), 400

            # ------------------------------------------------
            # Prevent two patients being IN_PROGRESS
            # ------------------------------------------------

            if new_status == "IN_PROGRESS":

                cursor.execute("""
                    SELECT
                        q.queue_id
                    FROM queue_entries q
                    INNER JOIN appointments a
                        ON q.appointment_id = a.appointment_id
                    WHERE a.doctor_id = %s
                      AND a.appointment_date = %s
                      AND q.queue_status = 'IN_PROGRESS'
                      AND q.queue_id != %s
                    LIMIT 1
                """, (
                    queue_entry["doctor_id"],
                    queue_entry["appointment_date"],
                    queue_id
                ))

                existing_in_progress = cursor.fetchone()

                if existing_in_progress:
                    return jsonify({
                        "success": False,
                        "message": (
                            "Another patient is already "
                            "in progress for this doctor"
                        )
                    }), 409

            # ------------------------------------------------
            # Update queue
            # ------------------------------------------------

            cursor.execute("""
                UPDATE queue_entries
                SET
                    queue_status = %s,
                    estimated_wait_minutes = %s
                WHERE queue_id = %s
            """, (
                new_status,
                (
                    AVERAGE_CONSULTATION_MINUTES
                    if new_status == "WAITING"
                    else 0
                ),
                queue_id
            ))

            appointment_id = queue_entry["appointment_id"]

            # ------------------------------------------------
            # Synchronize appointment
            # ------------------------------------------------

            appointment_status_map = {
                "IN_PROGRESS": "IN_PROGRESS",
                "COMPLETED": "COMPLETED",
                "CANCELLED": "CANCELLED"
            }

            if new_status in appointment_status_map:

                appointment_status = (
                    appointment_status_map[new_status]
                )

                cursor.execute("""
                    UPDATE appointments
                    SET
                        status = %s
                    WHERE appointment_id = %s
                """, (
                    appointment_status,
                    appointment_id
                ))

                # ------------------------------------------------
                # Appointment history
                # ------------------------------------------------

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
                    queue_entry["appointment_status"],
                    appointment_status,
                    request.admin["username"],
                    f"Queue status changed to {new_status}"
                ))

            conn.commit()

        return jsonify({
            "success": True,
            "message": "Queue status updated successfully",
            "queue_id": queue_id,
            "appointment_id": appointment_id,
            "old_status": old_status,
            "new_status": new_status
        }), 200

    except Exception as e:

        if conn:
            conn.rollback()

        print(
            "UPDATE QUEUE STATUS ERROR:",
            repr(e)
        )

        return jsonify({
            "success": False,
            "message": "Unable to update queue status"
        }), 500

    finally:

        if conn:
            conn.close()