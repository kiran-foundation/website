export {};
import { CONFIG,PREDEFINED_PLANS } from './config';
// Global types for TypeScript in browser
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
    type === 'error' ? 'bg-red-500 text-white' :
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
    console.error(`API call failed for ${endpoint}:`, error);
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Unable to connect to payment server. Please check your connection.');
    }
    
    throw error;
  }
};

const getRazorpayKey = async (): Promise<string> => {
  try {
    const response = await apiCall('/razorpay-key');
    return response.data?.key || CONFIG.RAZORPAY_KEY;
  } catch (error) {
    console.warn('Failed to fetch Razorpay key from backend, using default');
    return CONFIG.RAZORPAY_KEY;
  }
};

// Function to get or create plan
const getOrCreatePlan = (amount: number, frequency: string): string | null => {
  const amountInRupees = Math.floor(amount / 100);
  
  if (frequency === 'onetime') return null;
  
  // Check if predefined plan exists
  const plans = PREDEFINED_PLANS[frequency as keyof typeof PREDEFINED_PLANS];
  if (plans && plans[amountInRupees as keyof typeof plans]) {
    return plans[amountInRupees as keyof typeof plans];
  }
  
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
    
    console.log('Data successfully submitted to Google Form');
  } catch (error) {
    console.error('Failed to submit to Google Form:', error);
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
    console.error('Payment verification failed:', error);
    return false;
  }
};

export function initializeSupportForm(): void {
  const urlParams = new URLSearchParams(window.location.search);
  console.log("URL Params:", urlParams.toString());
  
  const donationAmount = Number(urlParams.get("amount") ?? "0");
  const paymentType = String(urlParams.get("frequency") ?? "onetime").toLowerCase();

  // Validate parameters
  if (donationAmount <= 0) {
    showNotification('Invalid donation amount specified', 'error');
    return;
  }

  if (!['onetime', 'monthly', 'yearly'].includes(paymentType)) {
    showNotification('Invalid payment frequency specified', 'error');
    return;
  }

  // Update display elements
  const amountDisplay = document.getElementById("amountToDisplay") as HTMLDivElement;
  const frequencyDisplay = document.getElementById("toBeDisplay") as HTMLDivElement;

  if (amountDisplay) amountDisplay.innerHTML = `₹${donationAmount.toLocaleString()}`;
  if (frequencyDisplay) {
    frequencyDisplay.innerHTML = 
      paymentType === "monthly" ? "per month" :
      paymentType === "yearly" ? "per year" : "One Time";
  }

  setupFormValidation();

  const donateButton = document.getElementById("donate-now-button") as HTMLButtonElement;
  if (donateButton) {
    donateButton.addEventListener("click", (e) => {
      e.preventDefault();
      initiatePayment(donationAmount, paymentType);
    });
  }
}

