let payrollData = [];

// Fetch Payroll JSON

fetch("./JSON/payroll_data.json")
  .then(response => response.json())
  .then(data => {

    payrollData = data.payrollData;

    displayPayroll();

    updateOverview();

  })

  .catch(error => console.log(error));



// ---------------- Display Payroll Table ----------------

function displayPayroll() {

  const table = document.getElementById("payroll-data");

  table.innerHTML = "";

  payrollData.forEach((payroll, index) => {

    table.innerHTML += `

      <tr>

        <td>${payroll.employeeId}</td>

        <td>${payroll.hoursWorked} hrs</td>

        <td>R${payroll.finalSalary.toLocaleString()}</td>

        <td>

          <button
            class="view-btn"
            onclick="viewPayroll(${index})">

            View

          </button>

        </td>

      </tr>

    `;

  });

}



// ---------------- Payroll Overview ----------------

function updateOverview() {

  const totalEmployees = payrollData.length;

  let totalSalary = 0;
  let totalHours = 0;

  payrollData.forEach(employee => {

    totalSalary += employee.finalSalary;
    totalHours += employee.hoursWorked;

  });

  const averageSalary = Math.round(totalSalary / totalEmployees);

  const averageHours = Math.round(totalHours / totalEmployees);

  document.querySelector(".payroll-summary .summary-card:nth-child(1) p").textContent =
    totalEmployees;

  document.querySelector(".payroll-summary .summary-card:nth-child(2) p").textContent =
    "R" + averageSalary.toLocaleString();

  document.querySelector(".payroll-summary .summary-card:nth-child(3) p").textContent =
    "R" + totalSalary.toLocaleString();

  document.querySelector(".payroll-summary .summary-card:nth-child(4) p").textContent =
    averageHours + " hrs";

}



// ---------------- View Payroll ----------------

function viewPayroll(index) {

  const payroll = payrollData[index];

  const hourlyRate =
    payroll.finalSalary /
    (payroll.hoursWorked - payroll.leaveDeductions);

  document.getElementById("card-id").textContent =
    payroll.employeeId;

  document.getElementById("card-hours").textContent =
    payroll.hoursWorked + " hrs";

  document.getElementById("card-leave").textContent =
    payroll.leaveDeductions + " hrs";

  document.getElementById("card-rate").textContent =
    "R" + hourlyRate.toFixed(2) + "/hr";

  document.getElementById("card-salary").textContent =
    "R" + payroll.finalSalary.toLocaleString();

  document.getElementById("payroll-comment").value = "";

  document.getElementById("payroll-card").style.display = "block";

}



// ---------------- Close Card ----------------

function closePayrollCard() {

  document.getElementById("payroll-card").style.display = "none";

}

// ---------------- Save Comment ----------------

function savePayrollComment() {

    const comment = document.getElementById("payroll-comment").value.trim();

    if (comment === "") {

        document.getElementById("popup-icon").className =
            "fa-solid fa-circle-exclamation";

        document.getElementById("popup-icon").style.color = "#f59e0b";

        document.getElementById("popup-title").textContent =
            "No Comment";

        document.getElementById("popup-message").textContent =
            "Please enter a comment before saving.";

        document.getElementById("popup").style.display = "flex";

        return;

    }

    document.getElementById("payroll-comment").value = "";

    document.getElementById("payroll-card").style.display = "none";

    document.getElementById("popup-icon").className =
        "fa-solid fa-circle-check";

    document.getElementById("popup-icon").style.color = "#22c55e";

    document.getElementById("popup-title").textContent =
        "Comment Saved!";

    document.getElementById("popup-message").textContent =
        "Your payroll comment has been saved successfully.";

    document.getElementById("popup").style.display = "flex";

}

function closePopup() {

    document.getElementById("popup").style.display = "none";

}
