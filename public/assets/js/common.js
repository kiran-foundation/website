import { isProduction } from "../js/global-variables.js";


document.addEventListener("DOMContentLoaded", function () {
  // USEFUL FUNCTIONS   

  const submitButton = document.querySelector(
    ".volunteeringForm-submit-button"
  );

  submitButton.disabled = true;

  function validMail(email) {
    if (!email) return false;
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
  }

  function validPhone(phone) {
    if (!phone) return false;
    const cleaned = phone.replace(/[\s\-()]/g, "");
    const regex = /^(\+?\d{1,4})?0?\d{10}$/;
    return regex.test(cleaned);
  }


  function validateAllFields() {
    const name = (
      document.getElementById("full-name")
    ).value.trim();
    const email = (
      document.getElementById("email")
    ).value.trim();
    const phone = (
      document.getElementById("phone")
    ).value.trim();

    const isFormValid = name !== "" && validMail(email) && validPhone(phone);
    submitButton.disabled = !isFormValid;
  }

  
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
  const redirectUrl = volunteeringForm.getAttribute("data-redirect")

  if (volunteeringForm) {
    volunteeringForm.addEventListener('submit', function(event) {
      event.preventDefault(); 
      submitvolunteeringForm();
    });
  } else {
    console.error("volunteering-form not found");
  }

    // Re-validate on every input
    ["full-name", "email", "phone"].forEach((id) => {
      document.getElementById(id)?.addEventListener("input", validateAllFields);
    });
  
    document
      .getElementById("full-name")
      .addEventListener("input", () => removeErrorMessage("full-name"));
    document
      .getElementById("email")
      .addEventListener("input", () => removeErrorMessage("email"));
    document
      .getElementById("phone")
      .addEventListener("input", () => removeErrorMessage("phone"));


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

    // ANURAG , just use the id and use functions already made for test and production , to integrate , just see my form component !
    if (name && email && phone && message) {
      postToGoogleForm2(name, email, phone, message);
    } else {
      displayMessage('Please fill in all fields for contact form.', false);
    }
  }


  // VOLUNTEER PAGE


  // add the role info too !!
  async function submitvolunteeringForm() {


    const fullName = (document.getElementById("full-name")).value;
    const email = (document.getElementById("email")).value;
    const phone = (document.getElementById("phone")).value;
    const url = window.location.href;
    const getInternshipName = (url) => url.split("/").slice(-2, -1)[0];
    const role = getInternshipName(url);
    const more = (document.getElementById("more") ).value;
    const resume = "n/a"
    const typeofrole = "volunteering";

    if(isProduction && fullName && validMail(email) && validPhone(phone) && role){
        await postToGoogleFormProduction(fullName, email, phone, resume,role,more , typeofrole);
      }else if(fullName && validMail(email) && validPhone(phone) && role){
        await postToGoogleFormTest(fullName, email, phone, resume,role,more , typeofrole);
      }else{
        displayError();
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

  async function postToGoogleFormProduction(name, email, phone, resume, role, moreinformation , typeofrole) {
    const form_id = "1FAIpQLSefpzhGl46T63TuroNAmyfnRERfeeJjv8Z0hH6WNtNzp-bmgQ";  // Replace with your actual form ID
    const url = `https://docs.google.com/forms/d/e/${form_id}/formResponse?&submit=Submit?usp=pp_url&entry.1405737972=${encodeURIComponent(name)}&entry.1290086262=${encodeURIComponent(email)}&entry.1357912889=${encodeURIComponent(phone)}&entry.132713313=${encodeURIComponent(role)}&entry.1964045563=${encodeURIComponent(moreinformation)}&entry.579156192=${encodeURIComponent(typeofrole)}&entry.1067411802=${encodeURIComponent(resume)}&entry.emailAddress=${encodeURIComponent(email)}`;

    try {
      const _response = await fetch(url, {
        method: "POST",
        mode: "no-cors"
      }); // Send form data to Google Form
      displayMessage('Your volunteer request has been recorded.', true);
      window.location.href = redirectUrl;
    } catch (error) {
      displayMessage('There was an error submitting the volunteer request. Please try again.', false);
    }
  }

  async function postToGoogleFormTest(name, email, phone, resume, role, moreinformation , typeofrole) {
    const form_id = "1FAIpQLSfoiKWC0Np2Clnq1DDj8Un9GCrkB86AX-Dg_QZcwxPiU2QNbQ";  // Replace with your actual form ID
    const url = `https://docs.google.com/forms/d/e/${form_id}/formResponse?&submit=Submit?usp=pp_url&entry.1405737972=${encodeURIComponent(name)}&entry.1290086262=${encodeURIComponent(email)}&entry.1357912889=${encodeURIComponent(phone)}&entry.1943470005=${encodeURIComponent(role)}&entry.1695954646=${encodeURIComponent(moreinformation)}&entry.1681195710=${encodeURIComponent(typeofrole)}&entry.1964045563=${encodeURIComponent(resume)}&entry.emailAddress=${encodeURIComponent(email)}`;

    try {
      const _response = await fetch(url, {
        method: "POST",
        mode: "no-cors"
      }); // Send form data to Google Form
      displayMessage('Your volunteer request has been recorded.', true);
      window.location.href = redirectUrl;
    } catch (error) {
      displayMessage('There was an error submitting the volunteer request. Please try again.', false);
    }
  }


  
  // Function to add red border and error message
  function addErrorMessage(inputId, messageText) {
    const inputElement = document.getElementById(inputId);

    // Add error class
    inputElement.classList.add("error");
    inputElement.style.color = "#992424"; // Set text color to red

    // Check if the error message already exists
    const errorMessage = inputElement.nextElementSibling;
    if (
      errorMessage &&
      errorMessage.classList.contains("volunteeringForm-suberror")
    ) {
      errorMessage.innerHTML = "❗" + messageText;
    } else {
      inputElement.insertAdjacentHTML(
        "afterend",
        "<div class='volunteeringForm-suberror'>❗" + messageText + "</div>"
      );
    }
  }

  function removeErrorMessage(inputId) {
    const inputElement = document.getElementById(inputId);
    if (!inputElement) return;

    // Remove error class and reset text color
    inputElement.classList.remove("error");
    inputElement.style.color = "#1E1E1E"; // Reset to default

    // Remove the error message
    const errorMessage = inputElement.nextElementSibling;
    if (
      errorMessage &&
      errorMessage.classList.contains("volunteeringForm-suberror")
    ) {
      errorMessage.remove();
    }
  }

  // BLUR (ERROR) HANDLERS

    // Full Name - Blur validation
    document.getElementById("full-name").addEventListener("blur", () => {
      const nameInput = document.getElementById("full-name");
      if (!nameInput.value.trim()) {
        addErrorMessage("full-name", "Please enter your full name");
      } else {
        removeErrorMessage("full-name");
      }
    });
  
    // Email - Blur validation
    document.getElementById("email").addEventListener("blur", () => {
      const emailInput = document.getElementById("email");
      if (!emailInput.value.trim()) {
        addErrorMessage("email", "Please enter your email");
      } else if (!validMail(emailInput.value)) {
        addErrorMessage(
          "email",
          "Invalid email format. Example: name@domain.com"
        );
      } else {
        removeErrorMessage("email");
      }
    });
  
    // Phone - Blur validation
    document.getElementById("phone").addEventListener("blur", () => {
      const phoneInput = document.getElementById("phone");
      if (!phoneInput.value.trim()) {
        addErrorMessage("phone", "Please enter your phone number");
      } else if (!validPhone(phoneInput.value)) {
        addErrorMessage(
          "phone",
          "Invalid Format. Phone number must be 10 digits. Example: 6301234567"
        );
      } else {
        removeErrorMessage("phone");
      }
    });
  

  function displayMessage(message, success) {
    console.log("Display Message:", message, "Success:", success);
  };

  document.getElementById("contactForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    submitFormHandler("contact-us");
  });

  document.getElementById("volunteering-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    submitFormHandler("volunteering");
  });

  setupFieldEventListeners();
});




