**Smart Healthcare Queue & Appointment System**

> MediQueue is a full-stack web application for managing patient
> appointments and clinic queues. It gives patients a simple way to
> register, book appointments, and follow their queue, while
> administrators can manage doctors, schedules, appointments, and
> day-to-day queue operations from one dashboard.

# 1. Project Overview

The main purpose of MediQueue is to replace a manual appointment and
waiting-line process with a single digital workflow. Patients can check
available doctors and schedules, make an appointment, and track their
position in the queue. Administrators can confirm appointments, manage
the queue, call patients, and monitor completed and pending
appointments.

## Patient side

- Register as a new patient and receive a unique Patient ID.

- Verify a returning patient using Patient ID and registered mobile
  number.

- View doctors and available schedules.

- Book an appointment and receive an appointment ID.

- Join the queue after the appointment is confirmed.

- View the queue token, patients ahead, and estimated waiting time.

- Track appointment and queue status.

## Admin side

- Log in through the protected Admin Portal.

- Manage doctors and departments.

- Create and manage doctor schedules.

- Review and confirm appointments.

- Manage the daily patient queue.

- Call the next patient and update consultation status.

- Complete appointments and review reports.

# 2. How the System Works

## Patient workflow

Patient\
↓\
Register / Verify\
↓\
Patient ID\
↓\
Select Doctor\
↓\
Select Schedule\
↓\
Book Appointment\
↓\
Appointment Confirmation\
↓\
Join Queue\
↓\
Queue Token\
↓\
Track Queue Position\
↓\
Consultation\
↓\
Completed

## Admin workflow

Admin Login\
↓\
Admin Dashboard\
├── Doctors\
├── Departments\
├── Schedules\
├── Appointments\
├── Queue\
└── Reports\
↓\
Call Next Patient\
↓\
Complete Appointment

# 3. System Architecture

MediQueue follows a simple three-layer application structure. The React
frontend handles the user interface, the Flask API manages application
logic and authentication, and MySQL stores the application data.

Patient / Admin\
↓\
React + Vite Frontend\
↓\
Application Load Balancer\
↓\
Flask REST API on EC2\
↓\
MySQL on Amazon RDS

| **Layer**          | **Technology**                            |
|--------------------|-------------------------------------------|
| Frontend           | React.js + Vite                           |
| Hosting            | Amazon S3                                 |
| Traffic            | Application Load Balancer                 |
| Backend            | Flask REST API                            |
| Application Server | Amazon EC2                                |
| Database           | MySQL / Amazon RDS                        |
| Authentication     | JWT                                       |
| Security           | Password hashing and protected API routes |

# 4. Main Features

## Patient Portal

The patient portal supports two entry points: new patients can register
and receive a Patient ID, while returning patients can verify their
identity using their Patient ID and registered mobile number.

## Appointment Booking

Patients choose a doctor, select an available schedule and consultation
time, and submit the appointment. A unique appointment ID is generated
after a successful booking.

## Queue Management

Once an appointment is confirmed, the patient can join the doctor's
queue. The queue module keeps track of token numbers, current position,
patients ahead, appointment time, status, and estimated waiting time.

- Select doctor and queue date.

- View waiting patients and queue tokens.

- Call the next patient.

- Move an appointment into consultation.

- Complete the appointment.

- Monitor the estimated waiting time.

## Admin Dashboard

The dashboard gives administrators a quick view of the current system
status, including total patients, doctors, departments, appointments,
completed appointments, and pending appointments.

## Reports and Analytics

The reporting section provides basic operational information such as
appointment status, department-wise appointments, active doctors, and
doctor-wise reports.

# 5. Appointment Lifecycle

BOOKED\
↓\
CONFIRMED\
↓\
WAITING\
↓\
IN_PROGRESS\
↓\
COMPLETED

Appointments may also be cancelled when required:

BOOKED / CONFIRMED\
↓\
CANCELLED

# 

# 6. Queue Lifecycle

Confirmed Appointment\
↓\
Join Queue\
↓\
Token Generated\
↓\
WAITING\
↓\
Admin Calls Next\
↓\
IN_PROGRESS\
↓\
COMPLETED

