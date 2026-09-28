from flask import Blueprint, request, jsonify
from database.connection import get_connection
from utils.auth import admin_required
from datetime import datetime

schedules_bp = Blueprint("schedules", __name__)


# ============================================================
# GET ALL SCHEDULES
# Public endpoint — needed by patient portal
# ============================================================

@schedules_bp.route("/api/schedules", methods=["GET"])
def get_schedules():
    conn = None

    try:
        conn = get_connection()

        with conn.cursor() as cursor:
            cursor.execute(
                """
                SELECT
                    s.schedule_id,
                    s.doctor_id,
                    d.name AS doctor_name,
                    d.specialization,
                    s.schedule_date,
                    s.start_time,
                    s.end_time,
                    s.slot_duration
                FROM doctor_schedules s
                INNER JOIN doctors d
                    ON s.doctor_id = d.doctor_id
                WHERE d.status = 'ACTIVE'
                ORDER BY s.schedule_date, s.start_time
                """
            )

            schedules = cursor.fetchall()

        # Convert date/time objects to JSON-safe strings
        for schedule in schedules:
            if schedule.get("schedule_date"):
                schedule["schedule_date"] = schedule[
                    "schedule_date"
                ].isoformat()

            if schedule.get("start_time"):
                schedule["start_time"] = str(
                    schedule["start_time"]
                )

            if schedule.get("end_time"):
                schedule["end_time"] = str(
                    schedule["end_time"]
                )

        return jsonify({
            "success": True,
            "schedules": schedules
        }), 200

    except Exception as e:
        print("GET SCHEDULES ERROR:", repr(e))

        return jsonify({
            "success": False,
            "message": "Unable to fetch schedules"
        }), 500

    finally:
        if conn:
            conn.close()


# ============================================================
# GET DOCTOR SCHEDULES BY DOCTOR ID
# Public endpoint
# ============================================================

@schedules_bp.route(
    "/api/schedules/doctor/<int:doctor_id>",
    methods=["GET"]
)
def get_doctor_schedules(doctor_id):
    conn = None

    try:
        conn = get_connection()

        with conn.cursor() as cursor:
            cursor.execute(
                """
                SELECT
                    s.schedule_id,
                    s.doctor_id,
                    d.name AS doctor_name,
                    d.specialization,
                    s.schedule_date,
                    s.start_time,
                    s.end_time,
                    s.slot_duration
                FROM doctor_schedules s
                INNER JOIN doctors d
                    ON s.doctor_id = d.doctor_id
                WHERE s.doctor_id = %s
                  AND d.status = 'ACTIVE'
                ORDER BY
                    s.schedule_date,
                    s.start_time
                """,
                (doctor_id,)
            )

            schedules = cursor.fetchall()

        # Convert date/time objects to JSON-safe strings
        for schedule in schedules:
            if schedule.get("schedule_date"):
                schedule["schedule_date"] = schedule[
                    "schedule_date"
                ].isoformat()

            if schedule.get("start_time"):
                schedule["start_time"] = str(
                    schedule["start_time"]
                )

            if schedule.get("end_time"):
                schedule["end_time"] = str(
                    schedule["end_time"]
                )

        return jsonify({
            "success": True,
            "doctor_id": doctor_id,
            "count": len(schedules),
            "schedules": schedules
        }), 200

    except Exception as e:
        print(
            "GET DOCTOR SCHEDULES ERROR:",
            repr(e)
        )

        return jsonify({
            "success": False,
            "message": "Unable to fetch doctor schedules"
        }), 500

    finally:
        if conn:
            conn.close()


# ============================================================
# CREATE DOCTOR SCHEDULE
# Admin only
# ============================================================

