// ==========================================
// STATE MANAGEMENT & DATA INITIALIZATION
// ==========================================

let employees = [];
let currentFilter = "all status";
let selectedEmployee = null;
let selectedRequest = null;
let selectedAction = "";

// Fetch the default JSON structure first, then check if local storage holds updates
fetch("./DummyData/attendance.json")
  .then(response => {
    if (!response.ok) {
      throw new Error(`Fetch failed with status ${response.status} (check file path/casing: ./DummyData/attendance.json)`);
    }
    return response.json();
  })
  .then(data => {
    const defaultEmployees = data.attendanceAndLeave;
    const savedRequests = localStorage.getItem("leaveRequests");

    if (savedRequests) {
      const parsedSaved = JSON.parse(savedRequests);
      
      // Safety fix: If data was formatted under old flat array logic, reset cleanly
      if (parsedSaved.length > 0 && !parsedSaved[0].hasOwnProperty('name')) {
        employees = defaultEmployees;
      } else {
        employees = parsedSaved;
      }
    } else {
      employees = defaultEmployees;
    }
    
    saveRequests();
    refreshTable();
  })
  .catch(error => {
    console.error("Error loading initialization payload data:", error);
    const savedRequests = localStorage.getItem("leaveRequests");

    if (savedRequests) {
      // Fall back to whatever was previously saved in localStorage
      employees = JSON.parse(savedRequests);
      refreshTable();
    } else {
      // No fallback data available either - show a visible error instead of a silent empty table
      employees = [];
      const table = document.getElementById("leave-requests");
      if (table) {
        table.innerHTML = `
          <tr>
            <td colspan="6" style="text-align: center; color: #ef4444; padding: 20px;">
              Unable to load leave request data. Please check your connection or contact support.
            </td>
          </tr>
        `;
      }
      updateCounters();
    }
  });

function saveRequests() {
    localStorage.setItem("leaveRequests", JSON.stringify(employees));
}

// ==========================================
// CORE DRAW & DISPLAY LOGIC
// ==========================================

