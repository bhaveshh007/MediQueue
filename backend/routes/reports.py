from flask import Blueprint, jsonify
from database.connection import get_connection
from utils.auth import admin_required


reports_bp = Blueprint("reports", __name__)


# ============================================================
# DASHBOARD REPORT
# ADMIN ONLY
# ============================================================

@reports_bp.route(
    "/api/reports/dashboard",
    methods=["GET"]
)
@admin_required
def dashboard_report():

    conn = None

    try:
        conn = get_connection()

        with conn.cursor() as cursor:

            # ------------------------------------------------
            # Total patients
            # ------------------------------------------------

            cursor.execute("""
                SELECT
                    COUNT(*) AS total_patients
                FROM patients
            """)

            patients = cursor.fetchone()["total_patients"]

            # ------------------------------------------------
            # Active doctors
            # ------------------------------------------------

            cursor.execute("""
                SELECT
                    COUNT(*) AS total_doctors
                FROM doctors
                WHERE status = 'ACTIVE'
            """)

            doctors = cursor.fetchone()["total_doctors"]

            # ------------------------------------------------
            # Active departments
            # ------------------------------------------------

            cursor.execute("""
                SELECT
                    COUNT(*) AS total_departments
                FROM departments
                WHERE status = 'ACTIVE'
            """)

            departments = cursor.fetchone()[
                "total_departments"
            ]

            # ------------------------------------------------
            # Total appointments
            # ------------------------------------------------

            cursor.execute("""
                SELECT
                    COUNT(*) AS total_appointments
                FROM appointments
            """)

            appointments = cursor.fetchone()[
                "total_appointments"
            ]

            # ------------------------------------------------
            # Pending appointments
            # ------------------------------------------------

            cursor.execute("""
                SELECT
                    COUNT(*) AS pending_appointments
                FROM appointments
                WHERE status IN (
                    'BOOKED',
                    'CONFIRMED',
                    'WAITING'
                )
            """)

            pending = cursor.fetchone()[
                "pending_appointments"
            ]

            # ------------------------------------------------
            # Completed appointments
            # ------------------------------------------------

            cursor.execute("""
                SELECT
                    COUNT(*) AS completed_appointments
                FROM appointments
                WHERE status = 'COMPLETED'
            """)

            completed = cursor.fetchone()[
                "completed_appointments"
            ]

        return jsonify({
            "success": True,
            "dashboard": {
                "total_patients": patients,
                "total_doctors": doctors,
                "total_departments": departments,
                "total_appointments": appointments,
                "pending_appointments": pending,
                "completed_appointments": completed
            }
        }), 200

    except Exception as e:

        print(
            "DASHBOARD REPORT ERROR:",
            repr(e)
        )

        return jsonify({
            "success": False,
            "message": (
                "Unable to generate "
                "dashboard report"
            )
        }), 500

    finally:

        if conn:
            conn.close()


# ============================================================
# DETAILED SUMMARY REPORT
# ADMIN ONLY
# ============================================================

@reports_bp.route(
    "/api/reports/summary",
    methods=["GET"]
)
@admin_required
def summary_report():

    conn = None

    try:
        conn = get_connection()

        with conn.cursor() as cursor:

            # ------------------------------------------------
            # Appointment status breakdown
            # ------------------------------------------------

            cursor.execute("""
                SELECT
                    status,
                    COUNT(*) AS total
                FROM appointments
                GROUP BY status
                ORDER BY total DESC
            """)

            status_rows = cursor.fetchall()

            appointment_status = [
                {
                    "status": row["status"],
                    "total": row["total"]
                }
                for row in status_rows
            ]

            # ------------------------------------------------
            # Department-wise appointments
            # ------------------------------------------------

            cursor.execute("""
                SELECT
                    dep.department_name,
                    COUNT(a.appointment_id) AS total
                FROM departments dep

                LEFT JOIN doctors d
                    ON dep.department_id =
                       d.department_id

                LEFT JOIN appointments a
                    ON d.doctor_id =
                       a.doctor_id

                WHERE dep.status = 'ACTIVE'

                GROUP BY
                    dep.department_id,
                    dep.department_name

                ORDER BY total DESC
            """)

            department_rows = cursor.fetchall()

            department_report = [
                {
                    "department_name":
                        row["department_name"],
                    "total":
                        row["total"]
                }
                for row in department_rows
            ]

            # ------------------------------------------------
            # Doctor-wise appointments
            # ------------------------------------------------

            cursor.execute("""
                SELECT
                    d.doctor_id,
                    d.name AS doctor_name,
                    d.specialization,
                    COUNT(a.appointment_id) AS total

                FROM doctors d

                LEFT JOIN appointments a
                    ON d.doctor_id =
                       a.doctor_id

                WHERE d.status = 'ACTIVE'

                GROUP BY
                    d.doctor_id,
                    d.name,
                    d.specialization

                ORDER BY total DESC
            """)

            doctor_rows = cursor.fetchall()

            doctor_report = [
                {
                    "doctor_id":
                        row["doctor_id"],

                    "doctor_name":
                        row["doctor_name"],

                    "specialization":
                        row["specialization"],

                    "total":
                        row["total"]
                }
                for row in doctor_rows
            ]

        return jsonify({
            "success": True,
            "reports": {

                "appointment_status":
                    appointment_status,

                "department_report":
                    department_report,

                "doctor_report":
                    doctor_report
            }
        }), 200

    except Exception as e:

        print(
            "SUMMARY REPORT ERROR:",
            repr(e)
        )

        return jsonify({
            "success": False,
            "message": (
                "Unable to generate "
                "summary report"
            )
        }), 500

    finally:

        if conn:
            conn.close()