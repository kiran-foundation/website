export {};
import { getTextSync } from "./textLoader";
import {
  initiatePayment,
  validatePaymentInitiation,
  getFormData,
  PAYMENT_CONSTANTS,
} from "./payment-service";
import type { FormFieldConfig, ValidationResult } from "../types/payment";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const CONSTANTS = {
  NOTIFICATION_TIMEOUT: 5000,
  SCROLL_BEHAVIOR: "smooth" as const,
  SCROLL_BLOCK: "center" as const,
  SUPPORTED_FREQUENCIES: PAYMENT_CONSTANTS.SUPPORTED_FREQUENCIES,
  ERROR_BORDER_COLOR: "#992424",
  FORM_RESET_DELAY: 100,
} as const;

const showLoader = (show: boolean): void => {
  const loader = document.getElementById("payment-loader");
  if (loader) {
    loader.style.display = show ? "block" : "none";
  }
};

const showNotification = (
  message: string,
  type: "success" | "error" | "info" = "info"
): void => {
  // Remove existing notifications
  const existing = document.querySelector(".notification");
  if (existing) existing.remove();

  const notification = document.createElement("div");
  notification.className = `notification fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
    type === "success"
      ? "bg-green-500 text-white"
      : type === "error"
        ? "bg-[#992424] text-white"
        : "bg-blue-500 text-white"
  }`;
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => notification.remove(), CONSTANTS.NOTIFICATION_TIMEOUT);
};

function populateDurationOptions(paymentType: string): void {
  const durationSelect = document.getElementById(
    "subscription-duration"
  ) as HTMLSelectElement;

  if (!durationSelect) return;

  // Clear existing options
  durationSelect.innerHTML = "";

  if (paymentType === "yearly") {
    // For yearly subscriptions, start from 2 years (no 1 year option)
    const yearlyOptions = [
      { value: 2, text: "2 Years" },
      { value: 3, text: "3 Years" },
      { value: 4, text: "4 Years" },
      { value: 5, text: "5 Years" },
    ];

    yearlyOptions.forEach((option, index) => {
      const optionElement = document.createElement("option");
      optionElement.value = option.value.toString();
      optionElement.textContent = option.text;
      // Default to 5 years for yearly subscriptions
      if (option.value === 5) {
        optionElement.selected = true;
      }
      durationSelect.appendChild(optionElement);
    });

    // Update commitment display for default selection
    updateCommitmentDisplay(5);
  } else {
    // For monthly subscriptions, include all options (1-5 years)
    const monthlyOptions = [
      { value: 1, text: "1 Year" },
      { value: 2, text: "2 Years" },
      { value: 3, text: "3 Years" },
      { value: 4, text: "4 Years" },
      { value: 5, text: "5 Years" },
    ];

    monthlyOptions.forEach((option, index) => {
      const optionElement = document.createElement("option");
      optionElement.value = option.value.toString();
      optionElement.textContent = option.text;
      // Default to 5 years for monthly subscriptions
      if (option.value === 5) {
        optionElement.selected = true;
      }
      durationSelect.appendChild(optionElement);
    });

    // Update commitment display for default selection
    updateCommitmentDisplay(5);
  }
}

function setupDurationEventListeners(): void {
  const durationSelect = document.getElementById(
    "subscription-duration"
  ) as HTMLSelectElement;

  if (durationSelect) {
    durationSelect.addEventListener("change", (e) => {
      const selectedYears = parseInt((e.target as HTMLSelectElement).value);
      updateCommitmentDisplay(selectedYears);
    });
  }
}

function updateCommitmentDisplay(years: number): void {
  const commitmentDisplay = document.getElementById("commitment-display");
  if (commitmentDisplay) {
    const text =
      years === 1 ? "1 year commitment" : `${years} years commitment`;
    commitmentDisplay.textContent = text;
  }
}

function getSelectedDuration(): number {
  const durationSelect = document.getElementById(
    "subscription-duration"
  ) as HTMLSelectElement;

  // Get payment type from URL to determine appropriate default
  const urlParams = new URLSearchParams(window.location.search);
  const paymentType = urlParams.get("frequency") || "monthly";
  const defaultDuration = 5; // Default to 5 years for both monthly and yearly

  if (!durationSelect) return defaultDuration;

  const selectedValue = parseInt(durationSelect.value);
  // Validate duration is within appropriate range
  const minDuration = paymentType === "yearly" ? 2 : 1;
  if (selectedValue >= minDuration && selectedValue <= 5) {
    return selectedValue;
  }

  console.warn(
    `Invalid duration ${selectedValue}, defaulting to ${defaultDuration} years`
  );
  return defaultDuration;
}

