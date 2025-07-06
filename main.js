const API_URL = 'https://script.google.com/macros/s/AKfycbzFo0ngMabk3tYKOr81AulgTaZBqneQ6Pdj9hDoubAH1MX2HbLN7oZSvV8xOCwH7-Nj/exec';

// Fetch and display existing rows
async function loadData() {
  const res = await fetch(API_URL);
  const data = await res.json();
  document.getElementById('data-list').innerHTML =
    data.map(item => `<p>${item.name} (${item.email})</p>`).join('');
}

// Handle form submissions
document.getElementById('entry-form').addEventListener('submit', async e => {
  e.preventDefault();
  const form = e.target;
  const payload = {
    name: form.name.value,
    email: form.email.value
  };
  await fetch(API_URL, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  form.reset();
  loadData();
});

// Initial load
loadData();
