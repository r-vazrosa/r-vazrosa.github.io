document.getElementById("contact-form").onsubmit = (event) => {
  event.preventDefault();
  const result = document.getElementById("contact-result");
  const form = event.currentTarget;
  const formData = new FormData(form);
  const submitButton = form.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  const originalText = submitButton.textContent;
  submitButton.textContent = "Sending...";
  result.innerHTML = "Please wait...";
  const object = Object.fromEntries(formData);
  const json = JSON.stringify(object);
  fetch("https://api.web3forms.com/submit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    body: json
  })
  .then(async (response) => {
    const data = await response.json();
    if (response.status === 200) {
      result.innerHTML = "Message sent successfully!";
      form.reset();
    } else {
      result.innerHTML = data.message || "Failed to send message.";
    }
  })
  .catch(error => {
    result.innerHTML = "Something went wrong. Please try again.";
  })
  .finally(() => {
    submitButton.textContent = originalText;
    submitButton.disabled = false;
    setTimeout(() => { result.innerHTML = ""; }, 4000);
  });
};