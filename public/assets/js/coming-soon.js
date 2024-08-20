document.addEventListener("DOMContentLoaded", function () {
  const countdownDate = new Date("August 30, 2024 08:40:20").getTime();

  function updateCountdown() {
    const now = new Date().getTime();
    const distance = countdownDate - now;

    if (distance < 0) {
      clearInterval(countdownInterval);
      document.querySelector(".coming-soon-text").innerText = "The wait is over! Our report is now available.";
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    document.getElementById("days").innerText = String(days).padStart(2, '0');
    document.getElementById("hours").innerText = String(hours).padStart(2, '0');
    document.getElementById("minutes").innerText = String(minutes).padStart(2, '0');
    document.getElementById("seconds").innerText = String(seconds).padStart(2, '0');
  }

  const countdownInterval = setInterval(updateCountdown, 1000);
  updateCountdown();

  window.openNotifyPopup = function () {
    document.getElementById('sourcePage').value = window.location.href;
    document.getElementById('notifyPopup').style.display = 'block';
  };

  window.closeNotifyPopup = function () {
    document.getElementById('notifyPopup').style.display = 'none';
  };

  window.submitNotifyForm = function (event) {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const sourcePage = document.getElementById('sourcePage').value;

    if (email && sourcePage) {
      postToGoogle(email, sourcePage);
      closeNotifyPopup();
    } else {
      displayMessage('Please fill in all fields.', false);
    }
  };

  function postToGoogle(email, sourcePage) {
    const scriptURL = "https://docs.google.com/forms/d/e/1FAIpQLSc1AbPhiVXtwIGlP1aZst136YzaZCQaf51X5fzk4NzzYRcNBQ/formResponse";
    const data = new URLSearchParams({
      "entry.24309726": email,
      "entry.1659573731": sourcePage
    });

    fetch(scriptURL, {
      method: "POST",
      body: data,
      mode: "no-cors"
    })
      .then(() => {
        displayMessage('Your response has been recorded.', true);
      })
      .catch(() => {
        displayMessage('There was an error. Please try again.', false);
      });
  }

  function displayMessage(message, success) {
    const thankYouMessage = document.getElementById("thankYouMessage");
    thankYouMessage.innerText = message;
    thankYouMessage.style.display = "block";
    thankYouMessage.style.color = success ? "Yellow" : "black";
    setTimeout(() => {
      thankYouMessage.style.display = "none";
    }, 15000);
  }
});
