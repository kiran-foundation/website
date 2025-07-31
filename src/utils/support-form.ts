export {};
import { CONFIG } from "./config";
import { getTextSync } from "./textLoader";
import { initiatePayment } from "./payment-service";

interface FormFieldConfig {
  validate: (value: string) => boolean;
  errorText: string;
  emptyText: string;
}

interface ApiResponse {
  success: boolean;
  data?: any;
  message?: string;
  error?: string;
}

// Configuration

// Utility functions (showLoader moved to payment-service)

const showNotification = (
  message: string,
  type: "success" | "error" | "info" = "info"
) => {
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

  setTimeout(() => notification.remove(), 5000);
};

// API helper functions
const apiCall = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse> => {
  const url = `${CONFIG.API_BASE_URL}${endpoint}`;

  console.log("Making API call to:", url);
  console.log("With options:", options);

  try {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...options.headers,
      },
      ...options,
    });

    console.log("Response status:", response.status);
    console.log("Response headers:", response.headers);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error Response:", errorText);

      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText };
      }

      throw new Error(
        errorData.message || `HTTP ${response.status}: Request failed`
      );
    }

    const data = await response.json();
    console.log("API Success Response:", data);

    return data;
  } catch (error) {
    console.error("API Call Error:", error);

    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error(
        "Connection error: Unable to reach the server. Please check your internet connection."
      );
    }

    throw error;
  }
};



// Test backend connectivity
const testBackendConnection = async (): Promise<void> => {
  try {
    console.log("Testing backend connection...");
    const response = await apiCall("/health");
    console.log("Backend health check successful:", response);
    showNotification("Backend connection successful", "success");
  } catch (error) {
    console.error("Backend health check failed:", error);
    showNotification(`Backend connection failed: ${error.message}`, "error");
  }
};