export function initializeSupportForm(): void {
  const urlParams = new URLSearchParams(window.location.search);

  const donationAmount = Number(urlParams.get("amount") ?? "0");
  const paymentType = String(
    urlParams.get("frequency") ?? "onetime"
  ).toLowerCase();

  // Check if parameters are invalid and show helper message
  const paramsInvalid =
    donationAmount <= 0 ||
    !CONSTANTS.SUPPORTED_FREQUENCIES.includes(paymentType as any);
  const navigationHelper = document.getElementById("navigation-helper");

  if (paramsInvalid && navigationHelper) {
    navigationHelper.classList.remove("hidden");
  }

  // Validate parameters - but don't return early, just show warnings
  if (donationAmount <= 0) {
    showNotification(getTextSync("errors.selectAmount"), "error");
  }

  if (!CONSTANTS.SUPPORTED_FREQUENCIES.includes(paymentType as any)) {
    showNotification(getTextSync("errors.selectFrequency"), "error");
  }

  // Update display elements
  const amountDisplay = document.getElementById(
    "amountToDisplay"
  ) as HTMLDivElement;
  const frequencyDisplay = document.getElementById(
    "toBeDisplay"
  ) as HTMLDivElement;
  const donateButton = document.getElementById(
    "donate-now-button"
  ) as HTMLButtonElement;
  const durationSelector = document.getElementById("duration-selector");

  if (amountDisplay) {
    if (donationAmount > 0) {
      amountDisplay.innerHTML = `₹${donationAmount.toLocaleString()}`;
    } else {
      amountDisplay.innerHTML = `₹0`;
      amountDisplay.style.color = "#999";
    }
  }

  if (frequencyDisplay) {
    if (CONSTANTS.SUPPORTED_FREQUENCIES.includes(paymentType as any)) {
      frequencyDisplay.innerHTML =
        paymentType === "monthly"
          ? getTextSync("display.perMonth")
          : paymentType === "yearly"
            ? getTextSync("display.perYear")
            : getTextSync("display.oneTime");
    } else {
      frequencyDisplay.innerHTML = getTextSync("display.selectFrequency");
      frequencyDisplay.style.color = "#999";
    }
  }

  // Show/hide duration selector based on payment type
  if (durationSelector) {
    const isSubscription = ["monthly", "yearly"].includes(paymentType);
    durationSelector.style.display = isSubscription ? "block" : "none";

    if (isSubscription) {
      populateDurationOptions(paymentType);
      setupDurationEventListeners();
    }
  }

  // Disable donate button if parameters are invalid
  if (
    donateButton &&
    (donationAmount <= 0 ||
      !CONSTANTS.SUPPORTED_FREQUENCIES.includes(paymentType as any))
  ) {
    donateButton.disabled = true;
    donateButton.style.opacity = "0.5";
    donateButton.innerHTML = `<span class="mx-3">${getTextSync("buttons.selectAmountFrequency")}</span>`;
  }

  setupFormValidation();

  if (
    donateButton &&
    donationAmount > 0 &&
    ["onetime", "monthly", "yearly"].includes(paymentType)
  ) {
    donateButton.addEventListener("click", (e) => {
      e.preventDefault();
      handlePaymentInitiation(donationAmount, paymentType);
    });
  }
}

