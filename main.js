const form = document.getElementById("myForm");
const status = document.getElementById("status");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  status.textContent = "Sending...";

  const data = {
    name: document.getElementById("name").value,
    email: document.getElementById("email").value,
    message: document.getElementById("message").value
  };

  const response = await fetch("https://script.google.com/macros/s/AKfycbxCPNiHMXg1PKpOsWF1D5kEGbJeBnUt3vEV-2Hiqbg4mr4D73Mo_6DBCrTaJjZCmMij/exec", {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json"
    }
  });

  if (response.ok) {
    status.textContent = "Message sent!";
    form.reset();
  } else {
    status.textContent = "Error sending message.";
  }
});
