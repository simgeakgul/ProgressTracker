const API_URL = 'https://script.google.com/macros/s/AKfycbzrqsFEdICL_VfaQ1Iw8owR9lWptAY8KqtRHvOUuxKrEhv-Aq4znPXxFfc-xF6aa4Uv/exec';

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