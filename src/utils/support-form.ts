export { };
import { SUPPORT_US_CONFIG } from './config';
import { initializeTextLoader, getTextSync } from './textLoader';
import type { 
  PaymentFormData, 
  ApiResponse, 
  RazorpayResponse, 
  FormFieldConfig, 
  ValidationResult,
  PaymentValidationResult
} from '../types/payment';

declare global {
  interface Window {
    Razorpay: any;
  }
}

const CONSTANTS = {
  NOTIFICATION_TIMEOUT: 5000,
  SCROLL_BEHAVIOR: 'smooth' as const,
  SCROLL_BLOCK: 'center' as const,
  SUPPORTED_FREQUENCIES: ['onetime', 'monthly', 'yearly'] as const,
  ERROR_BORDER_COLOR: '#992424',
  FORM_RESET_DELAY: 100,
} as const;

const showLoader = (show: boolean): void => {
  const loader = document.getElementById('payment-loader');
  if (loader) {
    loader.style.display = show ? 'block' : 'none';
  }
};

const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info'): void => {
  // Remove existing notifications
  const existing = document.querySelector('.notification');
  if (existing) existing.remove();

  const notification = document.createElement('div');
  notification.className = `notification fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
    type === 'success' ? 'bg-green-500 text-white' :
    type === 'error' ? 'bg-[#992424] text-white' :
    'bg-blue-500 text-white'
  }`;
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => notification.remove(), CONSTANTS.NOTIFICATION_TIMEOUT);
};

// API helper functions
const apiCall = async (endpoint: string, options: RequestInit = {}): Promise<ApiResponse> => {
  const url = `${SUPPORT_US_CONFIG.API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP ${response.status}: Request failed`);
    }
    return data;
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error(getTextSync('errors.connectionError'));
    }
    throw error;
  }
};

const getRazorpayKey = async (): Promise<string> => {
  try {
    const response = await apiCall('/razorpay-key');
    return response.data?.key || SUPPORT_US_CONFIG.RAZORPAY_KEY;
  } catch (error) {
    return SUPPORT_US_CONFIG.RAZORPAY_KEY;
  }
};

const getOrCreatePlan = (amount: number, frequency: string): string | null => {
  if (frequency === 'onetime') return null;
  const subscriptionFrequencies = CONSTANTS.SUPPORTED_FREQUENCIES.filter(f => f !== 'onetime');
  if (!subscriptionFrequencies.includes(frequency as any)) {
    return null;
  }

  const plans = SUPPORT_US_CONFIG.PREDEFINED_PLANS[frequency as keyof typeof SUPPORT_US_CONFIG.PREDEFINED_PLANS];

  if (plans && amount in plans) {
    const planId = plans[amount as keyof typeof plans];
    if (planId !== null) {
      return planId;
    }
  }  
  // Return null to indicate a new plan needs to be created
  return null;
};

