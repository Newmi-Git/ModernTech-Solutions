let payrollData = [];

// ---------------- Load Payroll ----------------
// The backend already returns hourly_rate, tax, pension, medical, net_salary
// and annual_salary pre-calculated — no need to recompute them here.
PayrollAPI.getAll()
  .then(data => {
    payrollData = data;
    displayPayroll();
    updateOverview();
  })
  .catch(err => {
    console.error(err);
    document.getElementById("popup-icon").className = "fa-solid fa-circle-exclamation";
    document.getElementById("popup-icon").style.color = "#ef4444";
    document.getElementById("popup-title").textContent = "Couldn't load payroll";
    document.getElementById("popup-message").textContent = err.message;
    document.getElementById("popup").style.display = "flex";
  });

// ---------------- Display Payroll Table ----------------
function displayPayroll() {
  const table = document.getElementById("payroll-data");
  table.innerHTML = "";

  payrollData.forEach((payroll, index) => {
    table.innerHTML += `
      <tr>
        <td>${payroll.employee_id}</td>
        <td>${payroll.hours_worked} hrs</td>
        <td>R${Number(payroll.final_salary).toLocaleString()}</td>
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
    totalSalary += Number(employee.final_salary);
    totalHours += Number(employee.hours_worked);
  });

  const averageSalary = totalEmployees ? Math.round(totalSalary / totalEmployees) : 0;
  const averageHours = totalEmployees ? Math.round(totalHours / totalEmployees) : 0;

  document.querySelector(".payroll-summary .summary-card:nth-child(1) p").textContent = totalEmployees;
  document.querySelector(".payroll-summary .summary-card:nth-child(2) p").textContent = "R" + averageSalary.toLocaleString();
  document.querySelector(".payroll-summary .summary-card:nth-child(3) p").textContent = "R" + totalSalary.toLocaleString();
  document.querySelector(".payroll-summary .summary-card:nth-child(4) p").textContent = averageHours + " hrs";
}

// ---------------- View Payroll ----------------
function viewPayroll(index) {
  const payroll = payrollData[index];

  // 1. POPULATE ON-SCREEN VIEW CARD
  document.getElementById("card-id").textContent = payroll.employee_id;
  document.getElementById("card-hours").textContent = payroll.hours_worked + " hrs";
  document.getElementById("card-leave").textContent = payroll.leave_deductions + " hrs";
  document.getElementById("card-rate").textContent = "R" + Number(payroll.hourly_rate).toFixed(2) + "/hr";
  document.getElementById("card-salary").textContent = "R" + Number(payroll.final_salary).toLocaleString();
  document.getElementById("card-annual").textContent = "R" + Number(payroll.annual_salary).toLocaleString();

  // 2. POPULATE HIDDEN PRINT SLIP
  if (document.getElementById("print-id")) {
    document.getElementById("print-id").textContent = payroll.employee_id;
    document.getElementById("print-hours").textContent = payroll.hours_worked + " hrs";
    document.getElementById("print-salary").textContent = "R" + Number(payroll.final_salary).toLocaleString();
    document.getElementById("print-tax").textContent = "R" + Number(payroll.tax).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
    document.getElementById("print-pension").textContent = "R" + Number(payroll.pension).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
    document.getElementById("print-medical").textContent = "R" + Number(payroll.medical).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
    document.getElementById("print-net").textContent = "R" + Number(payroll.net_salary).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
    document.getElementById("print-annual").textContent = "R" + Number(payroll.annual_salary).toLocaleString();
  }

  document.getElementById("payroll-comment").value = "";
  document.getElementById("payroll-overlay").style.display = "block";
}

// ---------------- Close Card ----------------
function closePayrollCard() {
  document.getElementById("payroll-overlay").style.display = "none";
}

// ---------------- Save Comment ----------------
// Note: there is no backend endpoint for payroll comments yet — this stays local-only.
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
