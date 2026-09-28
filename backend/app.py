from flask import Flask, jsonify
from flask_cors import CORS

from routes.patients import patients_bp
from routes.departments import departments_bp
from routes.doctors import doctors_bp
from routes.schedules import schedules_bp
from routes.appointments import appointments_bp
from routes.admin import admin_bp
from routes.queue import queue_bp
from routes.reports import reports_bp


app = Flask(__name__)

from flask_cors import CORS

CORS(
    app,
    resources={
        r"/api/*": {
            "origins": [
                "http://localhost:5173",
                "http://127.0.0.1:5173"
            ],
            "allow_headers": [
                "Content-Type",
                "Authorization"
            ],
            "methods": [
                "GET",
                "POST",
                "PUT",
                "DELETE",
                "OPTIONS"
            ]
        }
    }
)   

app.register_blueprint(patients_bp)
app.register_blueprint(departments_bp)
app.register_blueprint(doctors_bp)
app.register_blueprint(schedules_bp)
app.register_blueprint(appointments_bp)
app.register_blueprint(admin_bp)
app.register_blueprint(queue_bp)
app.register_blueprint(reports_bp)


@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "healthy",
        "service": "MediQueue API"
    })


@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "message": "Welcome to MediQueue API",
        "version": "1.0"
    })


if __name__ == "__main__":
   app.run(
    host="127.0.0.1",
    port=5000,
    debug=False
)