const postToGoogleForm = async ({
  fullName,
  email,
  number,
  country,
  address,
  city,
  pincode,
  notes,
  donationDetails,
}: {
  fullName: string;
  email: string;
  number: string;
  country: string;
  address: string;
  city: string;
  pincode: string;
  notes: string;
  donationDetails: string;
}): Promise<void> => {
  try {
    const url = SUPPORT_US_CONFIG.GOOGLE_FORM.URL;

    const formData = new URLSearchParams();
    formData.append(SUPPORT_US_CONFIG.GOOGLE_FORM.ENTRIES.FULL_NAME, fullName);
    formData.append(SUPPORT_US_CONFIG.GOOGLE_FORM.ENTRIES.EMAIL, email);
    formData.append(SUPPORT_US_CONFIG.GOOGLE_FORM.ENTRIES.PHONE, number);
    formData.append(SUPPORT_US_CONFIG.GOOGLE_FORM.ENTRIES.COUNTRY, country);
    formData.append(SUPPORT_US_CONFIG.GOOGLE_FORM.ENTRIES.ADDRESS, address);
    formData.append(SUPPORT_US_CONFIG.GOOGLE_FORM.ENTRIES.CITY, city);
    formData.append(SUPPORT_US_CONFIG.GOOGLE_FORM.ENTRIES.PINCODE, pincode);
    formData.append(SUPPORT_US_CONFIG.GOOGLE_FORM.ENTRIES.NOTES, notes);
    formData.append(SUPPORT_US_CONFIG.GOOGLE_FORM.ENTRIES.DONATION_DETAILS, donationDetails);

    await fetch(url, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

  } catch (error) {
    // Silently handle Google Form submission errors
  }
};

// Payment verification
const verifyPayment = async (paymentData: RazorpayResponse): Promise<boolean> => {
  if (!paymentData.razorpay_payment_id || !paymentData.razorpay_order_id || !paymentData.razorpay_signature) {
    return false;
  }

  try {
    const response = await apiCall('/verify-payment', {
      method: 'POST',
      body: JSON.stringify({
        razorpay_payment_id: paymentData.razorpay_payment_id,
        razorpay_order_id: paymentData.razorpay_order_id,
        razorpay_signature: paymentData.razorpay_signature,
      }),
    });

    return response.success;
  } catch (error) {
    return false;
  }
};

async function initiatePayment(amount: number, type: string): Promise<void> {
  const form = document.getElementById("donation-form") as HTMLFormElement;

  // Validate payment initiation parameters and form
  const validation = validatePaymentInitiation(amount, type);
  if (!validation.isValid) {
    showNotification(validation.errorMessage!, 'error');
    return;
  }

  showLoader(true);

  try {
    // Get form data
    const formData = getFormData(amount, type);

    // Check for existing plan or prepare for new plan creation
    const existingPlanId = getOrCreatePlan(formData.amount, type);
    if (existingPlanId) {
      formData.plan_id = existingPlanId;
    }

    // Add total_count parameter for subscriptions
    if (type !== "onetime") {
      (formData as any).total_count = type === "monthly" ? 60 : 5;
    }

    // Get Razorpay key
    const razorpayKey = await getRazorpayKey();

    // Determine endpoint and make API call
    const endpoint = type === "onetime" ? "/create-order" : "/create-subscription";

    const response = await apiCall(endpoint, {
      method: 'POST',
      body: JSON.stringify(formData),
    });

    if (!response.success) {
      throw new Error(response.message || getTextSync('errors.paymentCreationFailed'));
    }

    // Check if Razorpay SDK is loaded
    if (typeof window.Razorpay === "undefined") {
      throw new Error(getTextSync('errors.razorpayNotLoaded'));
    }

    // Prepare Razorpay options
    const options: any = {
      key: razorpayKey,
      amount: formData.amount,
      currency: "INR",
      name: SUPPORT_US_CONFIG.COMPANY_NAME,
      description: type === "onetime" ? "Donation" : `${type.charAt(0).toUpperCase() + type.slice(1)} Subscription`,
      image: SUPPORT_US_CONFIG.COMPANY_LOGO,
      handler: async (razorpayResponse: RazorpayResponse) => {
        showLoader(true);
        try {
          // Verify payment for one-time payments
          if (type === "onetime") {
            const isVerified = await verifyPayment(razorpayResponse);
            if (!isVerified) {
              throw new Error(getTextSync("errors.paymentVerificationFailed"));
            }
          }

          // Submit to Google Form
          const donationDetails = `Donation: ₹${amount} | Frequency: ${type} | Payment ID: ${razorpayResponse.razorpay_payment_id || razorpayResponse.razorpay_subscription_id || 'N/A'
            }`;

          await postToGoogleForm({
            fullName: formData.name,
            email: formData.email,
            number: formData.phone,
            country: formData.country,
            address: formData.address,
            city: formData.city,
            pincode: formData.zipcode,
            notes: formData.notes.additional_notes,
            donationDetails,
          });

          showNotification(
            type === "onetime" ? getTextSync("success.paymentSuccess") :
              getTextSync("success.subscriptionSuccess"),
            'success'
          );

          // Reset form
          form.reset();
          if (typeof (window as any).clearAllErrors === 'function') {
            (window as any).clearAllErrors();
          }

          // Re-initialize form after reset
          setTimeout(() => {
            initializeSupportForm();
          }, 100);

        } catch (error) {
          showNotification(
            getTextSync('errors.postPaymentIssue'),
            'error'
          );
        } finally {
          showLoader(false);
        }
      },
      modal: {
        ondismiss: function () {
          showLoader(false);
        },
      },
      prefill: {
        name: formData.name,
        email: formData.email,
        contact: formData.phone,
      },
      notes: formData.notes,
      theme: { color: SUPPORT_US_CONFIG.THEME_COLOR },
    };

    // Add order_id for one-time payments or subscription_id for subscriptions
    if (type === "onetime" && response.data.orderId) {
      options.order_id = response.data.orderId;
    } else if (type !== "onetime" && response.data.subscription_id) {
      options.subscription_id = response.data.subscription_id;
    } else {
      throw new Error(getTextSync("errors.invalidServerResponse"));
    }
    
    // Open Razorpay checkout
    const razorpay = new window.Razorpay(options);
    razorpay.open();

  } catch (error: any) {
    handlePaymentError(error);
  } finally {
    showLoader(false);
  }
}

export function initializeSupportForm(): void {
  const urlParams = new URLSearchParams(window.location.search);

  const donationAmount = Number(urlParams.get("amount") ?? "0");
  const paymentType = String(urlParams.get("frequency") ?? "onetime").toLowerCase();

  // Check if parameters are invalid and show helper message
  const paramsInvalid = donationAmount <= 0 || !CONSTANTS.SUPPORTED_FREQUENCIES.includes(paymentType as any);
  const navigationHelper = document.getElementById('navigation-helper');

  if (paramsInvalid && navigationHelper) {
    navigationHelper.classList.remove('hidden');
  }

  // Validate parameters - but don't return early, just show warnings
  if (donationAmount <= 0) {
    showNotification(getTextSync('errors.selectAmount'), 'error');
  }

  if (!CONSTANTS.SUPPORTED_FREQUENCIES.includes(paymentType as any)) {
    showNotification(getTextSync('errors.selectFrequency'), 'error');
  }

  // Update display elements
  const amountDisplay = document.getElementById("amountToDisplay") as HTMLDivElement;
  const frequencyDisplay = document.getElementById("toBeDisplay") as HTMLDivElement;
  const donateButton = document.getElementById("donate-now-button") as HTMLButtonElement;

  if (amountDisplay) {
    if (donationAmount > 0) {
      amountDisplay.innerHTML = `₹${donationAmount.toLocaleString()}`;
    } else {
      amountDisplay.innerHTML = `₹0`;
      amountDisplay.style.color = '#999';
    }
  }

  if (frequencyDisplay) {
    if (CONSTANTS.SUPPORTED_FREQUENCIES.includes(paymentType as any)) {
      frequencyDisplay.innerHTML =
        paymentType === "monthly" ? getTextSync("display.perMonth") :
          paymentType === "yearly" ? getTextSync("display.perYear") : getTextSync("display.oneTime");
    } else {
      frequencyDisplay.innerHTML = getTextSync("display.selectFrequency");
      frequencyDisplay.style.color = '#999';
    }
  }

  // Disable donate button if parameters are invalid
  if (donateButton && (donationAmount <= 0 || !CONSTANTS.SUPPORTED_FREQUENCIES.includes(paymentType as any))) {
    donateButton.disabled = true;
    donateButton.style.opacity = '0.5';
    donateButton.innerHTML = `<span class="mx-3">${getTextSync('buttons.selectAmountFrequency')}</span>`;
  }

  setupFormValidation();

  if (donateButton && donationAmount > 0 && ['onetime', 'monthly', 'yearly'].includes(paymentType)) {
    donateButton.addEventListener("click", (e) => {
      e.preventDefault();
      initiatePayment(donationAmount, paymentType);
    });
  }
}

function setupFormValidation(): void {
  const form = document.getElementById("donation-form") as HTMLFormElement;
  const donateButton = document.getElementById("donate-now-button") as HTMLButtonElement;
  const buttonOverlay = document.getElementById("button-overlay") as HTMLDivElement;

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
    error.style.cssText = "color: #992424; font-size: 0.875rem; margin-top: 0.25rem;";
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
    const errorContainer = element.parentNode?.querySelector(".form-error-container") as HTMLElement;
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
    existingErrors?.forEach(error => error.remove());

    const errorContainer = element.parentNode?.querySelector(".form-error-container") as HTMLElement;
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
    return Object.keys(fields).every(id => {
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
      emptyFieldCount
    };
  };

  const focusFirstError = (result: ValidationResult): void => {
    if (result.firstErrorField) {
      result.firstErrorField.focus();
      result.firstErrorField.scrollIntoView({ 
        behavior: CONSTANTS.SCROLL_BEHAVIOR, 
        block: CONSTANTS.SCROLL_BLOCK 
      });
    }
  };

  const showValidationNotification = (emptyFieldCount: number): void => {
    if (emptyFieldCount === 0) return;

    const message = emptyFieldCount === 1
      ? getTextSync("notifications.fillSingleField")
      : getTextSync("notifications.fillMultipleFields", { count: emptyFieldCount });
    
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
    const paymentType = String(urlParams.get("frequency") ?? "onetime").toLowerCase();

    const formIsValid = isFormValid();
    const paramsValid = donationAmount > 0 && CONSTANTS.SUPPORTED_FREQUENCIES.includes(paymentType as any);

    donateButton.disabled = !(formIsValid && paramsValid);

    // Show/hide overlay based on form validity
    if (buttonOverlay) {
      buttonOverlay.style.display = (formIsValid && paramsValid) ? "none" : "block";
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

// Validation function for payment initiation
function validatePaymentInitiation(amount: number, type: string): { isValid: boolean; errorMessage?: string } {
  // Validate amount parameter
  if (amount <= 0) {
    return {
      isValid: false,
      errorMessage: getTextSync("errors.invalidAmountValue")
    };
  }

  // Validate frequency parameter
  if (!CONSTANTS.SUPPORTED_FREQUENCIES.includes(type as any)) {
    return {
      isValid: false,
      errorMessage: getTextSync("errors.invalidFrequencyValue")
    };
  }

  // Validate form fields
  if (typeof (window as any).isFormValid === 'function' && !(window as any).isFormValid()) {
    if (typeof (window as any).checkEmptyFields === 'function') {
      (window as any).checkEmptyFields();
    }
    return {
      isValid: false,
      errorMessage: getTextSync("errors.fillRequiredFields")
    };
  }

  return { isValid: true };
}

// Function to collect form data from DOM elements
function getFormData(amount: number, type: string): PaymentFormData {
  return {
    name: (document.getElementById("name") as HTMLInputElement).value.trim(),
    email: (document.getElementById("email") as HTMLInputElement).value.trim(),
    phone: (document.getElementById("phone") as HTMLInputElement).value.trim(),
    country: (document.getElementById("country") as HTMLInputElement).value.trim(),
    city: (document.getElementById("city") as HTMLInputElement).value.trim(),
    zipcode: (document.getElementById("zipcode") as HTMLInputElement).value.trim(),
    address: (document.getElementById("address") as HTMLInputElement).value.trim(),
    notes: {
      additional_notes: (document.getElementById("notes") as HTMLTextAreaElement)?.value?.trim() || "",
      city: (document.getElementById("city") as HTMLInputElement).value.trim(),
      zipcode: (document.getElementById("zipcode") as HTMLInputElement).value.trim(),
      address: (document.getElementById("address") as HTMLInputElement).value.trim(),
    },
    amount: amount * 100, // Convert to paise
    currency: "INR",
    frequency: type,
  };
}



// Enhanced error handling
const handlePaymentError = (error: any): void => {
  let errorMessage = getTextSync("errors.paymentFailed");
  
  if (error.message?.includes("connect")) {
    errorMessage = getTextSync("errors.connectionError");
  } else if (error.message?.includes("Invalid")) {
    errorMessage = error.message;
  } else if (error.message) {
    errorMessage = error.message;
  }

  showNotification(errorMessage, 'error');
};

// Initialize the support form when DOM is ready
const initializeWhenReady = (): void => {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeSupportForm);
  } else {
    initializeSupportForm();
  }
};

initializeWhenReady(); 