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

  const response = await fetch("https://script.google.com/macros/s/AKfycbyIwg1Xz1FX8_h4M79rRGEY4QW6r6zJGeaVLWWe2cQqs8i4h4HC5GwHS77vH15I29Te/exec", {
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