@schedules_bp.route("/api/schedules", methods=["POST"])
@admin_required
def create_schedule():
    data = request.get_json(silent=True)

    if not data:
        return jsonify({
            "success": False,
            "message": "Request body is required"
        }), 400

    doctor_id = data.get("doctor_id")
    schedule_date = str(data.get("schedule_date", "")).strip()
    start_time = str(data.get("start_time", "")).strip()
    end_time = str(data.get("end_time", "")).strip()
    slot_duration = data.get("slot_duration") or 15

    # --------------------------------------------------------
    # Validate doctor ID
    # --------------------------------------------------------
    try:
        doctor_id = int(doctor_id)
    except (TypeError, ValueError):
        return jsonify({
            "success": False,
            "message": "Valid doctor_id is required"
        }), 400

    # --------------------------------------------------------
    # Validate slot duration
    # --------------------------------------------------------
    try:
        slot_duration = int(slot_duration)
    except (TypeError, ValueError):
        return jsonify({
            "success": False,
            "message": "Valid slot_duration is required"
        }), 400

    if slot_duration <= 0:
        return jsonify({
            "success": False,
            "message": "Slot duration must be greater than zero"
        }), 400

    if slot_duration > 480:
        return jsonify({
            "success": False,
            "message": "Slot duration cannot exceed 480 minutes"
        }), 400

    # --------------------------------------------------------
    # Validate date and time formats
    # --------------------------------------------------------
    try:
        schedule_date_obj = datetime.strptime(
            schedule_date,
            "%Y-%m-%d"
        ).date()
    except ValueError:
        return jsonify({
            "success": False,
            "message": "Invalid date format. Use YYYY-MM-DD"
        }), 400

    start_time_obj = None
    for fmt in ("%H:%M", "%H:%M:%S"):
        try:
            start_time_obj = datetime.strptime(start_time, fmt).time()
            break
        except ValueError:
            pass

    end_time_obj = None
    for fmt in ("%H:%M", "%H:%M:%S"):
        try:
            end_time_obj = datetime.strptime(end_time, fmt).time()
            break
        except ValueError:
            pass

    if not start_time_obj or not end_time_obj:
        return jsonify({
            "success": False,
            "message": "Invalid time format. Use HH:MM (e.g. 09:00)"
        }), 400

    # --------------------------------------------------------
    # Validate schedule time range
    # --------------------------------------------------------
    if start_time_obj >= end_time_obj:
        return jsonify({
            "success": False,
            "message": "Start time must be before end time"
        }), 400

    # --------------------------------------------------------
    # Make sure at least one complete slot fits
    # --------------------------------------------------------
    start_minutes = start_time_obj.hour * 60 + start_time_obj.minute
    end_minutes = end_time_obj.hour * 60 + end_time_obj.minute
    total_minutes = end_minutes - start_minutes

    if slot_duration > total_minutes:
        return jsonify({
            "success": False,
            "message": "Slot duration must be shorter than the schedule duration"
        }), 400

    # --------------------------------------------------------
    # Connect to database
    # --------------------------------------------------------
    conn = None

    try:
        conn = get_connection()

        with conn.cursor() as cursor:
            # ------------------------------------------------
            # Verify active doctor
            # ------------------------------------------------
            cursor.execute(
                """
                SELECT
                    doctor_id,
                    name,
                    specialization,
                    status
                FROM doctors
                WHERE doctor_id = %s
                """,
                (doctor_id,)
            )

            doctor = cursor.fetchone()

            if not doctor:
                return jsonify({
                    "success": False,
                    "message": "Doctor not found"
                }), 404

            if doctor.get("status") != "ACTIVE":
                return jsonify({
                    "success": False,
                    "message": "Cannot create schedule for an inactive doctor"
                }), 400

            # ------------------------------------------------
            # Check duplicate schedule
            # ------------------------------------------------
            cursor.execute(
                """
                SELECT schedule_id
                FROM doctor_schedules
                WHERE doctor_id = %s
                  AND schedule_date = %s
                  AND start_time = %s
                  AND end_time = %s
                LIMIT 1
                """,
                (
                    doctor_id,
                    schedule_date_obj,
                    start_time_obj,
                    end_time_obj
                )
            )

            existing_schedule = cursor.fetchone()

            if existing_schedule:
                return jsonify({
                    "success": False,
                    "message": "This doctor schedule already exists"
                }), 409

            # ------------------------------------------------
            # Create schedule
            # ------------------------------------------------
            cursor.execute(
                """
                INSERT INTO doctor_schedules
                (
                    doctor_id,
                    schedule_date,
                    start_time,
                    end_time,
                    slot_duration
                )
                VALUES
                (
                    %s,
                    %s,
                    %s,
                    %s,
                    %s
                )
                """,
                (
                    doctor_id,
                    schedule_date_obj,
                    start_time_obj,
                    end_time_obj,
                    slot_duration
                )
            )

            schedule_id = cursor.lastrowid
            conn.commit()

        return jsonify({
            "success": True,
            "message": "Doctor schedule created successfully",
            "schedule": {
                "schedule_id": schedule_id,
                "doctor_id": doctor_id,
                "doctor_name": doctor["name"],
                "specialization": doctor["specialization"],
                "schedule_date": str(schedule_date_obj),
                "start_time": str(start_time_obj),
                "end_time": str(end_time_obj),
                "slot_duration": slot_duration,
                "status": "ACTIVE"
            }
        }), 201

    except Exception as e:
        if conn:
            conn.rollback()

        print("CREATE SCHEDULE ERROR:", repr(e))

        return jsonify({
            "success": False,
            "message": "Unable to create doctor schedule"
        }), 500

    finally:
        if conn:
            conn.close()