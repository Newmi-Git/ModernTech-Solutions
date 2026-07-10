// Hardcoded HR access code (dummy auth — bonus requirement)
const HR_ACCESS_CODE = "MT-HR-2026";

// HR login — just needs the access code
function loginHR(code) {
  if (code !== HR_ACCESS_CODE) {
    return { success: false, message: "Invalid HR access code." };
  }
  localStorage.setItem('currentUser', JSON.stringify({ role: 'hr', name: 'HR Staff' }));
  return { success: true };
}

// Employee login — matched against employeeInformation.json by ID + surname
function loginEmployee(employeeId, surname) {
  const employees = JSON.parse(localStorage.getItem('employeeInformation')) || [];
  const match = employees.find(e =>
    e.employeeId === Number(employeeId) &&
    e.name.toLowerCase().includes(surname.trim().toLowerCase())
  );

  if (!match) {
    return { success: false, message: "Employee ID or surname not found." };
  }

  localStorage.setItem('currentUser', JSON.stringify({
    role: 'employee',
    name: match.name,
    employeeId: match.employeeId
  }));
  return { success: true };
}

function logoutUser() {
  localStorage.removeItem('currentUser');
  window.location.href = 'login.html';
}

function getCurrentUser() {
  return JSON.parse(localStorage.getItem('currentUser'));
}

// Call at the top of every protected page.
// allowedRoles e.g. ['hr'] or ['hr', 'employee']
function requireRole(allowedRoles) {
  const user = getCurrentUser();
  if (!user || !allowedRoles.includes(user.role)) {
    window.location.href = 'login.html';
  }
}

if (!localStorage.getItem('employeeInformation')) {
  fetch('./DummyData/employee_info.json')
    .then(res => res.json())
    .then(data => localStorage.setItem('employeeInformation', JSON.stringify(data.employeeInformation)));
}