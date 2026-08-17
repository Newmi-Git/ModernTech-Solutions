/* ============================================================
   ModernTech API client
   Central place for the backend base URL, auth headers, and
   one fetch wrapper every page's data calls go through.
   ============================================================ */

const API_BASE_URL = "https://moderntech-api-production.up.railway.app/api";

/* ---------------- Token storage ---------------- */

function getToken() {
  return localStorage.getItem("authToken");
}

function setSession({ token, role, employeeId, name }) {
  localStorage.setItem("authToken", token);
  localStorage.setItem("currentUser", JSON.stringify({ role, employeeId, name }));
}

function clearSession() {
  localStorage.removeItem("authToken");
  localStorage.removeItem("currentUser");
}

/* ---------------- Core request wrapper ---------------- */

async function apiRequest(path, { method = "GET", body, auth = true } = {}) {
  const headers = { "Content-Type": "application/json" };

  if (auth) {
    const token = getToken();
    if (!token) {
      // No session at all — bounce to login instead of firing a doomed request.
      window.location.href = "login.html";
      return Promise.reject(new Error("Not authenticated"));
    }
    headers["Authorization"] = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (networkErr) {
    throw new Error("Could not reach the server. Check your connection and try again.");
  }

  // Session expired or invalid token — send back to login.
  if (response.status === 401) {
    clearSession();
    window.location.href = "login.html";
    return Promise.reject(new Error("Session expired"));
  }

  let data = null;
  const text = await response.text();
  if (text) {
    try { data = JSON.parse(text); } catch { data = null; }
  }

  if (!response.ok) {
    const message = (data && (data.message || data.error)) || `Request failed (${response.status})`;
    throw new Error(message);
  }

  return data;
}

/* ---------------- Auth ---------------- */

const AuthAPI = {
  login: (email, password) =>
    apiRequest("/auth/login", { method: "POST", body: { email, password }, auth: false }),
};

/* ---------------- Employees ---------------- */

const EmployeesAPI = {
  getAll: () => apiRequest("/employees"),
  getOne: (employeeId) => apiRequest(`/employees/${employeeId}`),
  create: (employee) => apiRequest("/employees", { method: "POST", body: employee }),
  update: (employeeId, employee) => apiRequest(`/employees/${employeeId}`, { method: "PUT", body: employee }),
  remove: (employeeId) => apiRequest(`/employees/${employeeId}`, { method: "DELETE" }),
};

/* ---------------- Payroll ---------------- */

const PayrollAPI = {
  getAll: () => apiRequest("/payrolls"),
  getSummary: () => apiRequest("/payrolls/summary"),
  getOne: (employeeId) => apiRequest(`/payrolls/${employeeId}`),
  create: (payroll) => apiRequest("/payrolls", { method: "POST", body: payroll }),
  update: (employeeId, payroll) => apiRequest(`/payrolls/${employeeId}`, { method: "PUT", body: payroll }),
};

/* ---------------- Attendance ---------------- */

const AttendanceAPI = {
  getAll: () => apiRequest("/attendance"),
  mark: (employeeId, date, status) =>
    apiRequest("/attendance", { method: "POST", body: { employee_id: employeeId, date, status } }),
};

/* ---------------- Leave requests ---------------- */

const LeaveRequestsAPI = {
  getAll: () => apiRequest("/leave-requests"),
  submit: (employeeId, startDate, endDate, reason) =>
    apiRequest("/leave-requests", {
      method: "POST",
      body: { employee_id: employeeId, start_date: startDate, end_date: endDate, reason },
    }),
  updateStatus: (requestId, status) =>
    apiRequest(`/leave-requests/${requestId}`, { method: "PUT", body: { status } }),
};
