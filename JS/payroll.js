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
          <button class="view-btn" onclick="viewPayroll(${index})">
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

  document.querySelector(".payroll-summary .summary-card:nth-child(1) p").textContent = totalEmployees;
  document.querySelector(".payroll-summary .summary-card:nth-child(2) p").textContent = "R" + averageSalary.toLocaleString();
  document.querySelector(".payroll-summary .summary-card:nth-child(3) p").textContent = "R" + totalSalary.toLocaleString();
  document.querySelector(".payroll-summary .summary-card:nth-child(4) p").textContent = averageHours + " hrs";
}

// ---------------- View Payroll ----------------
function viewPayroll(index) {
  const payroll = payrollData[index];

  // Calculations
  const hourlyRate = payroll.finalSalary / (payroll.hoursWorked - payroll.leaveDeductions);
  const tax = payroll.finalSalary * 0.18;
  const pension = payroll.finalSalary * 0.05;
  const medical = payroll.finalSalary * 0.02;
  const netSalary = payroll.finalSalary - (tax + pension + medical);
  const annualSalary = payroll.finalSalary * 12;

  // 1. POPULATE ON-SCREEN VIEW CARD (Includes basic details and Annual Salary)
  document.getElementById("card-id").textContent = payroll.employeeId;
  document.getElementById("card-hours").textContent = payroll.hoursWorked + " hrs";
  document.getElementById("card-leave").textContent = payroll.leaveDeductions + " hrs";
  document.getElementById("card-rate").textContent = "R" + hourlyRate.toFixed(2) + "/hr";
  document.getElementById("card-salary").textContent = "R" + payroll.finalSalary.toLocaleString();
  
  // UPDATED: Sends annual salary directly to the view card element now
  document.getElementById("card-annual").textContent = "R" + annualSalary.toLocaleString();

  // 2. POPULATE HIDDEN PRINT SLIP (Includes annual amounts & all backend calculations)
  if (document.getElementById("print-id")) {
    document.getElementById("print-id").textContent = payroll.employeeId;
    document.getElementById("print-hours").textContent = payroll.hoursWorked + " hrs";
    document.getElementById("print-salary").textContent = "R" + payroll.finalSalary.toLocaleString();
    document.getElementById("print-tax").textContent = "R" + tax.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
    document.getElementById("print-pension").textContent = "R" + pension.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
    document.getElementById("print-medical").textContent = "R" + medical.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
    document.getElementById("print-net").textContent = "R" + netSalary.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
    document.getElementById("print-annual").textContent = "R" + annualSalary.toLocaleString();
  }

  // Reset comment and display the complete overlay container
  document.getElementById("payroll-comment").value = "";
  document.getElementById("payroll-overlay").style.display = "block";
}

// ---------------- Close Card ----------------
function closePayrollCard() {
  document.getElementById("payroll-overlay").style.display = "none";
}

// ---------------- Save Comment ----------------
function savePayrollComment() {
  const comment = document.getElementById("payroll-comment").value.trim();

  if (comment === "") {
    document.getElementById("popup-icon").className = "fa-solid fa-circle-exclamation";
    document.getElementById("popup-icon").style.color = "#f59e0b";
    document.getElementById("popup-title").textContent = "No Comment";
    document.getElementById("popup-message").textContent = "Please enter a comment before saving.";
    document.getElementById("popup").style.display = "flex";
    return;
  }

  document.getElementById("payroll-comment").value = "";
  document.getElementById("payroll-overlay").style.display = "none";

  document.getElementById("popup-icon").className = "fa-solid fa-circle-check";
  document.getElementById("popup-icon").style.color = "#22c55e";
  document.getElementById("popup-title").textContent = "Comment Saved!";
  document.getElementById("popup-message").textContent = "Your payroll comment has been saved successfully.";
  document.getElementById("popup").style.display = "flex";
}

function closePopup() {
  document.getElementById("popup").style.display = "none";
}
