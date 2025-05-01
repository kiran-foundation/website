import { isProduction } from "./global-variables.js";

document.addEventListener("DOMContentLoaded", function () {
  // Contact form handling
  const contactForm = document.getElementById("contact-form");
  if (contactForm) {
    setupContactForm();
  }

  // Notification form handling (if exists)
  const notifyForm = document.getElementById('notifyForm');
  if (notifyForm) {
    notifyForm.addEventListener('submit', function(event) {
      event.preventDefault(); 
      submitNotifyForm();
    });
  }

  // Volunteer form handling (if exists)
  const volunteeringForm = document.getElementById('volunteering-form');
  if (volunteeringForm) {
    const redirectUrl = volunteeringForm.getAttribute("data-redirect");
    volunteeringForm.addEventListener('submit', function(event) {
      event.preventDefault(); 
      submitVolunteeringForm(redirectUrl);
    });
  }

  // CONTACT FORM SETUP
  function setupContactForm() {
    const formframe = document.getElementById("formframe");
    const popUp = document.getElementById("pop-up");
    const submitButton = contactForm.querySelector(".form-submit-button");
    
    // Initialize submit button as disabled
    submitButton.disabled = true;

    // Select all input fields and add validation listeners
    ["full-name", "email", "phone"].forEach((id) => {
      const element = document.getElementById(id);
      if (element) {
        element.addEventListener("input", validateAllFields);
        element.addEventListener("input", () => removeErrorMessage(id));
        
        // Add blur validation
        element.addEventListener("blur", () => {
          if (id === "full-name") {
            validateFullName();
          } else if (id === "email") {
            validateEmail();
          } else if (id === "phone") {
            validatePhone();
          }
        });
      }
    });

    // Setup more/message field
    const moreField = document.getElementById("more");
    if (moreField) {
      moreField.addEventListener("input", () => removeErrorMessage("more"));
      moreField.addEventListener("blur", validateMessage);
    }

    // Form submission setup
    contactForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      await submitContactForm();
    });

    // Validation Functions
    function validateFullName() {
      const nameInput = document.getElementById("full-name");
      if (!validName(nameInput.value.trim())) {
        addErrorMessage("full-name", "Please enter your full name, only alphabets and spaces are allowed");
        return false;
      } 
      removeErrorMessage("full-name");
      return true;
    }

    function validateEmail() {
      const emailInput = document.getElementById("email");
      if (!emailInput.value.trim()) {
        addErrorMessage("email", "Please enter your email");
        return false;
      } else if (!validMail(emailInput.value)) {
        addErrorMessage("email", "Invalid email format. Example: name@domain.com");
        return false;
      }
      removeErrorMessage("email");
      return true;
    }

    function validatePhone() {
      const phoneInput = document.getElementById("phone");
      if (!phoneInput.value.trim()) {
        addErrorMessage("phone", "Please enter your phone number");
        return false;
      } else if (!validPhone(phoneInput.value)) {
        addErrorMessage("phone", "Invalid Format. Phone number must be 10 digits. Example: 6301234567");
        return false;
      }
      removeErrorMessage("phone");
      return true;
    }

    function validateMessage() {
      const messageInput = document.getElementById("more");
      if (!messageInput.value.trim()) {
        addErrorMessage("more", "Please enter your Message");
        return false;
      }
      removeErrorMessage("more");
      return true;
    }

    function validateAllFields() {
      const name = document.getElementById("full-name").value.trim();
      const email = document.getElementById("email").value.trim();
      const phone = document.getElementById("phone").value.trim();
      
      const isFormValid = name !== "" && validMail(email) && validPhone(phone);
      submitButton.disabled = !isFormValid;
    }

    // Form submission
    async function submitContactForm() {
      const fullName = document.getElementById("full-name").value;
      const email = document.getElementById("email").value;
      const phone = document.getElementById("phone").value;
      const more = document.getElementById("more").value;

      // Form ID selection based on environment
      const form_id = isProduction 
        ? "1FAIpQLSefpzhGl46T63TuroNAmyfnRERfeeJjv8Z0hH6WNtNzp-bmgQ" 
        : "1FAIpQLSfoiKWC0Np2Clnq1DDj8Un9GCrkB86AX-Dg_QZcwxPiU2QNbQ";

      // Check if all fields are valid
      if (fullName && validMail(email) && validPhone(phone) && more) {
        const url = `https://docs.google.com/forms/d/e/${form_id}/formResponse?&submit=Submit?usp=pp_url&entry.1405737972=${encodeURIComponent(fullName)}&entry.1290086262=${encodeURIComponent(email)}&entry.1357912889=${encodeURIComponent(phone)}&entry.1943470005=${encodeURIComponent("")}&entry.1695954646=${encodeURIComponent(more)}&entry.1681195710=${encodeURIComponent("contact-us")}&entry.emailAddress=${encodeURIComponent(email)}`;

        try {
          const _response = await fetch(url, { method: "POST", mode: "no-cors" });
          formframe.style.display = "none";
          popUp.style.display = "block";
          
          // Reset the form fields
          contactForm.reset();
          
        } catch (error) {
          console.error(error);
          // Still show the pop-up even if there's an error
          formframe.style.display = "none";
          popUp.style.display = "block";
        }
      } else {
        // Show validation errors for incomplete fields
        if (!fullName) addErrorMessage("full-name", "Please enter your full name, only alphabets and spaces are allowed");
        if (!email) {
          addErrorMessage("email", "Please enter your email");
        } else if (!validMail(email)) {
          addErrorMessage("email", "Invalid email format. Example: name@domain.com");
        }
        if (!phone) {
          addErrorMessage("phone", "Please enter your phone number");
        } else if (!validPhone(phone)) {
          addErrorMessage("phone", "Invalid Format. Phone number must be 10 digits. Example: 6301234567");
        }
        if (!more) addErrorMessage("more", "Please enter your Message");
      }
    }
  }

  // VOLUNTEERING FORM FUNCTIONS
  async function submitVolunteeringForm(redirectUrl) {
    const fullName = document.getElementById("full-name").value;
    const email = document.getElementById("email").value;
    const phone = document.getElementById("phone").value;
    const url = window.location.href;
    const getInternshipName = (url) => url.split("/").slice(-2, -1)[0];
    const role = getInternshipName(url);
    const more = document.getElementById("more").value;
    const resume = "n/a";
    const typeofrole = "volunteering";

    if (isProduction && fullName && validMail(email) && validPhone(phone) && role) {
      await postToGoogleFormProduction(fullName, email, phone, resume, role, more, typeofrole);
      if (redirectUrl) window.location.href = redirectUrl;
    } else if (fullName && validMail(email) && validPhone(phone) && role) {
      await postToGoogleFormTest(fullName, email, phone, resume, role, more, typeofrole);
      if (redirectUrl) window.location.href = redirectUrl;
    } else {
      displayFormErrors(fullName, email, phone, more);
    }
  }

  async function postToGoogleFormProduction(name, email, phone, resume, role, moreinformation, typeofrole) {
    const form_id = "1FAIpQLSefpzhGl46T63TuroNAmyfnRERfeeJjv8Z0hH6WNtNzp-bmgQ";
    const url = `https://docs.google.com/forms/d/e/${form_id}/formResponse?&submit=Submit?usp=pp_url&entry.1405737972=${encodeURIComponent(name)}&entry.1290086262=${encodeURIComponent(email)}&entry.1357912889=${encodeURIComponent(phone)}&entry.132713313=${encodeURIComponent(role)}&entry.1964045563=${encodeURIComponent(moreinformation)}&entry.579156192=${encodeURIComponent(typeofrole)}&entry.1067411802=${encodeURIComponent(resume)}&entry.emailAddress=${encodeURIComponent(email)}`;

    try {
      await fetch(url, { method: "POST", mode: "no-cors" });
      displayMessage('Your request has been recorded.', true);
    } catch (error) {
      displayMessage('There was an error submitting the request. Please try again.', false);
    }
  }

  async function postToGoogleFormTest(name, email, phone, resume, role, moreinformation, typeofrole) {
    const form_id = "1FAIpQLSfoiKWC0Np2Clnq1DDj8Un9GCrkB86AX-Dg_QZcwxPiU2QNbQ";
    const url = `https://docs.google.com/forms/d/e/${form_id}/formResponse?&submit=Submit?usp=pp_url&entry.1405737972=${encodeURIComponent(name)}&entry.1290086262=${encodeURIComponent(email)}&entry.1357912889=${encodeURIComponent(phone)}&entry.1943470005=${encodeURIComponent(role)}&entry.1695954646=${encodeURIComponent(moreinformation)}&entry.1681195710=${encodeURIComponent(typeofrole)}&entry.1964045563=${encodeURIComponent(resume)}&entry.emailAddress=${encodeURIComponent(email)}`;

    try {
      await fetch(url, { method: "POST", mode: "no-cors" });
      displayMessage('Your request has been recorded.', true);
    } catch (error) {
      displayMessage('There was an error submitting the request. Please try again.', false);
    }
  }

  // NOTIFY FORM FUNCTIONS
  function submitNotifyForm() {
    const email = document.getElementById('notifyEmail').value;
    const sourcePage = document.getElementById('sourcePage').value;

    if (email && sourcePage) {
      const scriptURL = "https://docs.google.com/forms/d/e/1FAIpQLSc1AbPhiVXtwIGlP1aZst136YzaZCQaf51X5fzk4NzzYRcNBQ/formResponse";
      const formData = new URLSearchParams({
        "entry.24309726": email,
        "entry.1659573731": sourcePage, 
      });

      fetch(scriptURL, {
        method: "POST",
        body: formData,
        mode: "no-cors"
      })
      .then(() => {
        displayMessage('Your notification request has been recorded.', true);
        document.getElementById('notifyForm').reset(); 
        closeNotifyPopup(); 
      })
      .catch(() => {
        displayMessage('There was an error submitting the notification request. Please try again.', false);
      });
    } else {
      displayMessage('Please fill in all fields for notification form.', false);
    }
  }

  // UTILITY FUNCTIONS
  function validName(name) {
    if (!name) return false;
    const regex = /^[a-zA-Z\s]+$/;
    return regex.test(name.trim());
  }
  function validMail(email) {
    if (!email) return false;
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
  }

  function validPhone(phone) {
    if (!phone) return false;
    const cleaned = phone.replace(/[\s\-()]/g, "");
    const regex = /^[+]{1}(?:[0-9\-\(\)\/\.]\s?){6,15}[0-9]{1}$/;
    return regex.test(cleaned);
  }

  function addErrorMessage(inputId, messageText) {
    const inputElement = document.getElementById(inputId);
    if (!inputElement) return;

    // Add error class
    inputElement.classList.add("error");
    inputElement.style.color = "#992424"; // Set text color to red

    // Check if the error message already exists
    const errorMessage = inputElement.nextElementSibling;
    if (
      errorMessage &&
      errorMessage.classList.contains("form-suberror")
    ) {
      errorMessage.innerHTML = "❗" + messageText;
    } else {
      inputElement.insertAdjacentHTML(
        "afterend",
        "<div class='form-suberror'>❗" + messageText + "</div>"
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
      errorMessage.classList.contains("form-suberror")
    ) {
      errorMessage.remove();
    }
  }

  function displayFormErrors(fullName, email, phone, more) {
    if (!validName(fullName)) {
      addErrorMessage("full-name", "Please enter your full name, only alphabets and spaces are allowed");
    }
    if (!validMail(email)) {
      if (!email) {
        addErrorMessage("email", "Please enter your email");
      } else {
        addErrorMessage("email", "Invalid email format. Example: name@domain.com");
      }
    }
    if (!validPhone(phone)) {
      if (!phone) {
        addErrorMessage("phone", "Please enter your phone number");
      } else {
        addErrorMessage("phone", "Invalid Format. Phone number must be 10 digits. Example: 6301234567");
      }
    }
    if (!more) {
      addErrorMessage("more", "Please enter your Message");
    }
  }

  function displayMessage(message, success) {
    console.log("Display Message:", message, "Success:", success);
    // You could implement a toast notification system here
  }

  // POPUP HANDLERS
  window.openNotifyPopup = function () {
    document.getElementById('sourcePage').value = window.location.href;
    document.getElementById('notifyPopup').style.display = 'block';
  };

  window.closeNotifyPopup = function () {
    document.getElementById('notifyPopup').style.display = 'none';
  };
});