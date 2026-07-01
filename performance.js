// ── Helpers ──────────────────────────────────────────────

function getScoreClass(score) {
  if (score >= 80) return 'high';
  if (score >= 60) return 'mid';
  return 'low';
}

function getStatus(score) {
  if (score >= 80) return { label: 'Top Performer',       cls: 'top' };
  if (score >= 60) return { label: 'Meets Expectations',  cls: 'meets' };
  return           { label: 'Needs Improvement',          cls: 'improve' };
}

function avatarClass(index) {
  return `av${index % 6}`;
}

// ── Stat cards ───────────────────────────────────────────

function renderStats(data) {
  const avg     = Math.round(data.reduce((s, e) => s + e.score, 0) / data.length);
  const top     = data.filter(e => e.score >= 80).length;
  const improve = data.filter(e => e.score < 60).length;
  const total   = data.length;

  document.getElementById('stat-avg').innerHTML       = `${avg}<span>/ 100</span>`;
  document.getElementById('stat-avg-sub').textContent = `Based on ${total} employees`;
  document.getElementById('stat-avg-sub').className   = 'card-change neutral';

  document.getElementById('stat-top').innerHTML       = `${top}<span> employees</span>`;
  document.getElementById('stat-top-sub').textContent = `${Math.round((top / total) * 100)}% of workforce`;
  document.getElementById('stat-top-sub').className   = 'card-change positive';

  document.getElementById('stat-improve').innerHTML       = `${improve}<span> employees</span>`;
  document.getElementById('stat-improve-sub').textContent = `${Math.round((improve / total) * 100)}% of workforce`;
  document.getElementById('stat-improve-sub').className   = improve > 0 ? 'card-change negative' : 'card-change positive';

  document.getElementById('stat-reviews').innerHTML       = `${total}<span> employees</span>`;
  document.getElementById('stat-reviews-sub').textContent = 'All reviews loaded';
  document.getElementById('stat-reviews-sub').className   = 'card-change neutral';
}

// ── Score distribution ───────────────────────────────────

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

// ── Department averages ──────────────────────────────────

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

// ── Employee table ───────────────────────────────────────

function renderTable(data) {
  const tbody = document.getElementById('empTable');
  tbody.innerHTML = '';

  data.forEach((emp, i) => {
    const status = getStatus(emp.score);
    tbody.innerHTML += `
      <tr>
        <td>
          <div class="d-flex align-items-center gap-2">
            <div class="avatar ${avatarClass(i)}">${emp.initials}</div>
            ${emp.name}
          </div>
        </td>
        <td>${emp.department}</td>
        <td><span class="score-badge ${getScoreClass(emp.score)}">${emp.score}</span></td>
        <td>${emp.goalsMet} / ${emp.goalsTotal}</td>
        <td>${emp.attendance}%</td>
        <td><span class="status-badge ${status.cls}">${status.label}</span></td>
        <td>${emp.reviewedBy}</td>
      </tr>
    `;
  });
}

// ── Search ───────────────────────────────────────────────

function initSearch(data) {
  document.getElementById('empSearch').addEventListener('input', function () {
    const query = this.value.toLowerCase();
    const filtered = data.filter(e =>
      e.name.toLowerCase().includes(query) ||
      e.department.toLowerCase().includes(query)
    );
    renderTable(filtered);
  });
}

// ── Init ─────────────────────────────────────────────────

fetch('employees.json')
  .then(res => res.json())
  .then(data => {
    renderStats(data);
    renderScoreDistribution(data);
    renderDeptAverages(data);
    renderTable(data);
    initSearch(data);
  })
  .catch(err => console.error('Failed to load employees.json:', err));