function setupFormValidation(): void {
  const form = document.getElementById("donation-form") as HTMLFormElement;
  const donateButton = document.getElementById(
    "donate-now-button"
  ) as HTMLButtonElement;
  const buttonOverlay = document.getElementById(
    "button-overlay"
  ) as HTMLDivElement;

  if (!form || !donateButton) return;

  donateButton.disabled = true;
  if (buttonOverlay) {
    buttonOverlay.style.display = "block";
  }

  const fields: Record<string, FormFieldConfig> = {
    name: {
      validate: (v) => /^[a-zA-Z\s]{2,50}$/.test(v.trim()),
      errorText: getTextSync("validation.nameError"),
      emptyText: getTextSync("validation.nameEmpty"),
    },
    email: {
      validate: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) && v.length <= 100,
      errorText: getTextSync("validation.emailError"),
      emptyText: getTextSync("validation.emailEmpty"),
    },
    phone: {
      validate: (v) => /^\+?[1-9][0-9]{7,14}$/.test(v.replace(/[\s\-()]/g, "")),
      errorText: getTextSync("validation.phoneError"),
      emptyText: getTextSync("validation.phoneEmpty"),
    },
    country: {
      validate: (v) => v.trim().length >= 2 && v.trim().length <= 50,
      errorText: getTextSync("validation.countryError"),
      emptyText: getTextSync("validation.countryEmpty"),
    },
    address: {
      validate: (v) => v.trim().length >= 5 && v.trim().length <= 200,
      errorText: getTextSync("validation.addressError"),
      emptyText: getTextSync("validation.addressEmpty"),
    },
    city: {
      validate: (v) => v.trim().length >= 2 && v.trim().length <= 50,
      errorText: getTextSync("validation.cityError"),
      emptyText: getTextSync("validation.cityEmpty"),
    },
    zipcode: {
      validate: (v) => /^\d{5,10}$/.test(v.replace(/[\s\-]/g, "")),
      errorText: getTextSync("validation.zipcodeError"),
      emptyText: getTextSync("validation.zipcodeEmpty"),
    },
  };

  // Enhanced error handling functions
  const createErrorElement = (message: string): HTMLDivElement => {
    const error = document.createElement("div");
    error.className = "form-error";
    error.style.cssText =
      "color: #992424; font-size: 0.875rem; margin-top: 0.25rem;";
    error.textContent = message;
    return error;
  };

  const showError = (id: string, message: string): void => {
    const element = document.getElementById(id) as HTMLInputElement;
    if (!element) return;

    // Apply error styling
    element.classList.add("error");
    element.style.borderColor = CONSTANTS.ERROR_BORDER_COLOR;

    // Remove existing errors
    clearError(id);

    // Find or create error container
    const errorContainer = element.parentNode?.querySelector(
      ".form-error-container"
    ) as HTMLElement;
    const errorElement = createErrorElement(message);

    if (errorContainer) {
      errorContainer.appendChild(errorElement);
    } else {
      element.parentNode?.insertBefore(errorElement, element.nextSibling);
    }
  };

  const clearError = (id: string): void => {
    const element = document.getElementById(id) as HTMLInputElement;
    if (!element) return;

    // Remove error styling
    element.classList.remove("error");
    element.style.borderColor = "";

    // Remove error messages
    const existingErrors = element.parentNode?.querySelectorAll(".form-error");
    existingErrors?.forEach((error) => error.remove());

    const errorContainer = element.parentNode?.querySelector(
      ".form-error-container"
    ) as HTMLElement;
    if (errorContainer) {
      errorContainer.innerHTML = "";
    }
  };

  const validateField = (id: string): boolean => {
    const element = document.getElementById(id) as HTMLInputElement;
    const fieldConfig = fields[id];

    if (!element || !fieldConfig) return true;

    const value = element.value.trim();

    // Check if field is empty
    if (value === "") {
      showError(id, fieldConfig.emptyText);
      return false;
    }

    // Check if field is valid
    if (!fieldConfig.validate(value)) {
      showError(id, fieldConfig.errorText);
      return false;
    }

    // Field is valid, clear any errors
    clearError(id);
    return true;
  };

  const clearAllErrors = (): void => {
    Object.keys(fields).forEach(clearError);
  };

  const isFormValid = (): boolean => {
    return Object.keys(fields).every((id) => {
      const element = document.getElementById(id) as HTMLInputElement;
      return element?.value.trim() !== "";
    });
  };

  const validateAllFields = (): ValidationResult => {
    clearAllErrors();

    let firstErrorField: HTMLInputElement | null = null;
    let emptyFieldCount = 0;

    for (const [id, config] of Object.entries(fields)) {
      const element = document.getElementById(id) as HTMLInputElement;
      if (!element?.value.trim()) {
        showError(id, config.emptyText);
        emptyFieldCount++;
        if (!firstErrorField) {
          firstErrorField = element;
        }
      }
    }

    return {
      isValid: emptyFieldCount === 0,
      firstErrorField: firstErrorField || undefined,
      emptyFieldCount,
    };
  };

  const focusFirstError = (result: ValidationResult): void => {
    if (result.firstErrorField) {
      result.firstErrorField.focus();
      result.firstErrorField.scrollIntoView({
        behavior: CONSTANTS.SCROLL_BEHAVIOR,
        block: CONSTANTS.SCROLL_BLOCK,
      });
    }
  };

  const showValidationNotification = (emptyFieldCount: number): void => {
    if (emptyFieldCount === 0) return;

    const message =
      emptyFieldCount === 1
        ? getTextSync("notifications.fillSingleField")
        : getTextSync("notifications.fillMultipleFields", {
            count: emptyFieldCount,
          });

    showNotification(message, "error");
  };

  const checkEmptyFields = (): void => {
    const result = validateAllFields();
    focusFirstError(result);
    showValidationNotification(result.emptyFieldCount);
  };

  // Enhanced event handling with better separation of concerns
  const attachFormEventListeners = (): void => {
    form.addEventListener("blur", handleFormBlur, true);
    form.addEventListener("input", handleFormInput);
  };

  const handleFormBlur = (e: Event): void => {
    const target = e.target as HTMLInputElement;
    if (target.id && fields[target.id]) {
      validateField(target.id);
    }
  };

  const handleFormInput = (e: Event): void => {
    const target = e.target as HTMLInputElement;

    // Clear error when user starts typing
    if (target.id && fields[target.id] && target.value.trim()) {
      clearError(target.id);
    }

    updateButtonState();
  };

  const updateButtonState = (): void => {
    const urlParams = new URLSearchParams(window.location.search);
    const donationAmount = Number(urlParams.get("amount") ?? "0");
    const paymentType = String(
      urlParams.get("frequency") ?? "onetime"
    ).toLowerCase();

    const formIsValid = isFormValid();
    const paramsValid =
      donationAmount > 0 &&
      CONSTANTS.SUPPORTED_FREQUENCIES.includes(paymentType as any);

    donateButton.disabled = !(formIsValid && paramsValid);

    // Show/hide overlay based on form validity
    if (buttonOverlay) {
      buttonOverlay.style.display =
        formIsValid && paramsValid ? "none" : "block";
    }
  };

  const handleOverlayClick = (e: Event): void => {
    e.preventDefault();
    e.stopPropagation();
    checkEmptyFields();
  };

  // Initialize event listeners
  attachFormEventListeners();

  // Handle overlay click when form is invalid
  if (buttonOverlay) {
    buttonOverlay.addEventListener("click", handleOverlayClick);
  }

  // Make functions available globally
  (window as any).isFormValid = isFormValid;
  (window as any).clearAllErrors = clearAllErrors;
  (window as any).checkEmptyFields = checkEmptyFields;
}

