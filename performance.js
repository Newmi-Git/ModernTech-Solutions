// ── Helpers ──────────────────────────────────────────────

function getInitials(name) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function avatarClass(index) {
  return `av${index % 6}`;
}

function getScoreClass(score) {
  if (score >= 80) return 'high';
  if (score >= 60) return 'mid';
  return 'low';
}

function getStatus(score) {
  if (score >= 80) return { label: 'Top Performer',      cls: 'top' };
  if (score >= 60) return { label: 'Meets Expectations', cls: 'meets' };
  return           { label: 'Needs Improvement',         cls: 'improve' };
}

function formatCurrency(amount) {
  return `R ${amount.toLocaleString('en-ZA')}`;
}

// ── Score calculation ─────────────────────────────────────
// 60% weight from attendance rate
// 40% weight from payroll efficiency (finalSalary / baseSalary)

function calcScore(empInfo, payroll, attendance) {
  const totalDays   = attendance.attendance.length;
  const presentDays = attendance.attendance.filter(a => a.status === 'Present').length;
  const attendancePct = totalDays > 0 ? presentDays / totalDays : 0;

  const payrollEff = empInfo.salary > 0 ? payroll.finalSalary / empInfo.salary : 0;

  const score = Math.round((attendancePct * 60) + (Math.min(payrollEff, 1) * 40));
  return score;
}

// ── Merge all three data sources ──────────────────────────

function mergeData(employees, payrolls, attendances) {
  return employees.map((emp, i) => {
    const payroll = payrolls.find(p => p.employeeId === emp.employeeId) || {};

    return {
      ...emp,
      ...payroll,
      attendancePct: emp.attendance,
      index: i,
    };
  });
}

// ── Stat cards ────────────────────────────────────────────

function renderStats(data) {
  const total   = data.length;
  const avg     = Math.round(data.reduce((s, e) => s + e.score, 0) / total);
  const top     = data.filter(e => e.score >= 80).length;
  const improve = data.filter(e => e.score < 60).length;

  document.getElementById('stat-avg').innerHTML        = `${avg}<span>/ 100</span>`;
  document.getElementById('stat-avg-sub').textContent  = `Across ${total} employees`;

  document.getElementById('stat-top').innerHTML        = `${top}<span> employees</span>`;
  document.getElementById('stat-top-sub').textContent  = `${Math.round((top / total) * 100)}% of workforce`;

  document.getElementById('stat-improve').innerHTML       = `${improve}<span> employees</span>`;
  document.getElementById('stat-improve-sub').textContent = `${Math.round((improve / total) * 100)}% of workforce`;
  document.getElementById('stat-improve-sub').className   = improve > 0 ? 'card-change negative' : 'card-change positive';

  document.getElementById('stat-total').innerHTML        = `${total}<span> employees</span>`;
  document.getElementById('stat-total-sub').textContent  = 'All records loaded';
}

// ── Score distribution ────────────────────────────────────

