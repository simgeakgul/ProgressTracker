const API_URL = 'https://script.google.com/macros/s/AKfycbyCnP0Oy-hvR3zBtlTyZ02UIKcnALuHNSLRn-vqbuJD5eexvNqmnF0G4RheEQ34I0HW/exec';

/* ---------- Utilities ---------- */
function startOfWeek(date) {           // Monday as first day
  const d = new Date(date);
  const diff = (d.getDay() + 6) % 7;  // 0→Mon ... 6→Sun
  d.setDate(d.getDate() - diff);
  d.setHours(0,0,0,0);
  return d;
}
function fmt(d) { return d.toISOString().slice(0,10); }

/* ---------- Build weekly grid ---------- */
function renderWeek(referenceDate, tasks) {
  const grid = document.getElementById('week-grid');
  grid.innerHTML = '';                                   // wipe
  const monday = startOfWeek(referenceDate);
  [...Array(7)].forEach((_, i) => {
    const day = new Date(monday);
    day.setDate(monday.getDate() + i);

    const col = document.createElement('div');
    col.className = 'day-col';
    col.innerHTML = `<h3>${day.toLocaleDateString('en-US',{weekday:'long'})}<br>${fmt(day)}</h3>`;
    grid.appendChild(col);

    const todayTasks = tasks.filter(t => t.date === fmt(day));
    todayTasks.forEach(t => {
      const card = document.createElement('div');
      card.className = `task ${t.status === 'Done' ? 'done' : ''}`;
      card.innerHTML = `
        <strong>${t.subject}</strong><br>
        <em>${t.expected || ''}</em><br>
        <small>${t.resource || ''}</small>
      `;
      col.appendChild(card);
    });
  });
}

/* ---------- Load & display data ---------- */
async function loadData() {
  const res   = await fetch(API_URL);
  const tasks = await res.json();          // [{date,status,expected,subject,resource,…}]
  renderWeek(new Date(), tasks);
}

/* ---------- Handle new-task form ---------- */
document.getElementById('task-form').addEventListener('submit', async e => {
  e.preventDefault();
  const f = e.target;
  const payload = {
    date:     f.date.value,
    status:   f.status.value,
    expected: f.expected.value,
    subject:  f.subject.value,
    resource: f.resource.value
  };
  await fetch(API_URL, { method:'POST', body:JSON.stringify(payload) });
  f.reset();
  loadData();
});

/* ---------- Initial render ---------- */
loadData();
