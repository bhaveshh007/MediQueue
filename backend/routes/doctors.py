from flask import Blueprint, request, jsonify
from database.connection import get_connection
from utils.auth import admin_required

doctors_bp = Blueprint("doctors", __name__)


# ============================================================
# GET ALL DOCTORS
# Public endpoint — needed by patient portal
# ============================================================

@doctors_bp.route("/api/doctors", methods=["GET"])
def get_doctors():
    conn = None

    try:
        conn = get_connection()

        with conn.cursor() as cursor:
            cursor.execute(
                """
                SELECT
                    d.doctor_id,
                    d.name,
                    d.specialization,
                    d.department_id,
                    dep.department_name,
                    d.status
                FROM doctors d
                INNER JOIN departments dep
                    ON d.department_id = dep.department_id
                ORDER BY d.name
                """
            )

            doctors = cursor.fetchall()

        return jsonify({
            "success": True,
            "doctors": doctors
        }), 200

    except Exception as e:
        print("GET DOCTORS ERROR:", repr(e))

        return jsonify({
            "success": False,
            "message": "Unable to fetch doctors"
        }), 500

    finally:
        if conn:
            conn.close()


# ============================================================
# CREATE DOCTOR
# Admin only
# ============================================================

@doctors_bp.route("/api/doctors", methods=["POST"])
@admin_required
def create_doctor():
    data = request.get_json(silent=True)

    if not data:
        return jsonify({
            "success": False,
            "message": "Request body is required"
        }), 400

    name = str(data.get("name", "")).strip()
    specialization = str(data.get("specialization", "")).strip()
    department_id = data.get("department_id")

    if not name:
        return jsonify({
            "success": False,
            "message": "Doctor name is required"
        }), 400

    if len(name) > 100:
        return jsonify({
            "success": False,
            "message": "Doctor name is too long"
        }), 400

    if not specialization:
        return jsonify({
            "success": False,
            "message": "Specialization is required"
        }), 400

    if len(specialization) > 100:
        return jsonify({
            "success": False,
            "message": "Specialization is too long"
        }), 400

    try:
        department_id = int(department_id)
    except (TypeError, ValueError):
        return jsonify({
            "success": False,
            "message": "Valid department_id is required"
        }), 400

    conn = None

    try:
        conn = get_connection()

        with conn.cursor() as cursor:

            # ------------------------------------------------
            # Verify active department
            # ------------------------------------------------
            cursor.execute(
                """
                SELECT
                    department_id,
                    department_name
                FROM departments
                WHERE department_id = %s
                  AND status = 'ACTIVE'
                """,
                (department_id,)
            )

            department = cursor.fetchone()

            if not department:
                return jsonify({
                    "success": False,
                    "message": "Active department not found"
                }), 404

            # ------------------------------------------------
            # Check duplicate doctor
            # ------------------------------------------------
            cursor.execute(
                """
                SELECT doctor_id
                FROM doctors
                WHERE name = %s
                  AND department_id = %s
                LIMIT 1
                """,
                (name, department_id)
            )

            existing = cursor.fetchone()

            if existing:
                return jsonify({
                    "success": False,
                    "message": "Doctor already exists in this department"
                }), 409

            # ------------------------------------------------
            # Create doctor
            # ------------------------------------------------
            cursor.execute(
                """
                INSERT INTO doctors
                (
                    name,
                    specialization,
                    department_id
                )
                VALUES
                (
                    %s,
                    %s,
                    %s
                )
                """,
                (name, specialization, department_id)
            )

            doctor_id = cursor.lastrowid
            conn.commit()

        return jsonify({
            "success": True,
            "message": "Doctor created successfully",
            "doctor": {
                "doctor_id": doctor_id,
                "name": name,
                "specialization": specialization,
                "department_id": department_id,
                "department_name": department["department_name"],
                "status": "ACTIVE"
            }
        }), 201

    except Exception as e:
        if conn:
            conn.rollback()

        print("CREATE DOCTOR ERROR:", repr(e))

        return jsonify({
            "success": False,
            "message": "Unable to create doctor"
        }), 500

    finally:
        if conn:
            conn.close()


# ============================================================
# UPDATE DOCTOR
# Admin only
# ============================================================

