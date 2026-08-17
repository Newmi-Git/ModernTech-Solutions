/* ============================================================
   Real auth against the backend (/api/auth/login).
   Requires js/api.js to be loaded first.
   ============================================================ */

async function loginUser(email, password) {
  try {
    const data = await AuthAPI.login(email, password);
    // data: { success, token, role, employeeId }

    // The login endpoint doesn't return a display name — look it up separately
    // if this account is tied to an employee record. Login should still
    // succeed even if this lookup fails.
    let name = data.role === "hr" ? "HR Staff" : data.role === "manager" ? "Manager" : "Employee";
    if (data.employeeId) {
      // Set the token first so the follow-up request is authenticated.
      localStorage.setItem("authToken", data.token);
      try {
        const employee = await EmployeesAPI.getOne(data.employeeId);
        if (employee?.name) name = employee.name;
      } catch { /* keep the fallback name */ }
    }

    setSession({ token: data.token, role: data.role, employeeId: data.employeeId, name });
    return { success: true, role: data.role };
  } catch (err) {
    return { success: false, message: err.message || "Invalid email or password." };
  }
}

function logoutUser() {
  clearSession();
  window.location.href = "login.html";
}

function getCurrentUser() {
  return JSON.parse(localStorage.getItem("currentUser") || "null");
}

// Call at the top of every protected page.
// allowedRoles e.g. ['hr'] or ['hr', 'manager', 'employee']
function requireRole(allowedRoles) {
  const user = getCurrentUser();
  const token = getToken();
  if (!user || !token || !allowedRoles.includes(user.role)) {
    window.location.href = "login.html";
  }
}
