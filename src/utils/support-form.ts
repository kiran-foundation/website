export {};
import { CONFIG ,getEnvironment} from './config';
import { initializeTextLoader, getTextSync } from './textLoader';
// Global types for TypeScript in browser

console.log(getEnvironment());
declare global {
  interface Window {
    Razorpay: any;
  }
}

interface FormFieldConfig {
  validate: (value: string) => boolean;
  errorText: string;
  emptyText: string;
}

interface PaymentFormData {
  name: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  zipcode: string;
  address: string;
  notes: {
    additional_notes: string;
    city: string;
    zipcode: string;
    address: string;
  };
  amount: number;
  currency: string;
  frequency?: string;
  plan_id?: string;
}

interface ApiResponse {
  success: boolean;
  data?: any;
  message?: string;
  error?: string;
}

interface RazorpayResponse {
  razorpay_payment_id?: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
  razorpay_subscription_id?: string;
}

// Configuration




// Utility functions
const showLoader = (show: boolean) => {
  const loader = document.getElementById('payment-loader');
  if (loader) {
    loader.style.display = show ? 'block' : 'none';
  }
};

const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
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

  setTimeout(() => notification.remove(), 5000);
};

// API helper functions
const apiCall = async (endpoint: string, options: RequestInit = {}): Promise<ApiResponse> => {
  const url = `${CONFIG.API_BASE_URL}${endpoint}`;
  
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
    return response.data?.key || CONFIG.RAZORPAY_KEY;
  } catch (error) {
    return CONFIG.RAZORPAY_KEY;
  }
};

// Function to get or create plan
const getOrCreatePlan = (amount: number, frequency: string): string | null => {
  const amountInRupees = Math.floor(amount / 100);
  
  if (frequency === 'onetime') return null;
  
  console.log(`Looking for predefined plan: ${frequency}, ₹${amountInRupees}`);
  
  // Check if predefined plan exists
  const plans = CONFIG.PREDEFINED_PLANS[frequency as keyof typeof CONFIG.PREDEFINED_PLANS];
  console.log(`Available plans for ${frequency}:`, plans);
  
  if (plans && plans[amountInRupees as keyof typeof plans]) {
    const planId = plans[amountInRupees as keyof typeof plans];
    console.log(`Found predefined plan: ${planId} for ₹${amountInRupees} ${frequency}`);
    return planId;
  }
  
  console.log(`No predefined plan found for ₹${amountInRupees} ${frequency}, will create dynamically`);
  // Return null to indicate a new plan needs to be created
  return null;
};

// Posts data to the Google Form
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
    const url = "https://docs.google.com/forms/d/e/1FAIpQLSedxSOPskuroSb3hJSAjVebGa1EoW1OeYjx2WHE1Um5g4iipQ/formResponse";

    const formData = new URLSearchParams();
    formData.append("entry.283978656", fullName);
    formData.append("entry.1909208105", email);
    formData.append("entry.1359110198", number);
    formData.append("entry.218344457", country);
    formData.append("entry.938609362", address);
    formData.append("entry.1458813282", city);
    formData.append("entry.726311981", pincode);
    formData.append("entry.965069241", notes);
    formData.append("entry.1357525015", donationDetails);

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

