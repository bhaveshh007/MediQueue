from flask import Blueprint, request, jsonify
from database.connection import get_connection
from utils.auth import admin_required

departments_bp = Blueprint("departments", __name__)


# ============================================================
# GET ALL DEPARTMENTS
# Public endpoint — needed by patient portal
# ============================================================

@departments_bp.route("/api/departments", methods=["GET"])
def get_departments():
    conn = None

    try:
        conn = get_connection()

        with conn.cursor() as cursor:
            cursor.execute(
                """
                SELECT
                    department_id,
                    department_name,
                    description,
                    status
                FROM departments
                ORDER BY department_name
                """
            )

            departments = cursor.fetchall()

        return jsonify({
            "success": True,
            "departments": departments
        }), 200

    except Exception as e:
        print("GET DEPARTMENTS ERROR:", repr(e))

        return jsonify({
            "success": False,
            "message": "Unable to fetch departments"
        }), 500

    finally:
        if conn:
            conn.close()


# ============================================================
# CREATE DEPARTMENT
# Admin only
# ============================================================

@departments_bp.route("/api/departments", methods=["POST"])
@admin_required
def create_department():

    data = request.get_json(silent=True)

    if not data:
        return jsonify({
            "success": False,
            "message": "Request body is required"
        }), 400

    department_name = str(
        data.get("department_name", "")
    ).strip()

    description = str(
        data.get("description", "")
    ).strip()

    if not department_name:
        return jsonify({
            "success": False,
            "message": "Department name is required"
        }), 400

    if len(department_name) > 100:
        return jsonify({
            "success": False,
            "message": "Department name is too long"
        }), 400

    if len(description) > 500:
        return jsonify({
            "success": False,
            "message": "Department description is too long"
        }), 400

    conn = None

    try:
        conn = get_connection()

        with conn.cursor() as cursor:

            # Check duplicate department
            cursor.execute(
                """
                SELECT department_id
                FROM departments
                WHERE department_name = %s
                """,
                (department_name,)
            )

            existing = cursor.fetchone()

            if existing:
                return jsonify({
                    "success": False,
                    "message": "Department already exists"
                }), 409

            # Create department
            cursor.execute(
                """
                INSERT INTO departments
                (
                    department_name,
                    description
                )
                VALUES
                (
                    %s,
                    %s
                )
                """,
                (
                    department_name,
                    description or None
                )
            )

            department_id = cursor.lastrowid

            conn.commit()

        return jsonify({
            "success": True,
            "message": "Department created successfully",
            "department_id": department_id,
            "department_name": department_name
        }), 201

    except Exception as e:

        if conn:
            conn.rollback()

        print("CREATE DEPARTMENT ERROR:", repr(e))

        return jsonify({
            "success": False,
            "message": "Unable to create department"
        }), 500

    finally:
        if conn:
            conn.close()