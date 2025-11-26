# ECGMS — EXE Course Grouping Management System for FPTU Campus

Vietnamese: Hệ thống quản lý ghép nhóm môn học EXE tại FPTU Campus

Abbreviation: ECGMS

## 3. Register content of Capstone Project

### 3.1. Capstone Project name

- English: EXE Course Grouping Management System for FPTU Campus
- Vietnamese: Hệ thống quản lý ghép nhóm môn học EXE tại FPTU Campus
- Abbreviation: ECGMS

### Context

At FPT University, students in the EXE (Experiential Education) course are required to form project groups starting from semester 7. Currently, the grouping process is managed manually (via Excel and ad-hoc coordination). This leads to challenges such as:

- High workload for the Academic Office when processing large numbers of students.
- Difficulty in ensuring fair and valid group formations (criteria: major, GPA, skill balance, schedule).
- No centralized system to validate group conditions or track progress.
- Lack of automated reporting tools for lecturers and administrators.

### Proposed Solution

The ECGMS (EXE Course Grouping Management System) is a web-based platform designed to streamline and automate the grouping process. It will:

Student functionalities:

- Register EXE courses and provide academic/personal details (major, GPA, skills, interests).
- Receive group suggestions via a matching algorithm (criteria: interdisciplinary requirement, group size, skill diversity).
- Create new groups or request to join existing ones, with system validation rules (max 6 members, cross-major required).

Lecturer functionalities:

- Accept a limited number of groups to supervise.
- Track assigned groups’ progress and manage reports.

Admin (Academic Office) functionalities:

- Import student lists from Excel.
- Validate student eligibility (auto-remove ineligible students and notify groups).
- Assign supervisors and monitor overall course status.
- Export group data, statistics, and performance reports.

This solution reduces manual effort, ensures compliance with grouping policies, and improves transparency for students, lecturers, and the Academic Office.

### Functional Requirements

- Student:
  - Register for EXE course.
  - View suggested groups.
  - Create and manage groups.
  - Request to join groups, receive notifications.
  - Track tasks and deadlines within the group.
- Group Leader:
  - Approve/reject member requests.
  - Assign group tasks and deadlines.
  - Monitor group progress.
- Lecturer:
  - View and supervise groups (limit on number of groups).
  - Track progress, view reports/statistics.
- Admin:
  - Import/export student and group data via Excel.
  - Validate eligibility and auto-update group lists.
  - Assign lecturers, monitor course status.
  - Generate statistics and reports.

### Non-functional Requirements

- Performance: System must handle up to 5,000 concurrent student registrations.
- Security: Role-based authentication (Student, Leader, Lecturer, Admin) with JWT tokens.
- Reliability: Auto backup of student data and group lists.
- Usability: User-friendly web interface for non-technical users.
- Maintainability: Modular design with separated API and frontend.
- Compatibility: Import/Export Excel format (.xlsx, .csv).

### 3.2. Main proposal content (including result and product)

Theory and practice (document): Students will apply the Software Development Process and UML 2.0 for system modeling.

Required documents include:

- User Requirement
- Software Requirement Specification (SRS)
- Architecture Design
- Detail Design
- System Implementation and Testing Document
- Installation Guide
- Source code
- Deployable software packages

Server-side technologies:

- Server: .NET (C# ASP.NET Core)
- Database: SQL Server / MySQL

Client-side technologies:

- Web Client: Next.js, HTML5, CSS3, TypeScript

Additional Requirements:

- Import/Export Excel support (for student and admin data).

### Products

- A fully functional Web Application for students, lecturers, and admins.
- Backend APIs (ASP.NET Core) for handling group logic, validation, and reports.
- Excel Import/Export tool for student registration and reporting.
- Technical documentation (SRS, design, test plan, deployment guide).

### Modules of ECGMS include

Student portal:

- Course registration form (with personal info).
- Suggested group recommendations.
- Group proposal & validation.
- View team progress & assigned tasks.
- Import/Export Excel (registration results, team lists).

Admin/Lecturer dashboard:

- Manage all EXE courses & student lists.
- Approve/adjust group formations.
- Assign supervisors.
- Monitor group status & performance.
- Generate statistics & reports.

Group Management Module:

- Assign leader, members.
- Task assignment & deadlines.
- Progress tracking.

Security features:

- Authentication & Authorization (role-based: student, lecturer, admin).
- Secure API communication.

Out of scope:

- Online classroom integration (Zoom/MS Teams/Google Meet).
- Project grading system (handled separately by LMS/FAP).

### 4. Other comment

System can be integrated with the existing FAP (FPT Academic Portal) in the future.

---

## Quickstart (Frontend)

Prerequisites: Node.js 18+

```
npm install
npm run dev
```

Dev server: http://localhost:3000/

Scripts:

- `npm run dev` — start Next.js dev server
- `npm run build` — production build
- `npm run start` — start production server

## Planned Architecture

- Frontend: Next.js (TypeScript)
- Backend: ASP.NET Core Web API
- Database: SQL Server / MySQL
- Auth: JWT, role-based access control
- Excel: Import/Export (.xlsx/.csv)
