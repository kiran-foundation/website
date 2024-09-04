document.addEventListener("DOMContentLoaded", function () {
  const countdownDate = new Date("sep 30, 2024 08:40:20").getTime();

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
});
