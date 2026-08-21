# ModernTech Solutions HR System

A full-stack HR web application built for **ModernTech Solutions**, a healthcare software company whose HR processes previously relied on scattered spreadsheets, emails, and shared drives. This app centralizes employee data, payroll, and time-off/attendance tracking in one user-friendly system, backed by a real database and API rather than local browser storage.

> Built for Module 2 Core Project — LifeChoices Academy Software Development programme.

## Live Site

[View the live site](https://mt-solutions.netlify.app/)

## Design

Figma Link: https://www.figma.com/design/goc07ykF0mIDHeiKa6wY0Z/Hr-Dashboard?node-id=6-323&t=dFYgw65qwwhqo3Aa-1

## Features

- **Employee Management** — view, add, edit, and delete employee records, persisted in a MySQL database
- **Payroll Calculation** — automatic monthly and annual salary calculations with digital payslip generation
- **Time-Off & Attendance** — submit, approve/deny leave requests, with attendance tracking updated automatically when a request is approved
- **Secure Authentication** — token-based login with role-based access control (HR, manager, employee) and login rate-limiting to guard against brute-force attempts
- **Server-Side Validation** — request bodies and URL parameters are validated and sanitized before touching the database
- **Operations Efficiency** — frequently-read, infrequently-changed endpoints (employees, payroll) are cached server-side
- **Responsive Design** — fully usable on desktop, tablet, and mobile devices

## Tech Stack

**Frontend**

- **HTML5 / CSS3** — page structure and styling
- **Bootstrap** — responsive layout and UI components
- **Vue.js 3** (via CDN) — dynamic components (navbar, footer, employee list, forms)
- **JavaScript (ES6)** — client-side logic and data handling
- **Netlify** — frontend deployment

**Backend**

- **Node.js / Express** — REST API and business logic
- **MySQL** — persistent relational data store
- **express-validator** — server-side validation and input sanitization
- **express-rate-limit** — login rate-limiting
- **Railway** — backend deployment

The frontend communicates with the Express API over HTTPS; all employee, payroll, and attendance data is read from and written to MySQL rather than `localStorage`.

## Getting Started

### Frontend

No build step required — this project runs entirely in the browser.

1. Clone the repository:
   ```bash
   git clone https://github.com/Newmi-Git/ModernTech-Solutions.git
   ```
2. Open `index.html` in your browser, or use a local server (e.g. the VS Code Live Server extension) to avoid file path issues.
3. By default the frontend points at the deployed backend on Railway. To point it at a local backend instead, update the API base URL in the frontend config to `http://localhost:<port>`.

### Backend

See the backend repository's README for setup, environment variables, and local run instructions. In short:

```bash
cd backend
npm install
npm run dev
```

## Demo Credentials

Use the following to log in and explore the HR role: 

| Role     | Email                       | Password     |
| -------- | --------------------------- | ------------ |
| HR       | lungile.moyo@moderntech.com | HrAdmin123!  |
| Employee | thabo.molefe@moderntech.com | Employee123! |

## Team

| Name                                                | Role                                          |
| --------------------------------------------------- | --------------------------------------------- |
| [Yaghya](https://github.com/Newmi-Git)              | Performance Page, Attendance Page, Login Page |
| [Vuyolwethu](https://github.com/mbekenivuvu-droid)  | Employees Page, Payroll Page, Requests Page   |
| [Karah](https://github.com/Karah-Fisher)            | About Page, Contact Page                      |
| [Stephan](https://github.com/stephanbennett42-ctrl) | Figma, Home Page                              |

## Deployment

- **Frontend** is deployed via **Netlify** from the `main` branch. Any changes pushed to `main` are reflected on the live site.
- **Backend** is deployed via **Railway** from the `backend-development` branch.

## Acknowledgements

Case study and project brief provided by LifeChoices Academy.
