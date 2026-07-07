// ── Helpers ──────────────────────────────────────────────
function getInitials(name) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

function avatarClass(index) {
  return `av${index % 6}`;
}

function getScoreClass(score) {
  if (score === null || score === undefined) return "low";
  if (score >= 80) return "high";
  if (score >= 60) return "mid";
  return "low";
}

function getStatus(emp) {
  if (!emp.reviewed) return { label: "Awaiting Review", cls: "pending" };
  if (emp.score >= 80) return { label: "Top Performer", cls: "top" };
  if (emp.score >= 60) return { label: "Meets Expectations", cls: "meets" };
  return { label: "Needs Improvement", cls: "improve" };
}

function formatCurrency(amount) {
  if (amount === null || amount === undefined) return "—";
  return `R ${amount.toLocaleString("en-ZA")}`;
}

function loadData(storageKey, jsonFile, jsonProperty) {
  const savedData = localStorage.getItem(storageKey);
  if (savedData) return Promise.resolve(JSON.parse(savedData));
  return fetch(jsonFile)
    .then((res) => res.json())
    .then((data) => {
      localStorage.setItem(storageKey, JSON.stringify(data[jsonProperty]));
      return data[jsonProperty];
    });
}

// Employees are read straight from localStorage — this is the same key
// your partner's Employee CRUD form should be writing to.
function loadEmployees() {
  return loadData("employees", "DummyData/employee_info.json", "employeeInformation");
}

// ── Scoring ──────────────────────────────────────────────
// 60% weight from attendance %, 40% weight from payroll efficiency (finalSalary / baseSalary)
function calcScore(baseSalary, finalSalary, attendancePercentage) {
  const attendanceComponent = (attendancePercentage / 100) * 60;
  const payrollEff = baseSalary > 0 ? Math.min(finalSalary / baseSalary, 1) : 0;
  const payrollComponent = payrollEff * 40;
  return Math.round(attendanceComponent + payrollComponent);
}

// Normalises a stored payroll record so it always has finalSalary
function resolvePayroll(baseSalary, payrollRecord) {

    if (!payrollRecord) return null;

    return {
        employeeId: payrollRecord.employeeId,

        hoursWorked: payrollRecord.hoursWorked || 0,

        leaveDeductions: payrollRecord.leaveDeductions || 0,

        finalSalary: payrollRecord.finalSalary
    };

}

// Normalises a stored attendance record so it always has attendancePercentage
function resolveAttendance(attendanceRecord, employee) {

  // Attendance record exists in localStorage
  if (attendanceRecord) {

    if (typeof attendanceRecord.attendancePercentage === "number") {
      return attendanceRecord;
    }

    if (Array.isArray(attendanceRecord.attendance)) {

      const total = attendanceRecord.attendance.length;

      const present = attendanceRecord.attendance.filter(
        a => a.status === "Present"
      ).length;

      return {
        attendancePercentage:
          total ? Math.round((present / total) * 100) : 0,

        leaveTaken: total - present
      };

    }

  }

  // Fall back to employee_info.json values
  return {
    attendancePercentage: employee.attendance || 0,
    leaveTaken: 0
  };

}
// ── Merge employees + payroll + attendance, flag reviewed state ──
function mergeData(employees, payrolls, attendances) {
  return employees.map((emp, i) => {
    const payrollRaw = payrolls.find((p) => p.employeeId === emp.employeeId);
    const attendanceRaw = attendances.find((a) => a.employeeId === emp.employeeId);
    const payroll = resolvePayroll(emp.salary, payrollRaw);
    const attendance = resolveAttendance(attendanceRaw);
    const reviewed = Boolean(payroll && attendance);

    if (!reviewed) {
      return {
        ...emp, index: i, reviewed: false,
        score: null, finalSalary: null, attendancePct: null, leaveDeductions: null,
      };
    }

    const score = calcScore(emp.salary, payroll.finalSalary, attendance.attendancePercentage);

    return {
      ...emp, index: i, reviewed: true, score,
      finalSalary: payroll.finalSalary,
      hoursWorked: payroll.hoursWorked,
      leaveDeductions: payroll.leaveDeductions,
      attendancePct: attendance.attendancePercentage,
      leaveRequests: attendance.leaveRequests || []
    };
  });
}

// ── App state ──────────────────────────────────────────────
const state = { employees: [], payrolls: [], attendances: [], data: [] };

