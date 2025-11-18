Role: You are to act as a Senior Backend Engineer. Your task is to design and generate the complete, runnable codebase for a modern, scalable, and secure School Management System (SMS), with a primary focus on a robust backend, API, and database architecture.

Project Objective:
Create a web-based application that digitizes and manages all core activities of an educational institution. The system must support multiple user roles with distinct permissions and provide a clean, intuitive, and responsive user interface.

1. Core Modules & Features:

You must implement the following modules:

User Authentication & Roles:

Secure user registration (for admins) and login (for all roles).

JWT (JSON Web Token) based authentication.

Role-Based Access Control (RBAC) supporting four distinct roles:

Admin: (Superuser) Manages all aspects of the system. Can create/manage teachers, students, parents, and classes. Can view all data.

Teacher: Manages their assigned classes and subjects. Can take attendance, input grades, and view student profiles in their classes.

Student: Can view their own profile, class timetable, attendance record, and grades/report card.

Parent: Can view their child's profile, attendance, and grades.

Admin Dashboard:

At-a-glance statistics (Total Students, Teachers, Classes).

CRUD (Create, Read, Update, Delete) functionality for:

Students: (Profile with name, DOB, address, parent info, assigned class).

Teachers: (Profile with name, contact, assigned subjects/classes).

Parents: (Profile with name, contact, linked children).

Classes: (e.g., "Grade 10 - Section A").

Subjects: (e.g., "Mathematics", "Physics").

Assign subjects and classes to teachers.

Assign students to classes.

Student Information System (SIS):

View and manage detailed student profiles.

Search and filter students by class, name, or ID.

Academic Management:

Class & Subject Management: (Admin)

Timetable: (Admin creates, all roles can view) A grid-based weekly schedule for each class.

Attendance:

(Teacher) A simple interface to mark daily attendance (Present, Absent, Late) for their class.

(Admin/Parent/Student) View attendance reports by date range.

Grading & Examinations:

(Admin) Create examination types (e.g., "Midterm", "Final").

(Teacher) Input marks for students in their subjects.

(System) Automatically calculate total marks, percentages, and grades (A, B, C...).

(Student/Parent) View a digital Report Card.

Communication:

Noticeboard: (Admin) Post school-wide announcements. (All roles) View announcements on their dashboard.

2. Recommended Technical Stack:

Frontend: React.js

UI: Tailwind CSS (for a modern, responsive design).

Routing: react-router-dom.

State Management: React Context API (or Redux, if you prefer, for larger state).

Data Fetching: axios or fetch API.

Backend: Node.js & Express.js

API: Design a clean RESTful API.

Authentication: jsonwebtoken for tokens, bcrypt.js for password hashing.

Database: PostgreSQL

This project is highly relational (students-to-classes, teachers-to-subjects). A SQL database is the correct choice for data integrity.

Use node-postgres (pg) or an ORM like Sequelize or Prisma.

3. Database Schema Design:

Before writing code, you must design and present the SQL database schema. This is critical. It should include tables for:

users (with a role enum: 'admin', 'teacher', 'student', 'parent')

students (linked to a users ID, and class_id)

teachers (linked to a users ID)

parents (linked to a users ID)

classes (e.g., class_name)

subjects

class_subjects (Junction table: class_id, subject_id, teacher_id)

attendance (student_id, date, status)

exams (exam_name, date)

grades (student_id, subject_id, exam_id, marks_obtained)

notices

4. Code Structure & Best Practices:

Project Structure: Generate a monorepo-like structure with two main folders:

/client: (The React app)

/src/components (Reusable UI)

/src/pages (Top-level views: Login, Dashboard, Students, etc.)

/src/services (API call functions)

/src/context (State management)

/server: (The Node.js/Express app)

/src/controllers (Business logic)

/src/routes (API endpoints)

/src/models (Database models/queries)

/src/middleware (Auth, error handling, RBAC)

/src/config (DB connection, .env)

API Design:

All endpoints should be versioned (e.g., /api/v1/...).

Example endpoints: GET /api/v1/students, POST /api/v1/students, GET /api/v1/classes/:classId/attendance.

Security:

Role-Based Access (RBAC): Implement middleware on the server to protect routes. For example, a teacher should not be able to access POST /api/v1/students.

Input Validation: Use a library like joi or express-validator to validate all incoming request bodies.

Password Hashing: Use bcrypt.js to hash and salt passwords. Never store plain-text passwords.

Error Handling: Implement centralized error handling on the server and display user-friendly error messages on the client.

Code Quality: The code must be clean, modular, and well-commented. Use async/await for all asynchronous operations.

5. Deliverables:

Database Schema: The complete SQL schema as the first output.

Backend Code: The complete, file-by-file code for the /server application.

Frontend Code: The complete, file-by-file code for the /client application.

README.md: A detailed README file that includes:

Project description.

Instructions for setting up the environment (.env variables needed).

How to install dependencies (npm install).

How to run the project (both server and client).

A brief overview of the API endpoints.

Acceptance Criteria:
I will consider this task complete when I can take the generated code, install the dependencies, configure the database, and run the application to successfully perform the core functions for all four user roles.

# Project Overview

This is a NestJS backend for a school portal. It is designed to be a modern, scalable, and modular system for managing students, teachers, classes, attendance, results, timetables, and financial operations. The project uses a modular monorepo structure, with each domain being clean and independently maintainable.

## Building and Running

### Prerequisites

*   Node.js (v18 or higher)
*   PostgreSQL (v14 or higher)
*   npm or yarn

### Installation

1.  Install dependencies:

    ```bash
    npm install
    ```

2.  Set up environment variables by creating a `.env` file in the root directory:

    ```env
    DATABASE_URL="postgresql://user:password@localhost:5432/school"
    JWT_SECRET="your_secret_key_here"
    PORT=3000
    ```

### Running the Application

*   **Development mode:**

    ```bash
    npm run start:dev
    ```

*   **Production mode:**

    ```bash
    npm run build
    npm run start:prod
    ```

The API will be available at: `http://localhost:3000`

### Testing

*   **Unit tests:**

    ```bash
    npm test
    ```

*   **End-to-end tests:**

    ```bash
    npm run test:e2e
    ```

## Development Conventions

*   **Modular Architecture:** The project follows a modular architecture, with each domain encapsulated in its own module.
*   **Coding Style:** The project uses Prettier for code formatting and ESLint for linting.
*   **Testing:** The project uses Jest for unit and end-to-end testing.
*   **Logging:** The project uses Winston for logging.
*   **Contribution Guidelines:** Contributions should follow the modular structure, use DTOs and validation pipes, and include tests.
