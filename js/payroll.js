let payrollData = [];
let editingPayrollEmployeeId = null;

// Attach functions directly to window so inline onclick attributes can always find them
window.openPayrollForm = function (employeeId = null) {
  editingPayrollEmployeeId = employeeId;

  const overlay = document.getElementById("payroll-form-overlay");
  if (!overlay) {
    console.error("Target #payroll-form-overlay element not found in HTML.");
    return;
  }

  const isEditing = employeeId !== null;
  const titleEl = document.getElementById("payroll-form-title");
  if (titleEl) {
    titleEl.textContent = isEditing
      ? "Edit Payroll Record"
      : "Add Payroll Record";
  }

  const idField = document.getElementById("payroll-employee-id");
  if (idField) {
    idField.disabled = isEditing;
    idField.value = isEditing ? employeeId : "";
  }

  if (isEditing && Array.isArray(payrollData)) {
    const existing = payrollData.find((p) => p.employee_id === employeeId);
    if (existing) {
      if (document.getElementById("payroll-hours"))
        document.getElementById("payroll-hours").value =
          existing.hours_worked || "";
      if (document.getElementById("payroll-leave-deductions"))
        document.getElementById("payroll-leave-deductions").value =
          existing.leave_deductions || 0;
      if (document.getElementById("payroll-base-salary"))
        document.getElementById("payroll-base-salary").value =
          existing.base_salary ?? "";
      if (document.getElementById("payroll-bonus"))
        document.getElementById("payroll-bonus").value = existing.bonus ?? 0;
      if (document.getElementById("payroll-deductions"))
        document.getElementById("payroll-deductions").value =
          existing.deductions ?? 0;
    }
  } else {
    if (document.getElementById("payroll-hours"))
      document.getElementById("payroll-hours").value = "";
    if (document.getElementById("payroll-leave-deductions"))
      document.getElementById("payroll-leave-deductions").value = 0;
    if (document.getElementById("payroll-base-salary"))
      document.getElementById("payroll-base-salary").value = "";
    if (document.getElementById("payroll-bonus"))
      document.getElementById("payroll-bonus").value = 0;
    if (document.getElementById("payroll-deductions"))
      document.getElementById("payroll-deductions").value = 0;
  }

  overlay.style.display = "flex";
};

window.closePayrollForm = function () {
  const overlay = document.getElementById("payroll-form-overlay");
  if (overlay) overlay.style.display = "none";
  editingPayrollEmployeeId = null;
};

window.savePayrollForm = async function () {
  const employeeId = document.getElementById("payroll-employee-id")?.value;
  const hoursWorked = document.getElementById("payroll-hours")?.value;
  const leaveDeductions = document.getElementById(
    "payroll-leave-deductions",
  )?.value;
  const baseSalary = document.getElementById("payroll-base-salary")?.value;
  const bonus = document.getElementById("payroll-bonus")?.value;
  const deductions = document.getElementById("payroll-deductions")?.value;

  if (!employeeId || !hoursWorked || !baseSalary) {
    showPopup(
      "Missing Information",
      "Employee ID, hours worked, and base salary are required.",
      "#f59e0b",
      "fa-circle-exclamation",
    );
    return;
  }

  try {
    if (typeof PayrollAPI !== "undefined") {
      if (editingPayrollEmployeeId === null) {
        await PayrollAPI.create({
          employee_id: Number(employeeId),
          hours_worked: Number(hoursWorked),
          leave_deductions: Number(leaveDeductions) || 0,
          base_salary: Number(baseSalary),
          bonus: Number(bonus) || 0,
          deductions: Number(deductions) || 0,
        });
      } else {
        await PayrollAPI.update(editingPayrollEmployeeId, {
          hours_worked: Number(hoursWorked),
          leave_deductions: Number(leaveDeductions) || 0,
          bonus: Number(bonus) || 0,
          deductions: Number(deductions) || 0,
        });
      }

      payrollData = await PayrollAPI.getAll();
      displayPayroll();
      updateOverview();
    }

    closePayrollForm();
    showPopup(
      "Saved!",
      "The payroll record has been saved successfully.",
      "#22c55e",
      "fa-circle-check",
    );
  } catch (err) {
    showPopup("Save Failed", err.message, "#ef4444", "fa-circle-exclamation");
  }
};

