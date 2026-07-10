# ModernTech Solutions HR System

A front-end HR web application built as a proof of concept for **ModernTech Solutions**, a healthcare software company whose HR processes currently rely on scattered spreadsheets, emails, and shared drives. This app demonstrates how employee data, payroll, and time-off/attendance tracking can be centralized in one user-friendly, client-side system.

> Built for Module 1 Core Project — LifeChoices Academy Software Development programme.

## Live Site

[View the live site](#)

## Features

- **Employee Management** — view, add, edit, and delete employee records using dummy data
- **Payroll Calculation** — automatic monthly and annual salary calculations with digital payslip generation
- **Time-Off & Attendance** — submit, approve/deny leave requests, with attendance tracking updated automatically
- **Responsive Design** — fully usable on desktop, tablet, and mobile devices
- **Local Data Persistence** — data is saved with `localStorage` so it survives page refreshes

## Tech Stack

- **HTML5 / CSS3** — page structure and styling
- **Bootstrap** — responsive layout and UI components
- **Vue.js 3** (via CDN) — dynamic components (navbar, footer, employee list, forms)
- **JavaScript (ES6)** — client-side logic and data handling
- **localStorage** — client-side data persistence
- **GitHub Pages** — deployment

No back-end or database is used — this is a purely front-end proof of concept, using dummy data to simulate real functionality.

## Project Structure

```
├── index.html          # Home page
├── login.html           # Login page
├── employee.html        # Employee management
├── performance.html     # Performance reviews
├── requests.html         # Leave requests & attendance
├── about.html            # About Us
├── contact.html           # Contact page
├── css/
│   └── styles.css        # Shared styles & CSS variables
├── js/
│   ├── navbar.js          # Shared Vue navbar component
│   ├── footer.js           # Shared Vue footer component
│   ├── data.js              # Dummy data & localStorage helpers
│   └── ...                   # Page-specific Vue logic
└── README.md
```

## Getting Started

No build step or installation required — this project runs entirely in the browser.

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/your-repo-name.git
   ```
2. Open `index.html` in your browser, or use a local server (e.g. the VS Code Live Server extension) to avoid any file path issues.

## Team

| Name | Role |
|------|------|
| [Yaghya] | [Role] |
| [Vuyolwethu] | [Role] |
| [Karah] | [Role] |
| [Stephan] | [Role] |

## Deployment

This site is deployed via **GitHub Pages** from the `main` branch. Any changes pushed to `main` are reflected on the live site.

## Acknowledgements

Case study and project brief provided by LifeChoices Academy.