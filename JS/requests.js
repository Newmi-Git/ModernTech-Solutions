let employees = [];

fetch("./JSON/attendance.json")
  .then(response => response.json())
  .then(data => {

    employees = data.attendanceAndLeave;

    displayRequests(employees);

  })
  .catch(error => console.log(error));



function displayRequests(data) {

  const table = document.getElementById("leave-requests");

  table.innerHTML = "";

  data.forEach((employee, employeeIndex) => {

    employee.leaveRequests.forEach((request, requestIndex) => {

      let buttons = "";

      if (request.status === "Pending") {

        buttons = `
          <button
            class="approve"
            onclick="approveRequest(${employeeIndex}, ${requestIndex})">
            Approve
          </button>

          <button
            class="reject"
            onclick="rejectRequest(${employeeIndex}, ${requestIndex})">
            Reject
          </button>
        `;

      } else {

        buttons = `
          <button class="view">
            View
          </button>
        `;

      }

      table.innerHTML += `
        <tr>

          <td>${employee.name}</td>

          <td>${request.reason}</td>

          <td>${request.date}</td>

          <td>
            <span class="${request.status.toLowerCase()}">
              ${request.status}
            </span>
          </td>

          <td>
            ${buttons}
          </td>

        </tr>
      `;

    });

  });

}



/* ---------- Approve Request ---------- */

function approveRequest(employeeIndex, requestIndex) {

  employees[employeeIndex].leaveRequests[requestIndex].status = "Approved";

  displayRequests(employees);

}



/* ---------- Reject Request ---------- */

function rejectRequest(employeeIndex, requestIndex) {

  employees[employeeIndex].leaveRequests[requestIndex].status = "Denied";

  displayRequests(employees);

}



/* ---------- Filter Requests ---------- */

function filterStatus() {

  const selectedStatus = document.getElementById("status").value;

  if (selectedStatus === "All Status") {

    displayRequests(employees);

    return;

  }

  const filteredEmployees = [];

  employees.forEach(employee => {

    const requests = employee.leaveRequests.filter(request => {

      if (selectedStatus === "Rejected") {
        return request.status === "Denied";
      }

      return request.status === selectedStatus;

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
