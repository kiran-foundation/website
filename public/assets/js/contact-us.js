import {  form_id  } from "../js/global-variables.js";
import { emailField,roleField, moreField,typeField,resumeField,nameField,phoneField,emailAddressField } from "../js/global-variables.js";

document.addEventListener("DOMContentLoaded", () => {
  const formSubmitButton = document.querySelector(
    ".form-submit-button"
  );
  formSubmitButton.disabled = true;

  const formFieldConfig = {
    "full-name": {
      validate: (value) => /^[a-zA-Z\s]+$/.test(value),
      errorText: "Please enter your full name, only letters",
      emptyText: "Please enter your name",
    },
    email: {
      validate: (value) =>
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value),
      errorText: "Invalid email format. Example: name@domain.com",
      emptyText: "Please enter your email",
    },
    phone: {
      validate: (value) =>
        /^\+?[1-9][0-9]{7,14}$/.test(value.replace(/[\s\-()]/g, "")),
      errorText: "Phone number must be between 8 and 15 digits, and can include an optional '+' at the start.",
      emptyText: "Please enter your phone number",
    },  
    message: {
      validate: (value) => value.trim().length > 0,
      errorText: "Message cannot be empty",
      emptyText: "Please enter your message",
    },
  };

  const validateEntireForm = () => {
    const allValid = Object.entries(formFieldConfig).every(
      ([fieldId, { validate }]) => {
        const fieldValue = document.getElementById(fieldId)?.value.trim() || "";
        return validate(fieldValue);
      }
    );
    formSubmitButton.disabled = !allValid;
  };

  const validateFieldOnBlur = (fieldId) => {
    const inputElement = document.getElementById(fieldId);
    if (!inputElement) return;

    const fieldValue = inputElement.value.trim();
    const { validate, errorText, emptyText } = formFieldConfig[fieldId];

    if (!fieldValue) {
      showFieldError(fieldId, emptyText);
    } else if (!validate(fieldValue)) {
      showFieldError(fieldId, errorText);
    }
  };

  const setupFieldEventListeners = () => {
    Object.keys(formFieldConfig).forEach((fieldId) => {
      const inputElement = document.getElementById(fieldId);
      if (!inputElement) return;

      inputElement.addEventListener("input", () => {
        validateEntireForm();
        clearFieldError(fieldId);
      });

      inputElement.addEventListener("blur", () => {
        validateFieldOnBlur(fieldId);
      });
    });
  };

  const showFieldError = (fieldId, message) => {
    const inputElement = document.getElementById(fieldId);
    if (!inputElement) return;

    inputElement.classList.add("error");
    inputElement.style.color = "#992424";

    const existingErrorElement = inputElement.nextElementSibling;
    if (existingErrorElement?.classList.contains("form-suberror")) {
      existingErrorElement.innerHTML = `❗${message}`;
    } else {
      inputElement.insertAdjacentHTML(
        "afterend",
        `<div class='form-suberror'>❗${message}</div>`
      );
    }
  };

  const clearFieldError = (fieldId) => {
    const inputElement = document.getElementById(fieldId);
    if (!inputElement) return;

    inputElement.classList.remove("error");
    inputElement.style.color = "#1E1E1E";

    const existingErrorElement = inputElement.nextElementSibling;
    if (existingErrorElement?.classList.contains("form-suberror")) {
      existingErrorElement.remove();
    }
  };

  const submitFormHandler = (formType) => {
    const fullName = document.getElementById("full-name")?.value.trim();
    const email = document.getElementById("email")?.value.trim();
    const phone = document.getElementById("phone")?.value.trim();
    const message =
      formType === "contact-us"
        ? document.getElementById("message")?.value
        : document.getElementById("more")?.value;
    const role =
      formType === "contact-us"
        ? "n/a"
        : window.location.href.split("/").slice(-2, -1)[0];
    const resume = "n/a";

    if (
      formFieldConfig["full-name"].validate(fullName) &&
      formFieldConfig["email"].validate(email) &&
      formFieldConfig["phone"].validate(phone) &&
      message
    ) {
      postToGoogleForm({
        name: fullName,
        email,
        phone,
        resume,
        role,
        moreinformation: message,
        typeofrole: formType,
      })
        .then(() => {
          showGlobalMessage("Your request has been recorded.", true);
          if (formType === "contact-us") {
            showSuccessPopUp();
          } else {
            const redirectUrl = document
              .getElementById("volunteering-form")
              ?.getAttribute("data-redirect");
            if (redirectUrl) window.location.href = redirectUrl;
          }
        })
        .catch((err) => {
          console.error("Submission error:", err);
          showGlobalMessage(
            "There was an error submitting the request. Please try again.",
            false
          );
        });
    } else {
      if (!formFieldConfig["full-name"].validate(fullName)) {
        showFieldError("full-name", formFieldConfig["full-name"].errorText);
      }
      if (!formFieldConfig["email"].validate(email)) {
        showFieldError("email", formFieldConfig["email"].errorText);
      }
      if (!formFieldConfig["phone"].validate(phone)) {
        showFieldError("phone", formFieldConfig["phone"].errorText);
      }
    }
  };

  const postToGoogleForm = async ({
    name,
    email,
    phone,
    resume,
    role,
    moreinformation,
    typeofrole,
  }) => {

    const url =
      `https://docs.google.com/forms/d/e/${form_id}/formResponse?&submit=Submit?usp=pp_url` +
      `&entry.${nameField}=${encodeURIComponent(name)}` +
      `&entry.${emailField}=${encodeURIComponent(email)}` +
      `&entry.${phoneField}=${encodeURIComponent(phone)}` +
      `&entry.${roleField}=${encodeURIComponent(role)}` +
      `&entry.${moreField}=${encodeURIComponent(moreinformation)}` +
      `&entry.${typeField}=${encodeURIComponent(typeofrole)}` +
      `&entry.${resumeField}=${encodeURIComponent(resume)}` +
      `&entry.${emailAddressField}=${encodeURIComponent(email)}`;

    return fetch(url, { method: "POST", mode: "no-cors" });
  };

  const showSuccessPopUp = () => {
    const lottiePlayer = document.getElementById("lottie-player");
    const formFrame = document.getElementById("formframe");
    const popUp = document.getElementById("pop-up");

    const observer = new MutationObserver(() => {
      if (popUp.style.display === "block") {
        lottiePlayer.stop();
        lottiePlayer.play();
      }
    });
    observer.observe(popUp, { attributes: true, attributeFilter: ["style"] });

    formFrame.style.display = "none";
    popUp.style.display = "block";
    document.getElementById("contactForm")?.reset();
  };

  const showGlobalMessage = (message, success) => {
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