function refresh() {
  state.data = mergeData(state.employees, state.payrolls, state.attendances);
  renderStats(state.data);
  renderScoreDistribution(state.data);
  renderDeptAverages(state.data);
  renderTable(document.getElementById("empSearch").value);
}

// ── Stat cards ────────────────────────────────────────────
function renderStats(data) {
  const reviewed = data.filter((e) => e.reviewed);
  const pending = data.length - reviewed.length;
  const total = data.length;
  const avg = reviewed.length ? Math.round(reviewed.reduce((s, e) => s + e.score, 0) / reviewed.length) : 0;
  const top = reviewed.filter((e) => e.score >= 80).length;
  const improve = reviewed.filter((e) => e.score < 60).length;

  document.getElementById("stat-avg").innerHTML = `${reviewed.length ? avg : "—"}<span>/ 100</span>`;
  document.getElementById("stat-avg-sub").textContent = reviewed.length
    ? `Across ${reviewed.length} reviewed employee${reviewed.length !== 1 ? "s" : ""}`
    : "No reviewed employees yet";

  document.getElementById("stat-top").innerHTML = `${top}<span> employees</span>`;
  document.getElementById("stat-top-sub").textContent = reviewed.length
    ? `${Math.round((top / reviewed.length) * 100)}% of reviewed staff` : "—";

  document.getElementById("stat-improve").innerHTML = `${improve}<span> employees</span>`;
  document.getElementById("stat-improve-sub").textContent = reviewed.length
    ? `${Math.round((improve / reviewed.length) * 100)}% of reviewed staff` : "—";
  document.getElementById("stat-improve-sub").className = improve > 0 ? "card-change negative" : "card-change positive";

  document.getElementById("stat-total").innerHTML = `${total}<span> employees</span>`;
  document.getElementById("stat-total-sub").textContent = pending > 0 ? `${pending} awaiting review` : "All records reviewed";
  document.getElementById("stat-total-sub").className = pending > 0 ? "card-change neutral" : "card-change positive";
}

// ── Score distribution (reviewed employees only) ─────────
function renderScoreDistribution(data) {
  const reviewed = data.filter((e) => e.reviewed);
  const bands = [
    { label: "90–100", min: 90, max: 100, cls: "bg-gold" },
    { label: "75–89", min: 75, max: 89, cls: "bg-gold" },
    { label: "60–74", min: 60, max: 74, cls: "bg-purple" },
    { label: "Below 60", min: 0, max: 59, cls: "bg-danger" },
  ];
  const total = reviewed.length;
  const container = document.getElementById("score-distribution");
  container.innerHTML = "";

  if (total === 0) {
    container.innerHTML = `<p class="text-muted" style="font-size:12px;">No reviewed employees yet.</p>`;
    return;
  }

  bands.forEach((band) => {
    const count = reviewed.filter((e) => e.score >= band.min && e.score <= band.max).length;
    const pct = Math.round((count / total) * 100);
    container.innerHTML += `
      <div>
        <div class="d-flex justify-content-between mb-1">
          <span class="bar-label">${band.label}</span>
          <span class="bar-count">${count}</span>
        </div>
        <div class="progress" style="height: 10px;">
          <div class="progress-bar ${band.cls}" style="width: ${pct}%"></div>
        </div>
      </div>
    `;
  });
}

// ── Department averages (reviewed employees only) ────────
function renderDeptAverages(data) {
  const reviewed = data.filter((e) => e.reviewed);
  const depts = {};
  reviewed.forEach((e) => {
    if (!depts[e.department]) depts[e.department] = [];
    depts[e.department].push(e.score);
  });

  const container = document.getElementById("dept-averages");
  container.innerHTML = "";

  if (Object.keys(depts).length === 0) {
    container.innerHTML = `<p class="text-muted" style="font-size:12px;">No reviewed employees yet.</p>`;
    return;
  }

  Object.entries(depts).forEach(([dept, scores]) => {
    const avg = Math.round(scores.reduce((s, v) => s + v, 0) / scores.length);
    container.innerHTML += `
      <div>
        <div class="d-flex justify-content-between mb-1">
          <span class="bar-label">${dept}</span>
          <span class="fw-bold" style="font-size:12px">${avg}</span>
        </div>
        <div class="progress" style="height: 8px;">
          <div class="progress-bar bg-gradient-brand" style="width: ${avg}%"></div>
        </div>
      </div>
    `;
  });
}

