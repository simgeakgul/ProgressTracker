// 1) Paste your Web App "exec" URL here:
const API_URL = 'https://script.google.com/macros/s/AKfycbzqFplv1tsB5vzVAcc8avaYfTPeooyC9N2UyCW97KII-hsjO3_qCo8ETsgRZJ5NpcE/exec';

/**
 * Format a YYYY-MM-DD string into "DD.MM.YYYY (weekday)" in Turkish
 */
function formatDateHeader(str) {
  const d = new Date(str);
  const days = ['Pazar','Pazartesi','Salı','Çarşamba','Perşembe','Cuma','Cumartesi'];
  const dd = String(d.getDate()).padStart(2,'0');
  const mm = String(d.getMonth()+1).padStart(2,'0');
  return `${dd}.${mm}.${d.getFullYear()} (${days[d.getDay()]})`;
}

/**
 * Group an array of tasks by their 'tarih' field
 */
function groupByDate(tasks) {
  return tasks.reduce((map, task) => {
    const key = task.tarih;
    if (!map[key]) map[key] = [];
    map[key].push(task);
    return map;
  }, {});
}

async function loadTasks() {
  const loadingEl = document.getElementById('loading');
  const listEl    = document.getElementById('task-list');

  try {
    const res   = await fetch(API_URL);
    const tasks = await res.json();
    loadingEl.style.display = 'none';

    if (!tasks.length) {
      listEl.innerHTML = '<li>Bu hafta için görev bulunamadı.</li>';
      return;
    }

    const grouped = groupByDate(tasks);
    // Sort dates ascending
    const dates = Object.keys(grouped).sort();

    dates.forEach(date => {
      // Date header
      const header = document.createElement('div');
      header.className = 'date-group';
      header.textContent = formatDateHeader(date);
      listEl.appendChild(header);

      // Tasks for that date
      grouped[date].forEach(task => {
        const li = document.createElement('li');

        // Header row: Ders — Konu
        const h = document.createElement('div');
        h.className = 'task-header';
        h.textContent = `${task.ders} — ${task.konu}`;
        li.appendChild(h);

        // Details: Kaynak, Görev, Süre, Notlar
        const details = document.createElement('div');
        details.className = 'task-details';

        [
        ['📚', task.kaynak],
        ['📝', task.gorev],
        ['⏱️', task.sure + ' dk'],
        ['🗒️', task.notlar]
        ].forEach(([emoji, text]) => {
        if (!text) return;        // skip empty notes
        const span = document.createElement('span');
        span.textContent = `${emoji} ${text}`;
        details.appendChild(span);
        });

        li.appendChild(details);

        listEl.appendChild(li);
      });
    });
  } catch (err) {
    loadingEl.textContent = 'Görevler yüklenemedi.';
    console.error(err);
  }
}

// Kick things off
loadTasks();