// Payment initiation handler that uses the payment service
function handlePaymentInitiation(amount: number, type: string): void {
  const form = document.getElementById("donation-form") as HTMLFormElement;

  // Validate payment initiation parameters and form
  const validation = validatePaymentInitiation(amount, type);
  if (!validation.isValid) {
    showNotification(validation.errorMessage!, "error");
    return;
  }

  // Validate form fields
  if (
    typeof (window as any).isFormValid === "function" &&
    !(window as any).isFormValid()
  ) {
    if (typeof (window as any).checkEmptyFields === "function") {
      (window as any).checkEmptyFields();
    }
    showNotification(getTextSync("errors.fillRequiredFields"), "error");
    return;
  }

  // Get form data with duration
  const selectedDuration = getSelectedDuration();
  const formData = getFormData(amount, type);
  (formData as any).selectedDuration = selectedDuration;

  // Create callbacks for the payment service
  const callbacks = {
    showLoader,
    showNotification,
    onSuccess: () => {
      // Reset form
      form.reset();
      if (typeof (window as any).clearAllErrors === "function") {
        (window as any).clearAllErrors();
      }

      // Re-initialize form after reset
      setTimeout(() => {
        initializeSupportForm();
      }, CONSTANTS.FORM_RESET_DELAY);
    },
  };

  // Call the payment service
  initiatePayment(amount, type, formData, callbacks);
}

// Initialize the support form when DOM is ready
const initializeWhenReady = (): void => {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeSupportForm);
  } else {
    initializeSupportForm();
  }
};

initializeWhenReady();