window.viewPayroll = function (index) {
  const payroll = payrollData[index];
  if (!payroll) return;

  if (document.getElementById("card-id"))
    document.getElementById("card-id").textContent = payroll.employee_id;
  if (document.getElementById("card-hours"))
    document.getElementById("card-hours").textContent =
      payroll.hours_worked + " hrs";
  if (document.getElementById("card-leave"))
    document.getElementById("card-leave").textContent =
      payroll.leave_deductions + " hrs";
  if (document.getElementById("card-rate"))
    document.getElementById("card-rate").textContent =
      "R" + Number(payroll.hourly_rate).toFixed(2) + "/hr";
  if (document.getElementById("card-salary"))
    document.getElementById("card-salary").textContent =
      "R" + Number(payroll.final_salary).toLocaleString();
  if (document.getElementById("card-annual"))
    document.getElementById("card-annual").textContent =
      "R" + Number(payroll.annual_salary).toLocaleString();

  if (document.getElementById("print-id")) {
    document.getElementById("print-id").textContent = payroll.employee_id;
    document.getElementById("print-hours").textContent =
      payroll.hours_worked + " hrs";
    document.getElementById("print-salary").textContent =
      "R" + Number(payroll.final_salary).toLocaleString();
    document.getElementById("print-tax").textContent =
      "R" +
      Number(payroll.tax).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    document.getElementById("print-pension").textContent =
      "R" +
      Number(payroll.pension).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    document.getElementById("print-medical").textContent =
      "R" +
      Number(payroll.medical).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    document.getElementById("print-net").textContent =
      "R" +
      Number(payroll.net_salary).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    document.getElementById("print-annual").textContent =
      "R" + Number(payroll.annual_salary).toLocaleString();
  }

  // Wire up the Edit button inside the view card popup
  const cardEditBtn = document.getElementById("card-edit-btn");
  if (cardEditBtn) {
    cardEditBtn.onclick = function () {
      closePayrollCard();
      openPayrollForm(payroll.employee_id);
    };
  }

  const commentEl = document.getElementById("payroll-comment");
  if (commentEl) commentEl.value = "";

  const overlay = document.getElementById("payroll-overlay");
  if (overlay) overlay.style.display = "flex";
};

window.closePayrollCard = function () {
  const overlay = document.getElementById("payroll-overlay");
  if (overlay) overlay.style.display = "none";
};

window.savePayrollComment = function () {
  const commentEl = document.getElementById("payroll-comment");
  const comment = commentEl ? commentEl.value.trim() : "";

  if (comment === "") {
    showPopup(
      "No Comment",
      "Please enter a comment before saving.",
      "#f59e0b",
      "fa-circle-exclamation",
    );
    return;
  }

  if (commentEl) commentEl.value = "";
  closePayrollCard();
  showPopup(
    "Comment Saved!",
    "Your payroll comment has been saved successfully.",
    "#22c55e",
    "fa-circle-check",
  );
};

window.closePopup = function () {
  const popup = document.getElementById("popup");
  if (popup) popup.style.display = "none";
};

function showPopup(title, message, color, iconClass) {
  const popup = document.getElementById("popup");
  if (!popup) return;
  const icon = document.getElementById("popup-icon");
  if (icon) {
    icon.className = `fa-solid ${iconClass}`;
    icon.style.color = color;
  }
  const titleEl = document.getElementById("popup-title");
  if (titleEl) titleEl.textContent = title;
  const msgEl = document.getElementById("popup-message");
  if (msgEl) msgEl.textContent = message;
  popup.style.display = "flex";
}

function displayPayroll() {
  const table = document.getElementById("payroll-data");
  if (!table) return;
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
          <button class="edit-btn" onclick="openPayrollForm(${payroll.employee_id})">
            Edit
          </button>
        </td>
      </tr>
    `;
  });
}

function updateOverview() {
  const totalEmployees = payrollData.length;
  let totalSalary = 0;
  let totalHours = 0;

  payrollData.forEach((employee) => {
    totalSalary += Number(employee.final_salary || 0);
    totalHours += Number(employee.hours_worked || 0);
  });

  const averageSalary = totalEmployees
    ? Math.round(totalSalary / totalEmployees)
    : 0;
  const averageHours = totalEmployees
    ? Math.round(totalHours / totalEmployees)
    : 0;

  const card1 = document.querySelector(
    ".payroll-summary .summary-card:nth-child(1) p",
  );
  const card2 = document.querySelector(
    ".payroll-summary .summary-card:nth-child(2) p",
  );
  const card3 = document.querySelector(
    ".payroll-summary .summary-card:nth-child(3) p",
  );
  const card4 = document.querySelector(
    ".payroll-summary .summary-card:nth-child(4) p",
  );

  if (card1) card1.textContent = totalEmployees;
  if (card2) card2.textContent = "R" + averageSalary.toLocaleString();
  if (card3) card3.textContent = "R" + totalSalary.toLocaleString();
  if (card4) card4.textContent = averageHours + " hrs";
}

// Safely initialize role check and API call after DOM content is loaded
document.addEventListener("DOMContentLoaded", () => {
  // Hide Add button for standard employee users
  try {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    const addBtn = document.getElementById("open-payroll-form-btn");
    if (currentUser && currentUser.role === "employee" && addBtn) {
      addBtn.style.display = "none";
    }
  } catch (e) {
    console.warn("Could not retrieve currentUser from localStorage:", e);
  }

  // Load Payroll Data
  if (typeof PayrollAPI !== "undefined") {
    PayrollAPI.getAll()
      .then((data) => {
        payrollData = data || [];
        displayPayroll();
        updateOverview();
      })
      .catch((err) => {
        console.error("Payroll fetch failed:", err);
        showPopup(
          "Couldn't load payroll",
          err.message,
          "#ef4444",
          "fa-circle-exclamation",
        );
      });
  } else {
    console.warn("PayrollAPI is not defined. Verify api.js script import.");
  }
});
