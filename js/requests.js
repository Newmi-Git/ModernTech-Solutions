// ==========================================
// STATE MANAGEMENT & DATA INITIALIZATION
// ==========================================

let employees = [];
let currentFilter = "all status";
let selectedRequestId = null;
let selectedAction = "";

async function loadRequests() {
  try {
    const [employeeRows, leaveRows] = await Promise.all([
      EmployeesAPI.getAll(),
      LeaveRequestsAPI.getAll(),
    ]);

    // Group flat leave_requests rows onto each employee, keeping the
    // real request_id around so approve/reject can call the API directly.
    employees = employeeRows.map((emp) => ({
      employee_id: emp.employee_id,
      name: emp.name,
      leaveRequests: leaveRows
        .filter((l) => l.employee_id === emp.employee_id)
        .map((l) => ({
          request_id: l.request_id,
          reason: l.reason,
          date: `${l.start_date} to ${l.end_date}`,
          startDate: l.start_date,
          endDate: l.end_date,
          status: l.status,
        })),
    }));

    refreshTable();
  } catch (err) {
    console.error("Error loading leave requests:", err);
    employees = [];
    const table = document.getElementById("leave-requests");
    if (table) {
      table.innerHTML = `
              <tr>
                <td colspan="6" style="text-align: center; color: #ef4444; padding: 20px;">
                  Unable to load leave request data: ${err.message}
                </td>
              </tr>
            `;
    }
    updateCounters();
  }
}

loadRequests();

// ==========================================
// CORE DRAW & DISPLAY LOGIC
// ==========================================

