document.addEventListener("DOMContentLoaded", function () {
  const links = document.querySelectorAll("a");

  links.forEach(link => {
    link.addEventListener("click", function (event) {
      event.preventDefault();

      fetch(link.href, { method: 'HEAD' })
        .then(response => {
          if (response.status === 404) {
            window.location.href = "/404";
          } else {
            window.location.href = link.href;
          }
        })
        .catch(error => {
          console.error('Error fetching the link:', error);
          window.location.href = "/404";
        });
    });
  });
});