function displayRequests(data) {
    const table = document.getElementById("leave-requests");
    table.innerHTML = "";

    // Bumped colspan to 6 to account for the new column split
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

    data.forEach(employee => {
        const employeeIndex = employees.findIndex(emp => emp.name === employee.name);
        if (employeeIndex === -1) return;

        employee.leaveRequests.forEach(request => {
            const requestIndex = employees[employeeIndex].leaveRequests.findIndex(
                r => r.date === request.date && r.reason === request.reason
            );
            if (requestIndex === -1) return;

            let buttons = "";

            if (request.status === "Pending") {
                buttons = `
                    <button class="approve" onclick="confirmApprove(${employeeIndex}, ${requestIndex})">
                        Approve
                    </button>
                    <button class="reject" onclick="confirmReject(${employeeIndex}, ${requestIndex})">
                        Reject
                    </button>
                `;
            } else {
                buttons = `
                    <button class="view" onclick="viewRequest(${employeeIndex}, ${requestIndex})">
                        View
                    </button>
                `;
            }

            // Logic to parse the date ranges into distinct Start and End variables
            let startDate = request.date || "N/A";
            let endDate = "N/A";

            if (request.date && request.date.includes(" to ")) {
                const parts = request.date.split(" to ");
                startDate = parts[0];
                endDate = parts[1];
            }

            table.innerHTML += `
                <tr>
                    <td><strong>${employee.name}</strong></td>
                    <td>${request.reason}</td>
                    <td>${startDate}</td>
                    <td>${endDate}</td>
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

    employees.forEach(employee => {
        if (!employee.leaveRequests) return;

        const requests = employee.leaveRequests.filter(request => {
            const status = request.status.trim().toLowerCase();

            if (currentFilter === "rejected") {
                return status === "denied" || status === "rejected";
            }
            return status === currentFilter;
        });

        if (requests.length > 0) {
            filteredEmployees.push({
                ...employee,
                leaveRequests: requests
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

    employees.forEach(employee => {
        if (employee.leaveRequests) {
            employee.leaveRequests.forEach(request => {
                total++;
                const status = request.status.toLowerCase();
                if (status === 'pending') pending++;
                else if (status === 'approved') approved++;
                else if (status === 'rejected' || status === 'denied') rejected++;
            });
        }
    });

    const totalEl = document.querySelector('.summary-card:nth-child(1) p');
    const pendingEl = document.querySelector('.summary-card:nth-child(2) p');
    const approvedEl = document.querySelector('.summary-card:nth-child(3) p');
    const rejectedEl = document.querySelector('.summary-card:nth-child(4) p');

    if (totalEl) totalEl.textContent = total;
    if (pendingEl) pendingEl.textContent = pending;
    if (approvedEl) approvedEl.textContent = approved;
    if (rejectedEl) rejectedEl.textContent = rejected;
}

// ==========================================
// MODAL POPUPS & USER ACTIONS
// ==========================================

function confirmApprove(employeeIndex, requestIndex) {
    selectedEmployee = employeeIndex;
    selectedRequest = requestIndex;
    selectedAction = "Approved";

    document.getElementById("confirm-icon").className = "fa-solid fa-circle-check";
    document.getElementById("confirm-icon").style.color = "#22c55e";
    document.getElementById("confirm-title").textContent = "Approve Request";
    document.getElementById("confirm-message").textContent = "Are you sure you want to approve this leave request?";
    
    const actionBtn = document.getElementById("confirm-action");
    actionBtn.textContent = "Approve";
    actionBtn.className = "approve";

    document.getElementById("confirm-popup").style.display = "flex";
}

function confirmReject(employeeIndex, requestIndex) {
    selectedEmployee = employeeIndex;
    selectedRequest = requestIndex;
    selectedAction = "Denied";

    document.getElementById("confirm-icon").className = "fa-solid fa-circle-xmark";
    document.getElementById("confirm-icon").style.color = "#ef4444";
    document.getElementById("confirm-title").textContent = "Reject Request";
    document.getElementById("confirm-message").textContent = "Are you sure you want to reject this leave request?";
    
    const actionBtn = document.getElementById("confirm-action");
    actionBtn.textContent = "Reject";
    actionBtn.className = "reject";

    document.getElementById("confirm-popup").style.display = "flex";
}

function confirmAction() {
    if (selectedEmployee === null || selectedRequest === null) return;

    employees[selectedEmployee].leaveRequests[selectedRequest].status = selectedAction;

    saveRequests();
    closeConfirmPopup();

    if (selectedAction === "Approved") {
        showPopup("Request Approved", "The leave request has been approved successfully.", "fa-solid fa-circle-check", "#22c55e");
    } else {
        showPopup("Request Rejected", "The leave request has been rejected.", "fa-solid fa-circle-xmark", "#ef4444");
    }

    refreshTable();
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

// Fixed outside click handler dependencies
function closePopup() {
    document.getElementById("popup").style.display = "none";
}

function closeViewPopup() {
    document.getElementById("view-popup").style.display = "none";
}

function viewRequest(employeeIndex, requestIndex) {
    const employee = employees[employeeIndex];
    const request = employee.leaveRequests[requestIndex];

    const approved = employee.leaveRequests.filter(r => r.status === "Approved").length;
    const pending = employee.leaveRequests.filter(r => r.status === "Pending").length;
    const denied = employee.leaveRequests.filter(r => r.status === "Denied").length;

    const totalWorkingDays = 220;
    const leaveDays = approved;
    const presentDays = totalWorkingDays - leaveDays;
    const attendanceRate = ((presentDays / totalWorkingDays) * 100).toFixed(1);

    // New multi-column structural design to reduce vertical height
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
window.onclick = function(event) {
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
