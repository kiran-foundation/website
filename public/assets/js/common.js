document.addEventListener("DOMContentLoaded", function () {
  const notifyForm = document.getElementById('notifyForm');
  if (notifyForm) {
    notifyForm.addEventListener('submit', function(event) {
      event.preventDefault(); 
      submitNotifyForm();
    });
  } else {
    console.error("Notify form not found");
  }

  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', function(event) {
      event.preventDefault(); 
      submitContactForm();
    });
  } else {
    console.error("Contact form not found");
  }

  const volunteeringForm = document.getElementById('volunteering-form');
  if (volunteeringForm) {
    volunteeringForm.addEventListener('submit', function(event) {
      event.preventDefault(); 
      submitvolunteeringForm();
    });
  } else {
    console.error("volunteering-form not found");
  }


  function submitNotifyForm() {
    const email = document.getElementById('notifyEmail').value;
    const sourcePage = document.getElementById('sourcePage').value;

    if (email && sourcePage) {
      postToGoogleForm1(email, sourcePage);
    } else {
      displayMessage('Please fill in all fields for notification form.', false);
    }
  }

  function submitContactForm() {
    const name = document.getElementById('name').value;
    const email = document.getElementById('contactEmail').value;
    const phone = document.getElementById('phone').value;
    const message = document.getElementById('message').value;

    if (name && email && phone && message) {
      postToGoogleForm2(name, email, phone, message);
    } else {
      displayMessage('Please fill in all fields for contact form.', false);
    }
  }

  function submitvolunteeringForm() {
    const fullname = document.getElementById('name').value;
    const email = document.getElementById('contactEmail').value;
    const phone = document.getElementById('phone').value;
    const resume = document.getElementById('resume').value;
    const role = document.getElementById('role').value;
    const moreinformation = document.getElementById('more').value;

    if (fullname && email && phone && resume && role && moreinformation) {
      postToGoogleForm3(fullname, email, phone, resume,role,moreinformation);
    } else {
      displayMessage('Please fill in all fields for volunteerform.', false);
    }
  }

  function postToGoogleForm1(email, sourcePage) {
    const scriptURL1 = "https://docs.google.com/forms/d/e/1FAIpQLSc1AbPhiVXtwIGlP1aZst136YzaZCQaf51X5fzk4NzzYRcNBQ/formResponse";
    const formData1 = new URLSearchParams({
      "entry.24309726": email,
      "entry.1659573731": sourcePage, 
    });

    fetch(scriptURL1, {
      method: "POST",
      body: formData1,
      mode: "no-cors"
    })
    .then(() => {
      displayMessage('Your notification request has been recorded.', true);
      notifyForm.reset(); 
      closeNotifyPopup(); 
    })
    .catch(() => {
      displayMessage('There was an error submitting the notification request. Please try again.', false);
    });
  }

  function postToGoogleForm2(name, email, phone, message) {
    const scriptURL2 = "https://docs.google.com/forms/u/0/d/e/1FAIpQLSefpzhGl46T63TuroNAmyfnRERfeeJjv8Z0hH6WNtNzp-bmgQ/formResponse";
    const formData2 = new URLSearchParams({
      "entry.1290086262": name,
      "entry.1357912889": email,
      "entry.1405737972": phone,
      "entry.1964045563": message
    });

    fetch(scriptURL2, {
      method: "POST",
      body: formData2,
      mode: "no-cors"
    })
    .then(() => {
      displayMessage('Your contact request has been recorded.', true);
      contactForm.reset();
    })
    .catch(() => {
      displayMessage('There was an error submitting the contact request. Please try again.', false);
    });
  }

  function postToGoogleForm3(name, email, phone, resume, role, moreinformation) {
    const scriptURL3 = "https://docs.google.com/forms/d/e/1FAIpQLScRCHRWAEMoAfuKx_vVjRZpfoKJp7TvHNsDRJBj4Hf34DDF1Q/formResponse";
    const formData3 = new URLSearchParams({
      "entry.2005620554": name,
      "entry.1045781291": email,
      "entry.1166974658": phone,
      "entry.839337160": resume, // Captures file name only
      "entry.1929439720": role,
      "entry.138103954": moreinformation
    });
  
    fetch(scriptURL3, {
      method: "POST",
      body: formData3,
      mode: "no-cors"
    })
      .then(() => {
        displayMessage('Your volunteer request has been recorded.', true);
        volunteeringForm.reset();
      })
      .catch(() => {
        displayMessage('There was an error submitting the volunteer request. Please try again.', false);
      });
  }
  
  function displayMessage(message, success) {
    console.log("Display Message:", message, "Success:", success);

    const existingMessageElement = document.querySelector('.notification-message');

    if (existingMessageElement) {
      existingMessageElement.remove();
    }

    const messageElement = document.createElement('div');
    messageElement.className = 'notification-message';
    messageElement.innerText ='message';
    messageElement.style.display = 'block';
    messageElement.style.color = success ? 'green' : 'red';
    messageElement.style.marginTop = '10px';

    document.body.appendChild(messageElement);

    setTimeout(() => {
      messageElement.remove();
    }, 15000);
  }

  window.openNotifyPopup = function () {
    document.getElementById('sourcePage').value = window.location.href;
    document.getElementById('notifyPopup').style.display = 'block';
  };

  window.closeNotifyPopup = function () {
    document.getElementById('notifyPopup').style.display = 'none';
  };
});
