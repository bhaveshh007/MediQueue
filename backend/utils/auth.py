from functools import wraps
from flask import request, jsonify
import jwt
import os

JWT_SECRET = os.getenv("JWT_SECRET")

if not JWT_SECRET:
    raise RuntimeError(
        "JWT_SECRET is not configured. "
        "Set it in the .env file."
    )


def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):

        auth_header = request.headers.get("Authorization", "")

        if not auth_header.startswith("Bearer "):
            return jsonify({
                "success": False,
                "message": "Authorization token is required"
            }), 401

        token = auth_header.split(" ", 1)[1].strip()

        if not token:
            return jsonify({
                "success": False,
                "message": "Authorization token is required"
            }), 401

        try:
            payload = jwt.decode(
                token,
                JWT_SECRET,
                algorithms=["HS256"]
            )

            if payload.get("role") != "ADMIN":
                return jsonify({
                    "success": False,
                    "message": "Admin authorization required"
                }), 403

            request.admin = payload

        except jwt.ExpiredSignatureError:
            return jsonify({
                "success": False,
                "message": "Admin session has expired"
            }), 401

        except jwt.InvalidTokenError:
            return jsonify({
                "success": False,
                "message": "Invalid admin authorization token"
            }), 401

        return f(*args, **kwargs)

    return decorated_function

def patient_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):

        # Allow browser CORS preflight requests
        if request.method == "OPTIONS":
            return "", 200

        auth_header = request.headers.get("Authorization", "")

        if not auth_header.startswith("Bearer "):
            return jsonify({
                "success": False,
                "message": "Patient authorization token is required"
            }), 401

        token = auth_header.split(" ", 1)[1].strip()

        if not token:
            return jsonify({
                "success": False,
                "message": "Patient authorization token is required"
            }), 401

        try:
            payload = jwt.decode(
                token,
                JWT_SECRET,
                algorithms=["HS256"]
            )

            if payload.get("role") != "PATIENT":
                return jsonify({
                    "success": False,
                    "message": "Patient authorization required"
                }), 403

            if not payload.get("patient_id"):
                return jsonify({
                    "success": False,
                    "message": "Invalid patient token"
                }), 401

            request.patient = payload

        except jwt.ExpiredSignatureError:
            return jsonify({
                "success": False,
                "message": "Patient session has expired"
            }), 401

        except jwt.InvalidTokenError:
            return jsonify({
                "success": False,
                "message": "Invalid patient authorization token"
            }), 401

        return f(*args, **kwargs)

    return decorated_function