// ── Employee table ────────────────────────────────────────
function renderTable(query = "") {
  const tbody = document.getElementById("empTable");
  const q = query.toLowerCase();
  const filtered = state.data.filter((e) =>
    e.name.toLowerCase().includes(q) ||
    e.department.toLowerCase().includes(q) ||
    e.position.toLowerCase().includes(q)
  );

  tbody.innerHTML = "";
  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" class="text-center text-muted py-4">No employees found.</td></tr>`;
    return;
  }

  filtered.forEach((emp) => {
    const status = getStatus(emp);
    const initials = getInitials(emp.name);

    tbody.innerHTML += `
      <tr class="${emp.reviewed ? "" : "row-pending"}" style="cursor:pointer" data-id="${emp.employeeId}">
        <td>
          <div class="d-flex align-items-center gap-2">
            <div class="avatar ${avatarClass(emp.index)}">${initials}</div>
            ${emp.name}
          </div>
        </td>
        <td>${emp.department}</td>
        <td>${emp.position}</td>
        <td>${emp.reviewed ? `<span class="score-badge ${getScoreClass(emp.score)}">${emp.score}</span>` : `<span class="pending-dash">—</span>`}</td>
        <td>${emp.reviewed ? `${emp.attendancePct}%` : `<span class="pending-dash">—</span>`}</td>
        <td>${emp.reviewed ? `${emp.leaveDeductions} day${emp.leaveDeductions !== 1 ? "s" : ""}` : `<span class="pending-dash">—</span>`}</td>
        <td>${emp.reviewed ? formatCurrency(emp.finalSalary) : `<span class="pending-dash">—</span>`}</td>
        <td><span class="status-badge ${status.cls}">${status.label}</span></td>
      </tr>
    `;
  });
}

// ── Search ────────────────────────────────────────────────
function initSearch() {
  document.getElementById("empSearch").addEventListener("input", function () {
    renderTable(this.value);
  });
}

// ── Employee modal ────────────────────────────────────────
function initModal() {
  document.getElementById("empTable").addEventListener("click", function (e) {
    const row = e.target.closest("tr");
    if (!row || !row.dataset.id) return;
    const emp = state.data.find((e) => e.employeeId === parseInt(row.dataset.id));
    if (emp) openEmployeeModal(emp);
  });
}

function openEmployeeModal(emp) {
  document.getElementById("modal-name").textContent = emp.name;
  document.getElementById("modal-position").textContent = `${emp.position} · ${emp.department}`;

  const body = document.getElementById("modal-dynamic-body");
  body.innerHTML = emp.reviewed ? renderAdvancedStats(emp) : renderAwaitingReviewPanel(emp);
  if (!emp.reviewed) attachGradeButtonListener(emp);

  const exportBtn = document.getElementById("modal-export-btn");
  exportBtn.onclick = () => exportEmployeeReport(emp);
  exportBtn.disabled = !emp.reviewed;
  exportBtn.title = emp.reviewed ? "" : "Grade this employee first";

  bootstrap.Modal.getOrCreateInstance(document.getElementById("employeeModal")).show();
}

function renderAwaitingReviewPanel(emp) {
  return `
    <div class="awaiting-panel text-center py-4">
      <div class="awaiting-icon mb-3">X</div>
      <h6 class="fw-bold mb-2">Awaiting Review</h6>
      <p class="text-muted mb-4" style="font-size:12px;">
        ${emp.name} hasn't been graded yet — no payroll or attendance data is on file.
        Grade this employee to generate their performance score.
      </p>
      <button type="button" class="btn-grade" id="grade-trigger-btn">Grade Employee</button>
    </div>
  `;
}

function attachGradeButtonListener(emp) {
  const btn = document.getElementById("grade-trigger-btn");
  if (btn) btn.onclick = () => openGradeModal(emp);
}

