document.addEventListener("DOMContentLoaded", function () {
  const countdownDate = new Date("August 12, 2024 08:40:20").getTime();

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

  window.notifyUser = function() {
    const email = prompt("Please enter your email to be notified:");

    if (email && validateEmail(email)) {
      postToGoogle(email, window.location.href);
    } else {
      displayMessage('Please enter a valid email address.', false);
    }
  };

  function validateEmail(email) {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(String(email).toLowerCase());
  }

  function postToGoogle(email, sourcePage) {
    const formURL = "https://docs.google.com/forms/d/e/1FAIpQLSc1AbPhiVXtwIGlP1aZst136YzaZCQaf51X5fzk4NzzYRcNBQ/formResponse";
    const data = {
      "entry.24309726": email,
      "entry.1659573731": sourcePage
    };

    const xhr = new XMLHttpRequest();
    xhr.open("POST", formURL, true);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

    xhr.onreadystatechange = function() {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        if (xhr.status === 200) {
          displayMessage('Your response has been recorded.', true);
        } else {
          displayMessage('There was an error. Please try again.', false);
        }
      }
    };

    const encodedData = Object.keys(data)
      .map(key => encodeURIComponent(key) + "=" + encodeURIComponent(data[key]))
      .join("&");

    xhr.send(encodedData);
  }

  function displayMessage(message, success) {
    const thankYouMessage = document.getElementById("thankYouMessage");
    thankYouMessage.innerText = message;
    thankYouMessage.style.display = "block";
    thankYouMessage.style.color = success ? "yellow" : "yeellow";
    setTimeout(() => {
      thankYouMessage.style.display = "none";
    }, 15000);
  }

});