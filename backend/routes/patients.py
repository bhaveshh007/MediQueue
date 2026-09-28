from flask import Blueprint, request, jsonify
from database.connection import get_connection
import secrets
import re
import jwt
import os
from datetime import datetime, timedelta, timezone

patients_bp = Blueprint("patients", __name__)

JWT_SECRET = os.getenv("JWT_SECRET")

if not JWT_SECRET:
    raise RuntimeError(
        "JWT_SECRET is not configured. "
        "Set it in the .env file."
    )


def generate_patient_id():
    return "PAT-" + secrets.token_hex(4).upper()


@patients_bp.route("/api/patients/register", methods=["POST"])
def register_patient():
    data = request.get_json(silent=True)

    if not data:
        return jsonify({
            "success": False,
            "message": "Request body is required"
        }), 400

    name = data.get("name", "").strip()
    mobile = data.get("mobile", "").strip()
    email = data.get("email", "").strip()

    if not name:
        return jsonify({
            "success": False,
            "message": "Name is required"
        }), 400

    if len(name) > 100:
        return jsonify({
            "success": False,
            "message": "Name is too long"
        }), 400
    if not mobile.isdigit() or len(mobile) != 10:
        return jsonify({
        "success": False,
        "message": "Mobile number must contain exactly 10 digits."
    }), 400

    if email and not re.fullmatch(
        r"^[^@\s]+@[^@\s]+\.[^@\s]+$",
        email
    ):
        return jsonify({
            "success": False,
            "message": "Invalid email address"
        }), 400

    conn = None

    try:
        conn = get_connection()

        with conn.cursor() as cursor:
            cursor.execute(
                "SELECT patient_id FROM patients WHERE mobile = %s",
                (mobile,)
            )

            existing_patient = cursor.fetchone()

            if existing_patient:
                return jsonify({
                    "success": False,
                    "message": "A patient with this mobile number already exists",
                    "patient_id": existing_patient["patient_id"]
                }), 409

            patient_id = generate_patient_id()

            cursor.execute(
                """
                INSERT INTO patients
                (patient_id, name, mobile, email)
                VALUES (%s, %s, %s, %s)
                """,
                (patient_id, name, mobile, email or None)
            )

            conn.commit()

        return jsonify({
            "success": True,
            "message": "Patient registered successfully",
            "patient": {
                "patient_id": patient_id,
                "name": name,
                "mobile": mobile,
                "email": email or None
            }
        }), 201

    except Exception as e:
        if conn:
            conn.rollback()

        print("PATIENT REGISTRATION ERROR:", repr(e))

        return jsonify({
            "success": False,
            "message": "Unable to register patient"
        }), 500

    finally:
        if conn:
            conn.close()


@patients_bp.route("/api/patients/retrieve", methods=["POST"])
def retrieve_patient():
    data = request.get_json(silent=True)

    if not data:
        return jsonify({
            "success": False,
            "message": "Request body is required"
        }), 400

    patient_id = data.get("patient_id", "").strip()
    mobile = data.get("mobile", "").strip()

    if not patient_id:
        return jsonify({
            "success": False,
            "message": "Patient ID is required"
        }), 400

    if not re.fullmatch(r"[0-9]{10,15}", mobile):
        return jsonify({
            "success": False,
            "message": "Mobile number must contain 10 to 15 digits"
        }), 400

    conn = None

    try:
        conn = get_connection()

        with conn.cursor() as cursor:
            cursor.execute(
                """
                SELECT patient_id, name, mobile, email, created_at
                FROM patients
                WHERE patient_id = %s AND mobile = %s
                """,
                (patient_id, mobile)
            )

            patient = cursor.fetchone()

        if not patient:
            return jsonify({
                "success": False,
                "message": "Patient ID or mobile number is incorrect"
            }), 404

        if patient.get("created_at") is not None:
            patient["created_at"] = str(patient["created_at"])

        return jsonify({
            "success": True,
            "message": "Patient retrieved successfully",
            "patient": patient
        }), 200

    except Exception as e:
        print("PATIENT RETRIEVAL ERROR:", repr(e))

        return jsonify({
            "success": False,
            "message": "Unable to retrieve patient"
        }), 500

    finally:
        if conn:
            conn.close()


@patients_bp.route("/api/patients/verify", methods=["POST"])
def verify_patient():
    data = request.get_json(silent=True)

    if not data:
        return jsonify({
            "success": False,
            "message": "Request body is required"
        }), 400

    patient_id = data.get("patient_id", "").strip()
    mobile = data.get("mobile", "").strip()

    if not patient_id:
        return jsonify({
            "success": False,
            "message": "Patient ID is required"
        }), 400

    if not re.fullmatch(r"[0-9]{10,15}", mobile):
        return jsonify({
            "success": False,
            "message": "Mobile number must contain 10 to 15 digits"
        }), 400

    conn = None

    try:
        conn = get_connection()

        with conn.cursor() as cursor:
            cursor.execute(
                """
                SELECT patient_id, name, mobile, email
                FROM patients
                WHERE patient_id = %s AND mobile = %s
                """,
                (patient_id, mobile)
            )

            patient = cursor.fetchone()

        if not patient:
            return jsonify({
                "success": False,
                "message": "Patient ID or mobile number is incorrect"
            }), 401

        payload = {
            "patient_id": patient["patient_id"],
            "role": "PATIENT",
            "exp": datetime.now(timezone.utc) + timedelta(minutes=30)
        }

        token = jwt.encode(
            payload,
            JWT_SECRET,
            algorithm="HS256"
        )

        return jsonify({
            "success": True,
            "message": "Patient verification successful",
            "token": token,
            "patient": {
                "patient_id": patient["patient_id"],
                "name": patient["name"],
                "mobile": patient["mobile"],
                "email": patient["email"]
            }
        }), 200

    except Exception as e:
        print("PATIENT VERIFICATION ERROR:", repr(e))

        return jsonify({
            "success": False,
            "message": "Unable to verify patient"
        }), 500

    finally:
        if conn:
            conn.close()