export function initializeSupportForm(): void {
  const urlParams = new URLSearchParams(window.location.search);
  
  const donationAmount = Number(urlParams.get("amount") ?? "0");
  const paymentType = String(urlParams.get("frequency") ?? "onetime").toLowerCase();

  // Check if parameters are invalid and show helper message
  const paramsInvalid = donationAmount <= 0 || !['onetime', 'monthly', 'yearly'].includes(paymentType);
  const navigationHelper = document.getElementById('navigation-helper');
  
  if (paramsInvalid && navigationHelper) {
    navigationHelper.classList.remove('hidden');
  }

  // Validate parameters - but don't return early, just show warnings
  if (donationAmount <= 0) {
    showNotification(getTextSync('errors.selectAmount'), 'error');
  }

  if (!['onetime', 'monthly', 'yearly'].includes(paymentType)) {
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
    if (['onetime', 'monthly', 'yearly'].includes(paymentType)) {
      frequencyDisplay.innerHTML = 
        paymentType === "monthly" ? getTextSync("display.perMonth") :
        paymentType === "yearly" ? getTextSync("display.perYear") : getTextSync("display.oneTime");
    } else {
      frequencyDisplay.innerHTML = getTextSync("display.selectFrequency");
      frequencyDisplay.style.color = '#999';
    }
  }

  // Disable donate button if parameters are invalid
  if (donateButton && (donationAmount <= 0 || !['onetime', 'monthly', 'yearly'].includes(paymentType))) {
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

  const showError = (id: string, message: string): void => {
    const el = document.getElementById(id) as HTMLInputElement;
    if (!el) return;

    el.classList.add("error");
    el.style.borderColor = "#992424";

    // Find the error container (either .form-error-container or create one)
    let errorContainer = el.parentNode?.querySelector(".form-error-container") as HTMLElement;
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
    
    const errorContainer = el.parentNode?.querySelector(".form-error-container") as HTMLElement;
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
      firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    
    // Show notification
    if (emptyFieldCount > 0) {
      const message = emptyFieldCount === 1 
        ? getTextSync("notifications.fillSingleField") 
        : getTextSync("notifications.fillMultipleFields", { count: emptyFieldCount });
      showNotification(message, "error");
    }
  };

  // Add blur event listeners for real-time validation
  form.addEventListener("blur", (e) => {
    const target = e.target as HTMLInputElement;
    if (target.id && fields[target.id]) {
      validateField(target.id);
    }
  }, true); // Use capture phase to catch all blur events

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
    const paymentType = String(urlParams.get("frequency") ?? "onetime").toLowerCase();
    
    const formIsValid = isFormValid();
    const paramsValid = donationAmount > 0 && ['onetime', 'monthly', 'yearly'].includes(paymentType);
    
    donateButton.disabled = !(formIsValid && paramsValid);
    
    // Show/hide overlay based on form validity
    if (buttonOverlay) {
      buttonOverlay.style.display = (formIsValid && paramsValid) ? "none" : "block";
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

async function initiatePayment(amount: number, type: string): Promise<void> {
  const form = document.getElementById("donation-form") as HTMLFormElement;
  
  // Validate amount and frequency parameters first
  if (amount <= 0) {
    showNotification(getTextSync("errors.invalidAmountValue"), 'error');
    return;
  }

  if (!['onetime', 'monthly', 'yearly'].includes(type)) {
    showNotification(getTextSync("errors.invalidFrequencyValue"), 'error');
    return;
  }
  
  // Validate form before proceeding
  if (typeof (window as any).isFormValid === 'function' && !(window as any).isFormValid()) {
    if (typeof (window as any).checkEmptyFields === 'function') {
      (window as any).checkEmptyFields();
    }
    showNotification(getTextSync("errors.fillRequiredFields"), 'error');
    return;
  }

  showLoader(true);

  try {
    // Get form data
    const formData: PaymentFormData = {
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

    // Check for existing plan or prepare for new plan creation
    const existingPlanId = getOrCreatePlan(formData.amount, type);
    if (existingPlanId) {
      formData.plan_id = existingPlanId;
      console.log("✅ Using existing plan ID:", existingPlanId);
    } else {
      console.log("❌ No existing plan found, backend will create new plan");
    }
    
    console.log("Form data being sent:", {
      amount: formData.amount,
      frequency: formData.frequency,
      plan_id: formData.plan_id || 'undefined'
    });
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
      name: CONFIG.COMPANY_NAME,
      description: type === "onetime" ? "Donation" : `${type.charAt(0).toUpperCase() + type.slice(1)} Subscription`,
      image: CONFIG.COMPANY_LOGO,
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
          const donationDetails = `Donation: ₹${amount} | Frequency: ${type} | Payment ID: ${
            razorpayResponse.razorpay_payment_id || razorpayResponse.razorpay_subscription_id || 'N/A'
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
      theme: { color: CONFIG.THEME_COLOR },
    };

    // Add order_id for one-time payments or subscription_id for subscriptions
    if (type === "onetime" && response.data.orderId) {
      options.order_id = response.data.orderId;
    } else if (type !== "onetime" && response.data.subscription_id) {
      options.subscription_id = response.data.subscription_id;
    } else {
      throw new Error(getTextSync("errors.invalidServerResponse"));
    }
    console.log("Razorpay options: ", options);
    // Open Razorpay checkout
    const razorpay = new window.Razorpay(options);
    razorpay.open();

  } catch (error: any) {
    let errorMessage = getTextSync("errors.paymentFailed");
    if (error.message.includes("connect")) {
      errorMessage = getTextSync("errors.connectionError");
    } else if (error.message.includes("Invalid")) {
      errorMessage = error.message;
    }
    
    showNotification(errorMessage, 'error');
  } finally {
    showLoader(false);
  }
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeSupportForm);
  } else {
    initializeSupportForm();
  }