function renderScoreDistribution(data) {
  const bands = [
    { label: '90–100', min: 90, max: 100, cls: 'bg-gold' },
    { label: '75–89',  min: 75, max: 89,  cls: 'bg-gold' },
    { label: '60–74',  min: 60, max: 74,  cls: 'bg-purple' },
    { label: 'Below 60', min: 0, max: 59, cls: 'bg-danger' },
  ];

  const total = data.length;
  const container = document.getElementById('score-distribution');
  container.innerHTML = '';

  bands.forEach(band => {
    const count = data.filter(e => e.score >= band.min && e.score <= band.max).length;
    const pct   = total > 0 ? Math.round((count / total) * 100) : 0;

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

// ── Department averages ───────────────────────────────────

function renderDeptAverages(data) {
  const depts = {};

  data.forEach(e => {
    if (!depts[e.department]) depts[e.department] = [];
    depts[e.department].push(e.score);
  });

  const container = document.getElementById('dept-averages');
  container.innerHTML = '';

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

/*=================================================Creates a screen pop=====================================*/

function initModal(data) {
  document.getElementById('empTable').addEventListener('click',function(e) {
    const row = e.target.closest('tr');
    if (!row) return;

    const id = parseInt(row.dataset.id);

    const emp = data.find(e => e.employeeId === id)
    if (!emp) return;

    const status = getStatus(emp.score);
    const initials = getInitials(emp.name);

    document.getElementById('modal-avatar').textContent    = initials;  
    document.getElementById('modal-avatar').className      = `avatar ${avatarClass(emp.index)}`;
    document.getElementById('modal-name').textContent      = emp.name;
    document.getElementById('modal-position').textContent  = emp.position;
    document.getElementById('modal-score').innerHTML       = `${emp.score}<span style="font-size:13px;color:#888">/100</span>`;
    document.getElementById('modal-attendance').innerHTML  = `${emp.attendancePct}<span style="font-size:13px;color:#888">%</span>`;
    document.getElementById('modal-goals').innerHTML       = `${emp.goalsMet}<span style="font-size:13px;color:#888">/${emp.goalsTotal}</span>`;
    document.getElementById('modal-dept').textContent      = emp.department;
    document.getElementById('modal-salary').textContent    = formatCurrency(emp.salary);
    document.getElementById('modal-final').textContent     = formatCurrency(emp.finalSalary);
    document.getElementById('modal-leave').textContent     = `${emp.leaveDeductions} day${emp.leaveDeductions !== 1 ? 's' : ''}`;
    document.getElementById('modal-contact').textContent   = emp.contact;
    document.getElementById('modal-history').textContent   = emp.employmentHistory;
    document.getElementById('modal-status').innerHTML      = `<span class="status-badge ${status.cls}">${status.label}</span>`;

    bootstrap.Modal.getOrCreateInstance(document.getElementById('employeeModal')).show();

  })
}

// ── Employee table ────────────────────────────────────────

function renderTable(data) {
  const tbody = document.getElementById('empTable');
  tbody.innerHTML = '';

  if (data.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" class="text-center text-muted py-4">No employees found.</td></tr>`;
    return;
  }

  data.forEach(emp => {
    const status   = getStatus(emp.score);
    const initials = getInitials(emp.name);

    tbody.innerHTML += `
      <tr style="cursor:pointer" data-id="${emp.employeeId}">
        <td>
          <div class="d-flex align-items-center gap-2">
            <div class="avatar ${avatarClass(emp.index)}">${initials}</div>
            ${emp.name}
          </div>
        </td>
        <td>${emp.department}</td>
        <td>${emp.position}</td>
        <td><span class="score-badge ${getScoreClass(emp.score)}">${emp.score}</span></td>
        <td>${emp.attendancePct}%</td>
        <td>${emp.leaveDeductions} day${emp.leaveDeductions !== 1 ? 's' : ''}</td>
        <td>${formatCurrency(emp.finalSalary)}</td>
        <td><span class="status-badge ${status.cls}">${status.label}</span></td>
      </tr>
    `;
  });
}

// ── Search ────────────────────────────────────────────────

function initSearch(data) {
  document.getElementById('empSearch').addEventListener('input', function () {
    const query    = this.value.toLowerCase();
    const filtered = data.filter(e =>
      e.name.toLowerCase().includes(query) ||
      e.department.toLowerCase().includes(query) ||
      e.position.toLowerCase().includes(query)
    );
    renderTable(filtered);
  });
}

// ── Export ────────────────────────────────────────────────

function initExport(data) {
  document.getElementById('exportBtn').addEventListener('click', () => {
    const rows = [
      ['Name', 'Department', 'Position', 'Score', 'Attendance %', 'Leave Deductions', 'Final Salary', 'Status'],
      ...data.map(e => [
        e.name,
        e.department,
        e.position,
        e.score,
        `${e.attendancePct}%`,
        e.leaveDeductions,
        e.finalSalary,
        getStatus(e.score).label
      ])
    ];

    const csv     = rows.map(r => r.join(',')).join('\n');
    const blob    = new Blob([csv], { type: 'text/csv' });
    const url     = URL.createObjectURL(blob);
    const a       = document.createElement('a');
    a.href        = url;
    a.download    = 'performance_report.csv';
    a.click();
    URL.revokeObjectURL(url);
  });
}

// ── Init ──────────────────────────────────────────────────

Promise.all([
  fetch('DummyData/employee_info.json').then(r => r.json()),
  fetch('DummyData/payroll_data.json').then(r => r.json()),
  fetch('DummyData/attendance.json').then(r => r.json())
])
.then(([empData, payData, attData]) => {
  const employees  = empData.employeeInformation;
  const payrolls   = payData.payrollData;
  const attendances = attData.attendanceAndLeave;

  const merged = mergeData(employees, payrolls, attendances);

  renderStats(merged);
  renderScoreDistribution(merged);
  renderDeptAverages(merged);
  renderTable(merged);
  initSearch(merged);
  initExport(merged);
  initModal(merged);
})
.catch(err => {
  console.error('Failed to load data:', err);
  document.getElementById('empTable').innerHTML =
    `<tr><td colspan="8" class="text-center text-danger py-4">Failed to load employee data.</td></tr>`;
});