@doctors_bp.route("/api/doctors/<int:doctor_id>", methods=["PUT"])
@admin_required
def update_doctor(doctor_id):
    data = request.get_json(silent=True)

    if not data:
        return jsonify({
            "success": False,
            "message": "Request body is required"
        }), 400

    name = str(data.get("name", "")).strip()
    specialization = str(data.get("specialization", "")).strip()
    department_id = data.get("department_id")

    if not name:
        return jsonify({
            "success": False,
            "message": "Doctor name is required"
        }), 400

    if len(name) > 100:
        return jsonify({
            "success": False,
            "message": "Doctor name is too long"
        }), 400

    if not specialization:
        return jsonify({
            "success": False,
            "message": "Specialization is required"
        }), 400

    if len(specialization) > 100:
        return jsonify({
            "success": False,
            "message": "Specialization is too long"
        }), 400

    try:
        department_id = int(department_id)
    except (TypeError, ValueError):
        return jsonify({
            "success": False,
            "message": "Valid department_id is required"
        }), 400

    conn = None

    try:
        conn = get_connection()

        with conn.cursor() as cursor:

            # Check doctor exists
            cursor.execute(
                """
                SELECT doctor_id
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

            # Check department exists and is active
            cursor.execute(
                """
                SELECT
                    department_id,
                    department_name
                FROM departments
                WHERE department_id = %s
                  AND status = 'ACTIVE'
                """,
                (department_id,)
            )

            department = cursor.fetchone()

            if not department:
                return jsonify({
                    "success": False,
                    "message": "Active department not found"
                }), 404

            # Prevent duplicate doctor in same department
            cursor.execute(
                """
                SELECT doctor_id
                FROM doctors
                WHERE name = %s
                  AND department_id = %s
                  AND doctor_id <> %s
                LIMIT 1
                """,
                (name, department_id, doctor_id)
            )

            duplicate = cursor.fetchone()

            if duplicate:
                return jsonify({
                    "success": False,
                    "message": "Doctor already exists in this department"
                }), 409

            # Update doctor
            cursor.execute(
                """
                UPDATE doctors
                SET
                    name = %s,
                    specialization = %s,
                    department_id = %s
                WHERE doctor_id = %s
                """,
                (name, specialization, department_id, doctor_id)
            )

            conn.commit()

        return jsonify({
            "success": True,
            "message": "Doctor updated successfully",
            "doctor": {
                "doctor_id": doctor_id,
                "name": name,
                "specialization": specialization,
                "department_id": department_id,
                "department_name": department["department_name"]
            }
        }), 200

    except Exception as e:
        if conn:
            conn.rollback()

        print("UPDATE DOCTOR ERROR:", repr(e))

        return jsonify({
            "success": False,
            "message": "Unable to update doctor"
        }), 500

    finally:
        if conn:
            conn.close()


# ============================================================
# UPDATE DOCTOR STATUS
# Admin only
# ============================================================

@doctors_bp.route("/api/doctors/<int:doctor_id>/status", methods=["PUT"])
@admin_required
def update_doctor_status(doctor_id):
    data = request.get_json(silent=True)

    if not data:
        return jsonify({
            "success": False,
            "message": "Request body is required"
        }), 400

    status = str(data.get("status", "")).strip().upper()

    if status not in ("ACTIVE", "INACTIVE"):
        return jsonify({
            "success": False,
            "message": "Status must be ACTIVE or INACTIVE"
        }), 400

    conn = None

    try:
        conn = get_connection()

        with conn.cursor() as cursor:

            cursor.execute(
                """
                SELECT doctor_id
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

            cursor.execute(
                """
                UPDATE doctors
                SET status = %s
                WHERE doctor_id = %s
                """,
                (status, doctor_id)
            )

            conn.commit()

        return jsonify({
            "success": True,
            "message": f"Doctor status changed to {status}",
            "doctor_id": doctor_id,
            "status": status
        }), 200

    except Exception as e:
        if conn:
            conn.rollback()

        print("UPDATE DOCTOR STATUS ERROR:", repr(e))

        return jsonify({
            "success": False,
            "message": "Unable to update doctor status"
        }), 500

    finally:
        if conn:
            conn.close()