function renderAdvancedStats(emp) {
  const scoreColor = emp.score >= 80 ? "#FFBA27" : emp.score >= 60 ? "#E66AFF" : "#c0392b";
  const goalsPct = emp.goalsTotal > 0 ? Math.round((emp.goalsMet / emp.goalsTotal) * 100) : 0;

  return `
    <div class="row g-3">
      <div class="col-5 text-center">
        <div class="score-gauge" style="background: conic-gradient(${scoreColor} ${emp.score * 3.6}deg, #eee 0deg);">
          <div class="score-gauge-inner">
            <span class="score-gauge-value">${emp.score}</span>
            <span class="score-gauge-label">/ 100</span>
          </div>
        </div>
        <p class="mt-2 mb-0" style="font-size:11px; color:#888;">Overall Performance</p>
      </div>
      <div class="col-7">
        <div class="mb-3">
          <div class="d-flex justify-content-between mb-1">
            <span class="bar-label">Attendance</span>
            <span class="bar-count">${emp.attendancePct}%</span>
          </div>
          <div class="progress" style="height:8px;"><div class="progress-bar bg-gold" style="width:${emp.attendancePct}%"></div></div>
        </div>
        <div class="mb-3">
          <div class="d-flex justify-content-between mb-1">
            <span class="bar-label">Goals Met</span>
            <span class="bar-count">${emp.goalsMet} / ${emp.goalsTotal}</span>
          </div>
          <div class="progress" style="height:8px;"><div class="progress-bar bg-purple" style="width:${goalsPct}%"></div></div>
        </div>
        <div class="d-flex justify-content-between">
          <span class="bar-label">Leave Days Taken</span>
          <span class="bar-count">${emp.leaveDeductions}</span>
        </div>
      </div>
    </div>
    <hr class="my-3">
    <table class="table table-sm mb-0" style="font-size:12px;">
      <tbody>
        <tr><td class="text-muted">Base Salary</td><td>${formatCurrency(emp.salary)}</td></tr>
        <tr><td class="text-muted">Final Salary</td><td>${formatCurrency(emp.finalSalary)}</td></tr>
        <tr><td class="text-muted">Contact</td><td>${emp.contact}</td></tr>
        <tr><td class="text-muted">History</td><td>${emp.employmentHistory}</td></tr>
      </tbody>
    </table>
  `;
}

// ── Grading ───────────────────────────────────────────────
let gradeTargetEmp = null;

function openGradeModal(emp) {
  gradeTargetEmp = emp;
  document.getElementById("grade-emp-name").textContent = `Grading ${emp.name} — ${emp.position}`;
  document.getElementById("gradeForm").reset();
  document.getElementById("grade-bonus").value = 0;
  document.getElementById("grade-deductions").value = 0;
  clearGradeErrors();
  bootstrap.Modal.getOrCreateInstance(document.getElementById("employeeModal")).hide();
  bootstrap.Modal.getOrCreateInstance(document.getElementById("gradeModal")).show();
}

function clearGradeErrors() {
  ["goalsMet", "goalsTotal", "attendance", "leave", "bonus", "deductions"].forEach((f) => {
    document.getElementById(`grade-${f}`).classList.remove("is-invalid");
    const errEl = document.getElementById(`err-${f}`);
    if (errEl) { errEl.textContent = ""; errEl.style.display = "none"; }
  });
}

function initGradeForm() {
  document.getElementById("gradeForm").addEventListener("submit", function (e) {
    e.preventDefault();
    clearGradeErrors();

    const goalsMet = Number(document.getElementById("grade-goalsMet").value);
    const goalsTotal = Number(document.getElementById("grade-goalsTotal").value);
    const attendance = Number(document.getElementById("grade-attendance").value);
    const leave = Number(document.getElementById("grade-leave").value);
    const bonus = Number(document.getElementById("grade-bonus").value);
    const deductions = Number(document.getElementById("grade-deductions").value);

    let hasError = false;
    const markError = (field, message) => {
      document.getElementById(`grade-${field}`).classList.add("is-invalid");
      const errEl = document.getElementById(`err-${field}`);
      if (errEl) { errEl.textContent = message; errEl.style.display = "block"; }
      hasError = true;
    };

    if (!Number.isFinite(goalsMet) || goalsMet < 0) markError("goalsMet", "Enter a valid number of goals met.");
    if (!Number.isFinite(goalsTotal) || goalsTotal < 1) markError("goalsTotal", "Total goals must be at least 1.");
    if (goalsTotal >= 1 && goalsMet > goalsTotal) markError("goalsMet", "Goals met can't exceed total goals.");
    if (!Number.isFinite(attendance) || attendance < 0 || attendance > 100) markError("attendance", "Enter a value between 0 and 100.");
    if (!Number.isFinite(leave) || leave < 0) markError("leave", "Leave days can't be negative.");
    if (!Number.isFinite(bonus) || bonus < 0) markError("bonus", "Bonus can't be negative.");
    if (!Number.isFinite(deductions) || deductions < 0) markError("deductions", "Deductions can't be negative.");

    if (hasError) return;
    saveGrade(gradeTargetEmp, { goalsMet, goalsTotal, attendance, leave, bonus, deductions });
  });
}