export function initializeSupportForm(): void {
  const urlParams = new URLSearchParams(window.location.search);

  const donationAmount = Number(urlParams.get("amount") ?? "0");
  const paymentType = String(
    urlParams.get("frequency") ?? "onetime"
  ).toLowerCase();

  // Check if parameters are invalid and show helper message
  const paramsInvalid =
    donationAmount <= 0 ||
    !["onetime", "monthly", "yearly"].includes(paymentType);
  const navigationHelper = document.getElementById("navigation-helper");

  if (paramsInvalid && navigationHelper) {
    navigationHelper.classList.remove("hidden");
  }

  // Validate parameters - but don't return early, just show warnings
  if (donationAmount <= 0) {
    showNotification(getTextSync("errors.selectAmount"), "error");
  }

  if (!["onetime", "monthly", "yearly"].includes(paymentType)) {
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

  if (amountDisplay) {
    if (donationAmount > 0) {
      amountDisplay.innerHTML = `₹${donationAmount.toLocaleString()}`;
    } else {
      amountDisplay.innerHTML = `₹0`;
      amountDisplay.style.color = "#999";
    }
  }

  if (frequencyDisplay) {
    if (["onetime", "monthly", "yearly"].includes(paymentType)) {
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

  // Disable donate button if parameters are invalid
  if (
    donateButton &&
    (donationAmount <= 0 ||
      !["onetime", "monthly", "yearly"].includes(paymentType))
  ) {
    donateButton.disabled = true;
    donateButton.style.opacity = "0.5";
    donateButton.innerHTML = `<span class="mx-3">${getTextSync("buttons.selectAmountFrequency")}</span>`;
  }

  setupFormValidation();

  // Test backend connection on initialization
  testBackendConnection();

  if (
    donateButton &&
    donationAmount > 0 &&
    ["onetime", "monthly", "yearly"].includes(paymentType)
  ) {
    donateButton.addEventListener("click", (e) => {
      e.preventDefault();
      initiatePayment(donationAmount, paymentType);
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

  const showError = (id: string, message: string): void => {
    const el = document.getElementById(id) as HTMLInputElement;
    if (!el) return;

    el.classList.add("error");
    el.style.borderColor = "#992424";

    // Find the error container (either .form-error-container or create one)
    let errorContainer = el.parentNode?.querySelector(
      ".form-error-container"
    ) as HTMLElement;
    if (!errorContainer) {
      // Fallback: look for existing .form-error or create new one
      const existingError = el.parentNode?.querySelector(".form-error");
      if (existingError) existingError.remove();

      const error = document.createElement("div");
      error.className = "form-error";
      error.style.color = "#992424";
      error.style.fontSize = "0.875rem";
      error.style.marginTop = "0.25rem";
      error.textContent = message;
      el.parentNode?.insertBefore(error, el.nextSibling);
      return;
    }

    // Clear existing error and add new one
    errorContainer.innerHTML = "";
    const error = document.createElement("div");
    error.className = "form-error";
    error.style.color = "#992424";
    error.style.fontSize = "0.875rem";
    error.style.marginTop = "0.25rem";
    error.textContent = message;
    errorContainer.appendChild(error);
  };

  const clearError = (id: string): void => {
    const el = document.getElementById(id) as HTMLInputElement;
    if (!el) return;

    el.classList.remove("error");
    el.style.borderColor = "";

    // Clear error from both possible locations
    const error = el.parentNode?.querySelector(".form-error");
    if (error) error.remove();

    const errorContainer = el.parentNode?.querySelector(
      ".form-error-container"
    ) as HTMLElement;
    if (errorContainer) {
      errorContainer.innerHTML = "";
    }
  };

  const validateField = (id: string): boolean => {
    const el = document.getElementById(id) as HTMLInputElement;
    const fieldConfig = fields[id];

    if (!el || !fieldConfig) return true;

    const value = el.value.trim();

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
    Object.keys(fields).forEach((id) => clearError(id));
  };

  const isFormValid = (): boolean => {
    return Object.entries(fields).every(([id]) => {
      const el = document.getElementById(id) as HTMLInputElement;
      return el?.value.trim() !== "";
    });
  };

  const checkEmptyFields = (): void => {
    clearAllErrors();

    let firstErrorField: HTMLInputElement | null = null;
    let emptyFieldCount = 0;

    Object.entries(fields).forEach(([id, cfg]) => {
      const el = document.getElementById(id) as HTMLInputElement;
      if (!el?.value.trim()) {
        showError(id, cfg.emptyText);
        emptyFieldCount++;
        if (!firstErrorField) {
          firstErrorField = el;
        }
      }
    });

    // Focus on first empty field
    if (firstErrorField) {
      firstErrorField.focus();
      firstErrorField.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    // Show notification
    if (emptyFieldCount > 0) {
      const message =
        emptyFieldCount === 1
          ? getTextSync("notifications.fillSingleField")
          : getTextSync("notifications.fillMultipleFields", {
              count: emptyFieldCount,
            });
      showNotification(message, "error");
    }
  };

  // Add blur event listeners for real-time validation
  form.addEventListener(
    "blur",
    (e) => {
      const target = e.target as HTMLInputElement;
      if (target.id && fields[target.id]) {
        validateField(target.id);
      }
    },
    true
  ); // Use capture phase to catch all blur events

  // Update button state on input
  form.addEventListener("input", (e) => {
    const target = e.target as HTMLInputElement;

    // Clear error when user starts typing
    if (target.id && fields[target.id]) {
      const error = target.parentNode?.querySelector(".form-error");
      if (error && target.value.trim()) {
        clearError(target.id);
      }
    }

    // Update button state - only enable if form is valid AND URL params are valid
    const urlParams = new URLSearchParams(window.location.search);
    const donationAmount = Number(urlParams.get("amount") ?? "0");
    const paymentType = String(
      urlParams.get("frequency") ?? "onetime"
    ).toLowerCase();

    const formIsValid = isFormValid();
    const paramsValid =
      donationAmount > 0 &&
      ["onetime", "monthly", "yearly"].includes(paymentType);

    donateButton.disabled = !(formIsValid && paramsValid);

    // Show/hide overlay based on form validity
    if (buttonOverlay) {
      buttonOverlay.style.display =
        formIsValid && paramsValid ? "none" : "block";
    }
  });

  // Handle overlay click when form is invalid
  if (buttonOverlay) {
    buttonOverlay.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      checkEmptyFields();
    });
  }

  // Make functions available globally
  (window as any).isFormValid = isFormValid;
  (window as any).clearAllErrors = clearAllErrors;
  (window as any).checkEmptyFields = checkEmptyFields;
}

// Payment initiation is now handled by the payment-service module

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeSupportForm);
} else {
  initializeSupportForm();
}

// Listen for re-initialization events from payment service
window.addEventListener('reinitializeForm', initializeSupportForm);