function setupFormValidation(): void {
  const form = document.getElementById("donation-form") as HTMLFormElement;
  const donateButton = document.getElementById("donate-now-button") as HTMLButtonElement;
  
  if (!form || !donateButton) {
    console.error('Form or donate button not found');
    return;
  }

  donateButton.disabled = true;

  const fields: Record<string, FormFieldConfig> = {
    name: {
      validate: (v) => /^[a-zA-Z\s]{2,50}$/.test(v.trim()),
      errorText: "Name must be 2-50 characters (letters and spaces only)",
      emptyText: "Name is required",
    },
    email: {
      validate: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) && v.length <= 100,
      errorText: "Please enter a valid email address",
      emptyText: "Email is required",
    },
    phone: {
      validate: (v) => /^\+?[1-9][0-9]{7,14}$/.test(v.replace(/[\s\-()]/g, "")),
      errorText: "Phone must be 8-15 digits with optional country code",
      emptyText: "Phone number is required",
    },
    country: {
      validate: (v) => v.trim().length >= 2 && v.trim().length <= 50,
      errorText: "Country name must be 2-50 characters",
      emptyText: "Country is required",
    },
    address: {
      validate: (v) => v.trim().length >= 5 && v.trim().length <= 200,
      errorText: "Address must be 5-200 characters",
      emptyText: "Address is required",
    },
    city: {
      validate: (v) => v.trim().length >= 2 && v.trim().length <= 50,
      errorText: "City name must be 2-50 characters",
      emptyText: "City is required",
    },
    zipcode: {
      validate: (v) => /^\d{5,10}$/.test(v.replace(/[\s\-]/g, "")),
      errorText: "Pin/Zip code must be 5-10 digits",
      emptyText: "Pin/Zip code is required",
    },
  };

  const validateForm = (): boolean => {
    const isValid = Object.entries(fields).every(([id, cfg]) => {
      const element = document.getElementById(id) as HTMLInputElement;
      const val = element?.value.trim() || "";
      return cfg.validate(val);
    });
    
    donateButton.disabled = !isValid;
    return isValid;
  };

  const showError = (id: string, message: string): void => {
    const el = document.getElementById(id) as HTMLInputElement;
    if (!el) return;

    el.classList.add("error");
    el.style.borderColor = "#D33C0D";

    // Remove existing error message
    const existingError = el.parentNode?.querySelector(".form-error");
    if (existingError) {
      existingError.remove();
    }

    // Add new error message
    const error = document.createElement("div");
    error.className = "form-error text-[#D33C0D] text-sm mt-1";
    error.textContent = message;
    el.parentNode?.insertBefore(error, el.nextSibling);
  };

  const clearError = (id: string): void => {
    const el = document.getElementById(id) as HTMLInputElement;
    if (!el) return;

    el.classList.remove("error");
    el.style.borderColor = "";

    const error = el.parentNode?.querySelector(".form-error");
    if (error) error.remove();
  };

  const clearAllErrors = (): void => {
    Object.keys(fields).forEach(id => clearError(id));
  };

  // Set up event listeners
  Object.keys(fields).forEach((id) => {
    const el = document.getElementById(id) as HTMLInputElement;
    if (!el) return;

    el.addEventListener("input", () => {
      validateForm();
      clearError(id);
    });

    el.addEventListener("blur", () => {
      const val = el.value.trim();
      if (!val) {
        showError(id, fields[id].emptyText);
      } else if (!fields[id].validate(val)) {
        showError(id, fields[id].errorText);
      }
    });
  });

  // Initial validation
  validateForm();

  // Store validation functions for external use
  (window as any).validateForm = validateForm;
  (window as any).clearAllErrors = clearAllErrors;
}

async function initiatePayment(amount: number, type: string): Promise<void> {
  const form = document.getElementById("donation-form") as HTMLFormElement;
  
  // Validate form before proceeding
  if (typeof (window as any).validateForm === 'function' && !(window as any).validateForm()) {
    showNotification("Please fill in all required fields correctly.", 'error');
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
    }

    // Get Razorpay key
    const razorpayKey = await getRazorpayKey();

    // Determine endpoint and make API call
    const endpoint = type === "onetime" ? "/create-order" : "/create-subscription";
    console.log(`Initiating ${type} payment:`, { amount: formData.amount, type, existingPlanId });

    const response = await apiCall(endpoint, {
      method: 'POST',
      body: JSON.stringify(formData),
    });

    if (!response.success) {
      throw new Error(response.message || 'Payment creation failed');
    }

    // Check if Razorpay SDK is loaded
    if (typeof window.Razorpay === "undefined") {
      throw new Error("Razorpay SDK not loaded. Please refresh the page and try again.");
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
              throw new Error("Payment verification failed");
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
            type === "onetime" ? "Payment successful! Thank you for your donation." : 
            "Subscription activated! Thank you for your ongoing support.",
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
          console.error('Post-payment processing failed:', error);
          showNotification(
            'Payment completed but there was an issue with confirmation. Please contact support.',
            'error'
          );
        } finally {
          showLoader(false);
        }
      },
      modal: {
        ondismiss: function () {
          console.log("Payment modal closed by user");
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
      throw new Error("Invalid response from payment server");
    }

    console.log("Opening Razorpay with options:", options);

    // Open Razorpay checkout
    const razorpay = new window.Razorpay(options);
    razorpay.open();

  } catch (error: any) {
    console.error("Payment initiation failed:", error);
    
    let errorMessage = "Payment failed. Please try again.";
    if (error.message.includes("connect")) {
      errorMessage = "Unable to connect to payment server. Please check your connection.";
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