function saveGrade(emp, { goalsMet, goalsTotal, attendance, leave, bonus, deductions }) {
  const finalSalary = emp.salary + bonus - deductions;

  const payrollIndex = state.payrolls.findIndex((p) => p.employeeId === emp.employeeId);
  const payrollRecord = { employeeId: emp.employeeId, salary: emp.salary, bonus, deductions, finalSalary };
  if (payrollIndex >= 0) state.payrolls[payrollIndex] = payrollRecord;
  else state.payrolls.push(payrollRecord);
  localStorage.setItem("payroll", JSON.stringify(state.payrolls));

  const attendanceIndex = state.attendances.findIndex((a) => a.employeeId === emp.employeeId);
  const attendanceRecord = { employeeId: emp.employeeId, attendancePercentage: attendance, leaveTaken: leave };
  if (attendanceIndex >= 0) state.attendances[attendanceIndex] = attendanceRecord;
  else state.attendances.push(attendanceRecord);
  localStorage.setItem("attendance", JSON.stringify(state.attendances));

  const empIndex = state.employees.findIndex((e) => e.employeeId === emp.employeeId);
  if (empIndex >= 0) {
    state.employees[empIndex].goalsMet = goalsMet;
    state.employees[empIndex].goalsTotal = goalsTotal;
    localStorage.setItem("employees", JSON.stringify(state.employees));
  }

  refresh();
  bootstrap.Modal.getOrCreateInstance(document.getElementById("gradeModal")).hide();
  showToast(`${emp.name} has been graded.`);

  const updatedEmp = state.data.find((e) => e.employeeId === emp.employeeId);
  if (updatedEmp) setTimeout(() => openEmployeeModal(updatedEmp), 300);
}

// ── Toast feedback ────────────────────────────────────────
function showToast(message) {
  let toast = document.getElementById("app-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "app-toast";
    toast.className = "app-toast";
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toast._hideTimer);
  toast._hideTimer = setTimeout(() => toast.classList.remove("show"), 3000);
}