function displayRequests(data) {
  const table = document.getElementById("leave-requests");
  table.innerHTML = "";

  if (!data || data.length === 0) {
    table.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; color: #888; padding: 20px;">
                    No leave requests found matching this status.
                </td>
            </tr>
        `;
    return;
  }

  data.forEach((employee) => {
    employee.leaveRequests.forEach((request) => {
      let buttons = "";

      if (request.status === "Pending") {
        buttons = `
                    <button class="approve" onclick="confirmApprove(${request.request_id})">
                        Approve
                    </button>
                    <button class="reject" onclick="confirmReject(${request.request_id})">
                        Reject
                    </button>
                `;
      } else {
        buttons = `
                    <button class="view" onclick="viewRequest(${request.request_id})">
                        View
                    </button>
                `;
      }

      table.innerHTML += `
                <tr>
                    <td><strong>${employee.name}</strong></td>
                    <td>${request.reason}</td>
                    <td>${request.startDate}</td>
                    <td>${request.endDate}</td>
                    <td>
                        <span class="${request.status.toLowerCase()}">
                            ${request.status}
                        </span>
                    </td>
                    <td>
                        <div class="action-buttons-container">${buttons}</div>
                    </td>
                </tr>
            `;
    });
  });
}

// ==========================================
// FILTERS & DASHBOARD COUNTERS
// ==========================================

function refreshTable() {
  updateCounters();

  if (currentFilter === "all status") {
    displayRequests(employees);

    return;
  }

  const filteredEmployees = [];

  employees.forEach((employee) => {
    if (!employee.leaveRequests) return;

    const requests = employee.leaveRequests.filter((request) => {
      const status = request.status.trim().toLowerCase();

      if (currentFilter === "rejected") {
        return status === "denied" || status === "rejected";
      }
      return status === currentFilter;
    });

    if (requests.length > 0) {
      filteredEmployees.push({
        ...employee,
        leaveRequests: requests,
      });
    }
  });

  displayRequests(filteredEmployees);
}

function filterStatus() {
  const dropdown = document.getElementById("status");
  currentFilter = dropdown.value.trim().toLowerCase();
  refreshTable();
}

function updateCounters() {
  let total = 0;
  let pending = 0;
  let approved = 0;
  let rejected = 0;

  employees.forEach((employee) => {
    if (employee.leaveRequests) {
      employee.leaveRequests.forEach((request) => {
        total++;
        const status = request.status.toLowerCase();
        if (status === "pending") pending++;
        else if (status === "approved") approved++;
        else if (status === "rejected" || status === "denied") rejected++;
      });
    }
  });

  const totalEl = document.querySelector(".summary-card:nth-child(1) p");
  const pendingEl = document.querySelector(".summary-card:nth-child(2) p");
  const approvedEl = document.querySelector(".summary-card:nth-child(3) p");
  const rejectedEl = document.querySelector(".summary-card:nth-child(4) p");

  if (totalEl) totalEl.textContent = total;
  if (pendingEl) pendingEl.textContent = pending;
  if (approvedEl) approvedEl.textContent = approved;
  if (rejectedEl) rejectedEl.textContent = rejected;
}

// ==========================================
// MODAL POPUPS & USER ACTIONS
// ==========================================

function confirmApprove(requestId) {
  selectedRequestId = requestId;
  selectedAction = "Approved";

  document.getElementById("confirm-icon").className =
    "fa-solid fa-circle-check";
  document.getElementById("confirm-icon").style.color = "#22c55e";
  document.getElementById("confirm-title").textContent = "Approve Request";
  document.getElementById("confirm-message").textContent =
    "Are you sure you want to approve this leave request?";

  const actionBtn = document.getElementById("confirm-action");
  actionBtn.textContent = "Approve";
  actionBtn.className = "approve";

  document.getElementById("confirm-popup").style.display = "flex";
}

function confirmReject(requestId) {
  selectedRequestId = requestId;
  selectedAction = "Denied";

  document.getElementById("confirm-icon").className =
    "fa-solid fa-circle-xmark";
  document.getElementById("confirm-icon").style.color = "#ef4444";
  document.getElementById("confirm-title").textContent = "Reject Request";
  document.getElementById("confirm-message").textContent =
    "Are you sure you want to reject this leave request?";

  const actionBtn = document.getElementById("confirm-action");
  actionBtn.textContent = "Reject";
  actionBtn.className = "reject";

  document.getElementById("confirm-popup").style.display = "flex";
}

async function confirmAction() {
  if (selectedRequestId === null) return;

  try {
    // Approving also auto-marks attendance as "Leave" for the date range, server-side.
    await LeaveRequestsAPI.updateStatus(selectedRequestId, selectedAction);

    closeConfirmPopup();

    if (selectedAction === "Approved") {
      showPopup(
        "Request Approved",
        "The leave request has been approved successfully.",
        "fa-solid fa-circle-check",
        "#22c55e",
      );
    } else {
      showPopup(
        "Request Rejected",
        "The leave request has been rejected.",
        "fa-solid fa-circle-xmark",
        "#ef4444",
      );
    }

    await loadRequests();
  } catch (err) {
    closeConfirmPopup();
    showPopup(
      "Action Failed",
      err.message,
      "fa-solid fa-circle-exclamation",
      "#ef4444",
    );
  }
}

function closeConfirmPopup() {
  document.getElementById("confirm-popup").style.display = "none";
}

function showPopup(title, message, icon, colour) {
  document.getElementById("popup-title").textContent = title;
  document.getElementById("popup-message").textContent = message;
  document.getElementById("popup-icon").className = icon;
  document.getElementById("popup-icon").style.color = colour;
  document.getElementById("popup").style.display = "flex";
}

function closePopup() {
  document.getElementById("popup").style.display = "none";
}

function closeViewPopup() {
  document.getElementById("view-popup").style.display = "none";
}

function findRequestOwner(requestId) {
  for (const employee of employees) {
    const request = employee.leaveRequests.find(
      (r) => r.request_id === requestId,
    );
    if (request) return { employee, request };
  }
  return null;
}

function viewRequest(requestId) {
  const found = findRequestOwner(requestId);
  if (!found) return;
  const { employee, request } = found;

  const approved = employee.leaveRequests.filter(
    (r) => r.status === "Approved",
  ).length;
  const pending = employee.leaveRequests.filter(
    (r) => r.status === "Pending",
  ).length;
  const denied = employee.leaveRequests.filter(
    (r) => r.status === "Denied",
  ).length;

  const totalWorkingDays = 220;
  const leaveDays = approved;
  const presentDays = totalWorkingDays - leaveDays;
  const attendanceRate = ((presentDays / totalWorkingDays) * 100).toFixed(1);

  document.getElementById("view-message").innerHTML = `
        <div class="modal-profile-header">
            <i class="fa-solid fa-circle-user" style="font-size: 3rem; color: #22c55e;"></i>
            <h3>${employee.name}</h3>
            <p class="modal-subtitle">Employee Leave Profile</p>
        </div>

        <div class="modal-grid-layout">
            <div class="modal-card-box">
                <h4>Attendance Summary</h4>
                <p><strong>Present Days:</strong> ${presentDays}</p>
                <p><strong>Leave Days:</strong> ${leaveDays}</p>
                <p><strong>Attendance Rate:</strong> ${attendanceRate}%</p>
            </div>

            <div class="modal-card-box">
                <h4>Leave Request Summary</h4>
                <p><strong>Approved:</strong> ${approved}</p>
                <p><strong>Pending:</strong> ${pending}</p>
                <p><strong>Denied:</strong> ${denied}</p>
            </div>
        </div>

        <div class="modal-card-box current-request-box">
            <h4>Current Leave Request</h4>
            <div class="request-details-inline">
                <p><strong>Leave Type:</strong> ${request.reason}</p>
                <p><strong>Date:</strong> ${request.date}</p>
                <p><strong>Status:</strong> <span class="${request.status.toLowerCase()}">${request.status}</span></p>
            </div>
        </div>
    `;

  document.getElementById("view-popup").style.display = "flex";
}

// Outside Click Listener for All 3 Popups
window.onclick = function (event) {
  const popup = document.getElementById("popup");
  const confirmPopup = document.getElementById("confirm-popup");
  const viewPopup = document.getElementById("view-popup");

  if (event.target === popup) {
    closePopup();
  }
  if (event.target === confirmPopup) {
    closeConfirmPopup();
  }
  if (event.target === viewPopup) {
    closeViewPopup();
  }
};

/* ---------------- Submit Leave Request ---------------- */

function openLeaveRequestForm() {
  document.getElementById("leave-start-date").value = "";
  document.getElementById("leave-end-date").value = "";
  document.getElementById("leave-reason").value = "";
  document.getElementById("leave-request-overlay").style.display = "flex";
}

function closeLeaveRequestForm() {
  document.getElementById("leave-request-overlay").style.display = "none";
}

async function submitLeaveRequestForm() {
  const startDate = document.getElementById("leave-start-date").value;
  const endDate = document.getElementById("leave-end-date").value;
  const reason = document.getElementById("leave-reason").value.trim();

  if (!startDate || !endDate || reason === "") {
    showPopup(
      "Missing Information",
      "Please fill in the start date, end date, and reason.",
      "fa-solid fa-circle-exclamation",
      "#f59e0b",
    );
    return;
  }

  if (new Date(endDate) < new Date(startDate)) {
    showPopup(
      "Invalid Dates",
      "The end date can't be before the start date.",
      "fa-solid fa-circle-exclamation",
      "#f59e0b",
    );
    return;
  }

  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  try {
    await LeaveRequestsAPI.submit(
      currentUser.employeeId,
      startDate,
      endDate,
      reason,
    );

    closeLeaveRequestForm();
    await loadRequests();

    showPopup(
      "Request Submitted!",
      "Your leave request has been submitted and is pending approval.",
      "fa-solid fa-circle-check",
      "#22c55e",
    );
  } catch (err) {
    showPopup(
      "Submission Failed",
      err.message,
      "fa-solid fa-circle-exclamation",
      "#ef4444",
    );
  }
}
