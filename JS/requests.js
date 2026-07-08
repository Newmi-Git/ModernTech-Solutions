// ==========================================
// STATE MANAGEMENT & DATA INITIALIZATION
// ==========================================

let employees = [];
let selectedEmployee = null;
let selectedRequest = null;
let selectedAction = "";

// Fetch data from local storage or JSON file
const savedRequests = localStorage.getItem("leaveRequests");

if (savedRequests) {
    employees = JSON.parse(savedRequests);
    refreshTable();
} else {
    fetch("./JSON/attendance.json")
        .then(response => response.json())
        .then(data => {
            employees = data.attendanceAndLeave;
            saveRequests();
            refreshTable();
        })
        .catch(error => console.log(error));
}

function saveRequests() {
    localStorage.setItem("leaveRequests", JSON.stringify(employees));
}

// ==========================================
// CORE DRAW & DISPLAY LOGIC
// ==========================================

function displayRequests(data) {
    const table = document.getElementById("leave-requests");
    table.innerHTML = "";

    if (!data || data.length === 0) {
        table.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; color: #888; padding: 20px;">
                    No leave requests found matching this status.
                </td>
            </tr>
        `;
        return;
    }

    data.forEach(employee => {
        // Find absolute global indices to prevent filtering mismatches
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

            table.innerHTML += `
                <tr>
                    <td><strong>${employee.name}</strong></td>
                    <td>${request.reason}</td>
                    <td>${request.date}</td>
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
    filterStatus();
}

function filterStatus() {
  const dropdown = document.getElementById("status");
  const selectedStatus = dropdown ? dropdown.value.trim().toLowerCase() : "all status";

  if (selectedStatus === "all status" || selectedStatus === "") {
    displayRequests(employees);
    return;
  }

  const filteredEmployees = [];

  employees.forEach(employee => {
    if (!employee.leaveRequests) return;

    const requests = employee.leaveRequests.filter(request => {
      const currentStatus = request.status ? request.status.trim().toLowerCase() : "";

      if (selectedStatus === "rejected") {
        return currentStatus === "denied" || currentStatus === "rejected";
      }

      return currentStatus === selectedStatus;
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

    // Update the layout's overview metric texts automatically
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

// 1. Success Popup Handlers (id="popup")
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

// 2. View Details Popup Handlers (id="view-popup")
function viewRequest(employeeIndex, requestIndex) {
    const employee = employees[employeeIndex];
    const request = employee.leaveRequests[requestIndex];
    
    const message = `<strong>Employee:</strong> ${employee.name}<br><br>
<strong>Leave Type:</strong> ${request.reason}<br><br>
<strong>Date:</strong> ${request.date}<br><br>
<strong>Status:</strong> ${request.status}`;

    document.getElementById("view-message").innerHTML = message;
    document.getElementById("view-popup").style.display = "flex";
}

function closeViewPopup() {
    document.getElementById("view-popup").style.display = "none";
}

// 3. Outside Click Listener for All 3 Popups
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