// ── Reports (styled, printable HTML) ─────────────────────
function buildReportDocument(title, bodyHtml) {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>${title}</title>
<style>
  body { font-family: system-ui, Arial, sans-serif; background:#efefef; margin:0; padding:40px; color:#1a1400; }
  .report { max-width: 800px; margin: 0 auto; background:#fff; border-radius:16px; overflow:hidden; box-shadow:0 4px 20px rgba(0,0,0,0.08); }
  .report-header { background:#1a1400; color:#FFFEEC; padding:28px 36px; }
  .report-header h1 { margin:0; font-size:22px; }
  .report-header p { margin:4px 0 0; font-size:12px; color:#FFBA27; letter-spacing:1px; text-transform:uppercase; }
  .report-body { padding:28px 36px; }
  .report-body h2 { font-size:15px; border-bottom:2px solid #FFBA27; padding-bottom:6px; margin-top:28px; }
  table { width:100%; border-collapse: collapse; font-size:13px; margin-top:8px;}
  th, td { text-align:left; padding:8px 10px; border-bottom:1px solid #eee; }
  th { background:#faf8ec; text-transform:uppercase; font-size:11px; letter-spacing:0.5px; color:#666; }
  .badge { display:inline-block; padding:3px 10px; border-radius:10px; font-size:11px; font-weight:bold; }
  .badge.top{background:#fff3cd;color:#856404;} .badge.meets{background:#d4edda;color:#1e7e34;} .badge.improve{background:#f8d7da;color:#721c24;} .badge.pending{background:#eee;color:#777;}
  .print-btn { display:inline-block; margin:24px 36px; padding:10px 20px; background:#FFBA27; border:none; border-radius:10px; font-weight:bold; cursor:pointer; }
  @media print { .print-btn { display:none; } body{background:#fff; padding:0;} .report{box-shadow:none;} }
</style>
</head>
<body>
  <div class="report">
    <div class="report-header">
      <h1>${title}</h1>
      <p>ModernTech Solutions &middot; Generated ${new Date().toLocaleDateString()}</p>
    </div>
    <div class="report-body">${bodyHtml}</div>
  </div>
  <button class="print-btn" onclick="window.print()">Print / Save as PDF</button>
</body>
</html>`;
}

function openReportWindow(html) {
  const win = window.open("", "_blank");
  win.document.write(html);
  win.document.close();
}

function exportFullReport() {
  const reviewed = state.data.filter((e) => e.reviewed);
  const pending = state.data.filter((e) => !e.reviewed);
  const avg = reviewed.length ? Math.round(reviewed.reduce((s, e) => s + e.score, 0) / reviewed.length) : 0;

  const rows = state.data.map((e) => {
    const status = getStatus(e);
    return `<tr>
      <td>${e.name}</td><td>${e.department}</td><td>${e.position}</td>
      <td>${e.reviewed ? e.score : "—"}</td>
      <td>${e.reviewed ? e.attendancePct + "%" : "—"}</td>
      <td>${e.reviewed ? formatCurrency(e.finalSalary) : "—"}</td>
      <td><span class="badge ${status.cls}">${status.label}</span></td>
    </tr>`;
  }).join("");

  const body = `
    <h2>Summary</h2>
    <table>
      <tr><td>Total Employees</td><td>${state.data.length}</td></tr>
      <tr><td>Reviewed</td><td>${reviewed.length}</td></tr>
      <tr><td>Awaiting Review</td><td>${pending.length}</td></tr>
      <tr><td>Average Score (reviewed)</td><td>${reviewed.length ? avg + " / 100" : "—"}</td></tr>
    </table>
    <h2>Employee Performance</h2>
    <table>
      <thead><tr><th>Name</th><th>Department</th><th>Position</th><th>Score</th><th>Attendance</th><th>Final Salary</th><th>Status</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
  `;
  openReportWindow(buildReportDocument("Performance Report — All Employees", body));
}

function exportEmployeeReport(emp) {
  if (!emp.reviewed) return;
  const status = getStatus(emp);
  const goalsPct = emp.goalsTotal > 0 ? Math.round((emp.goalsMet / emp.goalsTotal) * 100) : 0;

  const body = `
    <h2>${emp.name}</h2>
    <table>
      <tr><td>Position</td><td>${emp.position}</td></tr>
      <tr><td>Department</td><td>${emp.department}</td></tr>
      <tr><td>Contact</td><td>${emp.contact}</td></tr>
      <tr><td>History</td><td>${emp.employmentHistory}</td></tr>
    </table>
    <h2>Performance</h2>
    <table>
      <tr><td>Overall Score</td><td>${emp.score} / 100 <span class="badge ${status.cls}">${status.label}</span></td></tr>
      <tr><td>Attendance</td><td>${emp.attendancePct}%</td></tr>
      <tr><td>Goals Met</td><td>${emp.goalsMet} / ${emp.goalsTotal} (${goalsPct}%)</td></tr>
      <tr><td>Leave Days Taken</td><td>${emp.leaveDeductions}</td></tr>
    </table>
    <h2>Payroll</h2>
    <table>
      <tr><td>Base Salary</td><td>${formatCurrency(emp.salary)}</td></tr>
      <tr><td>Bonus</td><td>${formatCurrency(emp.bonus)}</td></tr>
      <tr><td>Deductions</td><td>${formatCurrency(emp.deductions)}</td></tr>
      <tr><td>Final Salary</td><td>${formatCurrency(emp.finalSalary)}</td></tr>
    </table>
  `;
  openReportWindow(buildReportDocument(`Performance Report — ${emp.name}`, body));
}

// ── Init ──────────────────────────────────────────────────
Promise.all([
  loadEmployees(),
  loadData("payroll", "DummyData/payroll_data.json", "payrollData"),
  loadData("attendance", "DummyData/attendance.json", "attendanceAndLeave"),
])
  .then(([employees, payrolls, attendances]) => {
    state.employees = employees;
    state.payrolls = payrolls;
    state.attendances = attendances;

    refresh();
    initSearch();
    initModal();
    initGradeForm();
    document.getElementById("exportBtn").addEventListener("click", exportFullReport);
  })
  .catch((err) => {
    console.error("Failed to load data:", err);
    document.getElementById("empTable").innerHTML =
      `<tr><td colspan="8" class="text-center text-danger py-4">Failed to load employee data.</td></tr>`;
  });