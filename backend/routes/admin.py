
from flask import Blueprint, request, jsonify
from database.connection import get_connection
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
from datetime import datetime, timedelta, timezone
import os

admin_bp = Blueprint("admin", __name__)

JWT_SECRET = os.getenv("JWT_SECRET")

if not JWT_SECRET:
    raise RuntimeError(
        "JWT_SECRET is not configured. "
        "Set it in the .env file."
    )




# ============================================================
# ADMIN LOGIN
# ============================================================
@admin_bp.route("/api/admin/login", methods=["POST"])
def admin_login():

    conn = None

    try:

        data = request.get_json(silent=True)

        if not data:
            return jsonify({
                "success": False,
                "message": "Request body is required"
            }), 400

        username = str(
            data.get("username", "")
        ).strip()

        password = data.get("password", "")

        if not username or not password:
            return jsonify({
                "success": False,
                "message": "Username and password are required"
            }), 400

        conn = get_connection()

        with conn.cursor() as cursor:

            cursor.execute("""
                SELECT
                    admin_id,
                    username,
                    password_hash
                FROM admins
                WHERE username = %s
            """, (username,))

            admin = cursor.fetchone()

        # ----------------------------------------------------
        # Invalid credentials
        # ----------------------------------------------------
        if not admin or not check_password_hash(
            admin["password_hash"],
            password
        ):
            return jsonify({
                "success": False,
                "message": "Invalid username or password"
            }), 401

        # ----------------------------------------------------
        # Create JWT
        # ----------------------------------------------------
        payload = {
            "admin_id": admin["admin_id"],
            "username": admin["username"],
            "role": "ADMIN",
            "exp": datetime.now(timezone.utc) + timedelta(hours=4)
        }

        token = jwt.encode(
            payload,
            JWT_SECRET,
            algorithm="HS256"
        )

        return jsonify({
            "success": True,
            "message": "Login successful",
            "token": token,
            "admin": {
                "admin_id": admin["admin_id"],
                "username": admin["username"]
            }
        }), 200

    except Exception as e:

        print(
            "ADMIN LOGIN ERROR:",
            repr(e)
        )

        return jsonify({
            "success": False,
            "message": "Unable to process login"
        }), 500

    finally:

        if conn:
            conn.close()
