// 1) Paste your Web App "exec" URL here:
const API_URL = 'https://script.google.com/macros/s/AKfycbw7yoW7IY_Psk3Zbaim0bo_3iSjvsj4yvgn-cQvCOsoK5UXdoVZwd0Dh0cpxtmHzTA/exec';

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
    const dates = Object.keys(grouped).sort();

    dates.forEach(date => {
      // Date header
      const header = document.createElement('div');
      header.className = 'date-group';
      header.textContent = formatDateHeader(date);
      listEl.appendChild(header);

      grouped[date].forEach(task => {
        const li = document.createElement('li');

        // 1) Color the card based on status
        const st = (task.status || '').toString().toLowerCase();
        if (st === 'complete' || st === 'completed') {
          li.classList.add('task-complete');
        } else {
          li.classList.add('task-incomplete');
        }

        // 2) Header row: Ders — Konu + status badge
        const h = document.createElement('div');
        h.className = 'task-header';

        const title = document.createElement('span');
        title.textContent = `${task.ders} — ${task.konu}`;
        h.appendChild(title);

        const badge = document.createElement('span');
        badge.className = 'status-badge ' +
          (st === 'complete' || st === 'completed'
            ? 'status-complete'
            : 'status-incomplete');
        badge.textContent = task.status;
        h.appendChild(badge);

        li.appendChild(h);

        // 3) Details: Kaynak, Görev, Süre, Notlar
        const details = document.createElement('div');
        details.className = 'task-details';

        [
          ['📚', task.kaynak],
          ['📝', task.gorev],
          ['⏱️', task.sure + ' dk'],
          ['🗒️', task.notlar]
        ].forEach(([emoji, text]) => {
          if (!text) return;
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
