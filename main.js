const API_URL = 'https://script.google.com/macros/s/AKfycbx5jeeiSi3Ymi14a7nb9cy5tjRPEx2TdyZ_NPoVg6Wc9KbbZw6aBvjLZp1uq7Xp-_Ho/exec';

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