The queue records the token number, current token, patients ahead,
appointment time, queue status, and estimated waiting time.

# 7. Security

Security is handled at both the application and database-access levels.
The backend protects administrative routes and keeps sensitive
configuration outside the frontend.

- JWT-based authentication and authorization.

- Protected, role-based API routes.

- Password hashing for administrator credentials.

- Backend input validation.

- Protection against duplicate appointment slots.

- Environment variables for sensitive configuration.

- Database credentials are not exposed to the frontend.

- Database access is kept behind the application layer.

**Note:** Do not commit .env files, database passwords, JWT secrets, or
other credentials to GitHub.

# 8. Technology Stack

| **Area** | **Technology**                                               |
|----------|--------------------------------------------------------------|
| Frontend | React.js, Vite, React Router, HTML, CSS, JavaScript          |
| Backend  | Python, Flask, REST API, JWT, password hashing               |
| Database | MySQL, Amazon RDS                                            |
| AWS      | Amazon S3, Amazon EC2, Application Load Balancer, Amazon RDS |
| Tools    | Visual Studio Code, Node.js, Python, Git, GitHub             |

# 9. Project Structure

MediQueue/\
│\
├── backend/\
│ ├── routes/\
│ ├── utils/\
│ ├── app.py\
│ ├── config.py\
│ └── requirements.txt\
│\
├── frontend/\
│ ├── src/\
│ │ ├── components/\
│ │ ├── pages/\
│ │ ├── services/\
│ │ ├── utils/\
│ │ ├── App.jsx\
│ │ └── main.jsx\
│ └── package.json\
│\
├── frontend-old/\
├── screenshots/\
│ ├── 01-home.png\
│ ├── 02-patient-portal.png\
│ ├── 03-patient-booking.png\
│ ├── 04-admin-queue.png\
│ ├── 05-admin-dashboard.png\
│ └── 06-admin-reports.png\
│\
├── README.md\
└── .gitignore

# 10. Running the Project Locally

## Start the backend

Open PowerShell and run:

cd C:\Users\HP\Downloads\MediQueue\backend\
.\venv\Scripts\python.exe app.py

## Start the frontend

Open a second PowerShell window and run:

cd C:\Users\HP\Downloads\MediQueue\frontend\
npm.cmd run dev

The frontend runs through the Vite development server.

# 

# 

# 11. Application Routes

## Patient

/\
└── /patient\
└── /patient/dashboard

## Administrator

/admin/login\
↓\
/admin/dashboard\
├── /admin/doctors\
├── /admin/departments\
├── /admin/doctors/:doctorId/schedules\
├── /admin/appointments\
├── /admin/queue\
└── /admin/reports

# 12. Key Benefits

## For patients

- Simple appointment booking.

- Patient access without a traditional password.

- Unique patient identification.

- Queue token and position tracking.

- Better visibility into expected waiting time.

- Easy appointment status tracking.

## For administrators

- Centralized management of patients and appointments.

- Doctor, department, and schedule management.

- Queue control from a single dashboard.

- Appointment status management.

- Operational reports for day-to-day monitoring.

# 13. Future Improvements

The current system can be extended with features such as:

- Mobile application support.

- SMS and email appointment notifications.

- Doctor-specific dashboards.

- Multi-branch hospital support.

- Patient document management.

- More detailed analytics.

- Automatic queue notifications.

- Appointment reminders.

- Additional AWS integrations.

# 14. Project Objective

MediQueue was built to digitize the appointment and queue process from
registration through consultation and completion. The intended flow is:

Patient → Appointment → Doctor → Queue → Consultation → Completion →
Reports

By keeping these steps in one application, the system provides a
straightforward way to manage both patient appointments and daily clinic
queues.

# 15. Project Highlights

This project brings together several practical areas of software
development:

- Full-stack web application development.

- REST API design and integration.

- React-based frontend development.

- Database-driven application design.

- Authentication and authorization.

- Appointment and queue management.

- AWS cloud deployment.

- EC2 and load balancer configuration.

- Amazon RDS integration.

- Git and GitHub workflow.

# MediQueue

**Smart Healthcare Queue & Appointment System**

Built with React, Flask, MySQL, and AWS.
