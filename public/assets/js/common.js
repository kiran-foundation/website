import { isProduction } from "../js/global-variables.js";

document.addEventListener("DOMContentLoaded", function () {
  // USEFUL FUNCTIONS

  const submitButton = document.querySelector(
    ".volunteeringForm-submit-button, .form-submit-button "
  );

  submitButton.disabled = true;
  function validName(name) {
    if (!name) return false;
    const regex = /^[a-zA-Z\s]+$/;
    return regex.test(name);
  }
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
    const name = document.getElementById("full-name").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();

    const isFormValid =
      validName(name) && validMail(email) && validPhone(phone);
    submitButton.disabled = !isFormValid;
  }

  const notifyForm = document.getElementById("notifyForm");
  if (notifyForm) {
    notifyForm.addEventListener("submit", function (event) {
      event.preventDefault();
      submitNotifyForm();
    });
  } else {
    console.error("Notify form not found");
  }

  const contactForm = document.getElementById("contactForm");
  if (contactForm) {
    contactForm.addEventListener("submit", function (event) {
      event.preventDefault();

      submitContactForm();
    });
  } else {
    console.error("Contact form not found");
  }

  const volunteeringForm = document.getElementById("volunteering-form");
  if (volunteeringForm) {
    const redirectUrl = volunteeringForm.getAttribute("data-redirect");
  }

  if (volunteeringForm) {
    volunteeringForm.addEventListener("submit", function (event) {
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
    const email = document.getElementById("notifyEmail").value;
    const sourcePage = document.getElementById("sourcePage").value;

    if (email && sourcePage) {
      postToGoogleForm1(email, sourcePage);
    } else {
      displayMessage("Please fill in all fields for notification form.", false);
    }
  }

  
  function displayPopUpWithAnimation() {
    const lottiePlayer = document.getElementById("lottie-player");
    const formframe = document.getElementById("formframe");
    const popUp = document.getElementById("pop-up");
    const observer = new MutationObserver(() => {
      if (popUp.style.display === "block") {
        lottiePlayer.stop();
        lottiePlayer.play();
      }
    });
    observer.observe(popUp, {
      attributes: true,
      attributeFilter: ["style"],
    });

    formframe.style.display = "none"; // Show pop-up immediately, don't wait for fetch to complete
    popUp.style.display = "block";
    contactForm.reset();
  }
  
  async function submitContactForm() {
    const name = document.getElementById("full-name").value;
    const email = document.getElementById("email").value;
    const phone = document.getElementById("phone").value;
    const message = document.getElementById("message").value;
    const role = "n/a";
    const resume = "n/a";
    const typeofrole = "contact-us";

    if (
      isProduction &&
      validName(name) &&
      validMail(email) &&
      validPhone(phone) &&
      message
    ) {
      await postToGoogleFormProduction(
        name,
        email,
        phone,
        resume,
        role,
        message,
        typeofrole
      ).then(() => {
        displayPopUpWithAnimation(); // Reset the form after successful submission
      }).catch((error) => {
        console.error("Error:", error); // Log the error for debugging
      });
    } else if (
      validName(name) &&
      validMail(email) &&
      validPhone(phone) &&
      role
    ) {
      const status = await postToGoogleFormTest(
        name,
        email,
        phone,
        resume,
        role,
        message,
        typeofrole
      ).then(() => {
        displayPopUpWithAnimation(); // Reset the form after successful submission
      }).catch((error) => {
        console.error("Error:", error); // Log the error for debugging
      });
    } else {
      displayError();
    }
  }

  // VOLUNTEER PAGE

  // add the role info too !!
  async function submitvolunteeringForm() {
    const fullName = document.getElementById("full-name").value;
    const email = document.getElementById("email").value;
    const phone = document.getElementById("phone").value;
    const url = window.location.href;
    const getInternshipName = (url) => url.split("/").slice(-2, -1)[0];
    const role = getInternshipName(url);
    const more = document.getElementById("more").value;
    const resume = "n/a";
    const typeofrole = "volunteering";

    if (
      isProduction &&
      fullName &&
      validMail(email) &&
      validPhone(phone) &&
      role
    ) {
      await postToGoogleFormProduction(
        fullName,
        email,
        phone,
        resume,
        role,
        more,
        typeofrole
      );
    } else if (fullName && validMail(email) && validPhone(phone) && role) {
      await postToGoogleFormTest(
        fullName,
        email,
        phone,
        resume,
        role,
        more,
        typeofrole
      );
    } else {
      displayError();
    }
  }

  function postToGoogleForm1(email, sourcePage) {
    const scriptURL1 =
      "https://docs.google.com/forms/d/e/1FAIpQLSc1AbPhiVXtwIGlP1aZst136YzaZCQaf51X5fzk4NzzYRcNBQ/formResponse";
    const formData1 = new URLSearchParams({
      "entry.24309726": email,
      "entry.1659573731": sourcePage,
    });

    fetch(scriptURL1, {
      method: "POST",
      body: formData1,
      mode: "no-cors",
    })
      .then(() => {
        displayMessage("Your notification request has been recorded.", true);
        notifyForm.reset();
        closeNotifyPopup();
      })
      .catch(() => {
        displayMessage(
          "There was an error submitting the notification request. Please try again.",
          false
        );
      });
  }

  function postToGoogleForm2(name, email, phone, message) {
    const scriptURL2 =
      "https://docs.google.com/forms/u/0/d/e/1FAIpQLSefpzhGl46T63TuroNAmyfnRERfeeJjv8Z0hH6WNtNzp-bmgQ/formResponse";
    const formData2 = new URLSearchParams({
      "entry.1290086262": name,
      "entry.1357912889": email,
      "entry.1405737972": phone,
      "entry.1964045563": message,
    });

    fetch(scriptURL2, {
      method: "POST",
      body: formData2,
      mode: "no-cors",
    })
      .then(() => {
        displayMessage("Your contact request has been recorded.", true);
        contactForm.reset();
      })
      .catch(() => {
        displayMessage(
          "There was an error submitting the contact request. Please try again.",
          false
        );
      });
  }

  async function postToGoogleFormProduction(
    name,
    email,
    phone,
    resume,
    role,
    moreinformation,
    typeofrole
  ) {
    const form_id = "1FAIpQLSefpzhGl46T63TuroNAmyfnRERfeeJjv8Z0hH6WNtNzp-bmgQ"; // Replace with your actual form ID
    const url = `https://docs.google.com/forms/d/e/${form_id}/formResponse?&submit=Submit?usp=pp_url&entry.1405737972=${encodeURIComponent(
      name
    )}&entry.1290086262=${encodeURIComponent(
      email
    )}&entry.1357912889=${encodeURIComponent(
      phone
    )}&entry.132713313=${encodeURIComponent(
      role
    )}&entry.1964045563=${encodeURIComponent(
      moreinformation
    )}&entry.579156192=${encodeURIComponent(
      typeofrole
    )}&entry.1067411802=${encodeURIComponent(
      resume
    )}&entry.emailAddress=${encodeURIComponent(email)}`;

    try {
      const _response = await fetch(url, {
        method: "POST",
        mode: "no-cors",
      }); // Send form data to Google Form
      displayMessage("Your volunteer request has been recorded.", true);
      window.location.href = redirectUrl;
      return _response.status;
    } catch (error) {
      displayMessage(
        "There was an error submitting the volunteer request. Please try again.",
        false
      );
    }
  }

  async function postToGoogleFormTest(
    name,
    email,
    phone,
    resume,
    role,
    moreinformation,
    typeofrole
  ) {
    const form_id = "1FAIpQLSfoiKWC0Np2Clnq1DDj8Un9GCrkB86AX-Dg_QZcwxPiU2QNbQ"; // Replace with your actual form ID
    const url = `https://docs.google.com/forms/d/e/${form_id}/formResponse?&submit=Submit?usp=pp_url&entry.1405737972=${encodeURIComponent(
      name
    )}&entry.1290086262=${encodeURIComponent(
      email
    )}&entry.1357912889=${encodeURIComponent(
      phone
    )}&entry.1943470005=${encodeURIComponent(
      role
    )}&entry.1695954646=${encodeURIComponent(
      moreinformation
    )}&entry.1681195710=${encodeURIComponent(
      typeofrole
    )}&entry.1964045563=${encodeURIComponent(
      resume
    )}&entry.emailAddress=${encodeURIComponent(email)}`;

    try {
      const _response = await fetch(url, {
        method: "POST",
        mode: "no-cors",
      }); // Send form data to Google Form
      displayMessage("Your volunteer request has been recorded.", true);
      console.log("Status:", _response); // Log the status code
      window.location.href = redirectUrl;
      console.log(_response, redirectUrl); // Log the status code
    } catch (error) {
      displayMessage(
        "There was an error submitting the volunteer request. Please try again.",
        false
      );
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
    if (!validName(nameInput.value.trim())) {
      addErrorMessage("full-name", "Please enter your full name, only letters");
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
  }

  window.openNotifyPopup = function () {
    document.getElementById("sourcePage").value = window.location.href;
    document.getElementById("notifyPopup").style.display = "block";
  };

  window.closeNotifyPopup = function () {
    document.getElementById("notifyPopup").style.display = "none";
  };

  function displayError() {
    // make the form red where it is not filled
    if (!validName(fullName)) {
      addErrorMessage("full-name", "Please enter your full name, only letters");
    }
    if (!validMail(email)) {
      if (!email) {
        addErrorMessage("email", "Please enter your email");
      } else {
        addErrorMessage(
          "email",
          "Invalid email format. Example: name@domain.com"
        );
      }
    }
    if (!validPhone(phone)) {
      if (!phone) {
        addErrorMessage("phone", "Please enter your phone number");
      } else {
        addErrorMessage(
          "phone",
          " Invalid Format. Phone number must be 10 digits. Example: 6 301 234 567"
        );
      }
    }
  }
});