// swipper animation js for home page and about page 
import Swiper from "https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.mjs";

// Common configuration for both swipers
const swiperConfig = {
  effect: "fade",
  speed: 800,
  autoplay: {
    delay: 7000,
    disableOnInteraction: false,
  },
  pagination: {
    el: ".swiper-pagination",
    clickable: true,
    renderBullet: function (index, className) {
      return `<span class="${className}" style="
          width: 13.5px;
          height: 13px;
          background: transparent;
          border: 1px solid black;
          margin: 0 8px;
          opacity: 1;
          transition: all 0.3s ease;
          display: inline-block;
          border-radius: 50%;
          cursor: pointer;
        "></span>`;
    },
  },
  on: {
    init: function () {
      this.pagination.bullets.forEach((bullet) => {
        if (
          bullet.classList.contains("swiper-pagination-bullet-active")
        ) {
          bullet.style.background = "rgb(47 83 3)";
          bullet.style.borderColor = "#333";
        }
      });
    },
    slideChange: function () {
      this.pagination.bullets.forEach((bullet) => {
        bullet.style.background = "transparent";
        bullet.style.borderColor = "#333";

        if (
          bullet.classList.contains("swiper-pagination-bullet-active")
        ) {
          bullet.style.background = "rgb(47 83 3)";
          bullet.style.borderColor = "#333";
        }
      });
    },
  },
};

// Initialize both swipers
new Swiper(".swiper-scale-effect", swiperConfig);
new Swiper(".mobile-swiper", swiperConfig);
