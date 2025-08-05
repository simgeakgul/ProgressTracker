// 1) Paste your Web App "exec" URL here:
const API_URL = 'https://script.google.com/macros/s/AKfycbyeSzgoR6bif60oYv8Nc3Ejd3aGa1yNEoBKhgRKwo6mmVwUEw-l3h5vhtz0g0WsHf0/exec';
const PROG_URL = API_URL + '?mode=progress';
const STAGES   = [
  "Başlanmadı",
  "Konu Çalış",
  "Konu Testi",
  "Tekrar 1 (Test)",
  "Tekrar 2 (Konu + Test)",
  "Tekrar 3 (Test)"
];
// compute percent (0–100) from a stage name
function pctFromStage(stage) {
  const i = STAGES.indexOf(stage);
  if (i < 0) return 0;
  return (i / (STAGES.length - 1)) * 100;
}
/**
 * Format a YYYY-MM-DD string into "DD.MM.YYYY (weekday)" in Turkish
 */
function formatDateHeader(str) {
  const d = new Date(str);
  const days = ['Pazar','Pazartesi','Salı','Çarşamba','Perşembe','Cuma','Cumartesi'];
  return `${String(d.getDate()).padStart(2,'0')}.` +
         `${String(d.getMonth()+1).padStart(2,'0')}.` +
         `${d.getFullYear()} (${days[d.getDay()]})`;
}

/**
 * Group an array of tasks by their 'tarih' field
 */
function groupByDate(tasks) {
  return tasks.reduce((map, task) => {
    (map[task.tarih] ||= []).push(task);
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
    Object.keys(grouped).sort().forEach(date => {
      // Date header
      const hdr = document.createElement('div');
      hdr.className = 'date-group';
      hdr.textContent = formatDateHeader(date);
      listEl.appendChild(hdr);

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
        const header = document.createElement('div');
        header.className = 'task-header';

        const title = document.createElement('span');
        title.textContent = `${task.ders} — ${task.konu}`;
        header.appendChild(title);

        const badge = document.createElement('span');
        badge.className = 'status-badge ' +
          (st === 'complete' || st === 'completed'
            ? 'status-complete'
            : 'status-incomplete');
        badge.textContent = task.status;
        header.appendChild(badge);

        li.appendChild(header);

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

        const FORM_PREFILL = 'https://docs.google.com/forms/d/e/1FAIpQLScGJCUtmgkuCOlr1BwyeQ4eAKiwPQJsKhtulMrqbWUi3DTqbg/viewform?usp=pp_url&entry.91911668=';
        const formBtn = document.createElement('a');
        formBtn.className = 'form-button';
        formBtn.textContent = 'Raporla';
        formBtn.target = '_blank';
        formBtn.href = FORM_PREFILL + encodeURIComponent(task.id);
        li.appendChild(formBtn);


        listEl.appendChild(li);
      });
    });
  } catch (err) {
    loadingEl.textContent = 'Görevler yüklenemedi.';
    console.error(err);
  }
}

async function loadTopicProgress() {
    const container = document.getElementById('topic-progress');
    try {
      const resp   = await fetch(PROG_URL);
      const topics = await resp.json();  // [{subject,progress},…]
      topics.forEach(t => {
        const div = document.createElement('div');
        div.className = 'topic-item';
        // label
        const label = document.createElement('span');
        label.textContent = `${t.subject} — ${t.progress}`;
        // bar
        const barWrap = document.createElement('div');
        barWrap.className = 'progress-bar';
        const fill = document.createElement('div');
        fill.className = 'progress-fill';
        fill.style.width = pctFromStage(t.progress) + '%';
        barWrap.appendChild(fill);
        // assemble
        div.append(label, barWrap);
        container.appendChild(div);
      });
    } catch (e) {
      console.error('Failed to load topic progress', e);
    }
  }
  

  async function init() {
    await loadTopicProgress();   // <-- new
    await loadTasks();           // existing
    btnTasks.click();
  }

init();

// grab toggle buttons and views
const btnProgress  = document.getElementById('btn-progress');
const btnTasks     = document.getElementById('btn-tasks');
const progressView = document.getElementById('progress-view');
const tasksView    = document.getElementById('tasks-view');

btnProgress.addEventListener('click', () => {
  progressView.style.display = '';       // show progress
  tasksView.style.display    = 'none';   // hide tasks
  btnProgress.classList.add('active');
  btnTasks.classList.remove('active');
});

btnTasks.addEventListener('click', () => {
  progressView.style.display = 'none';
  tasksView.style.display    = '';       // show tasks
  btnTasks.classList.add('active');
  btnProgress.classList.remove('active');
});

// 1) Ensure there’s a container for the “istatistik” view
let istatistikView = document.getElementById('istatistik-view');
if (!istatistikView) {
  istatistikView = document.createElement('section');
  istatistikView.id = 'istatistik-view';
  istatistikView.style.display = 'none';
  istatistikView.innerHTML = '<div class="empty-state">Henüz çözülmüş deneme yok</div>';
  // place it right after the other views
  tasksView.parentNode.insertBefore(istatistikView, tasksView.nextSibling);
}

// 2) Wire up the button
const btnIstatistik = document.getElementById('btn-istatistik');
btnIstatistik.addEventListener('click', () => {
  // hide the other two
  progressView.style.display = 'none';
  tasksView.style.display    = 'none';
  // show our new view
  istatistikView.style.display = '';

  // toggle the active class
  btnIstatistik.classList.add('active');
  btnProgress .classList.remove('active');
  btnTasks    .classList.remove('active');
});
