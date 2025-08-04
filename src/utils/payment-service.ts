import { SUPPORT_US_CONFIG } from "./config";
import { getTextSync } from "./textLoader";
import type {
  PaymentFormData,
  ApiResponse,
  RazorpayResponse,
  PaymentValidationResult,
} from "../types/payment";

declare global {
  interface Window {
    Razorpay: any;
  }
}

// Payment service constants
const PAYMENT_CONSTANTS = {
  SUPPORTED_FREQUENCIES: ["onetime", "monthly", "yearly"] as const,
  FORM_RESET_DELAY: 100,
} as const;

// Google Form data interface
interface GoogleFormData {
  fullName: string;
  email: string;
  number: string;
  country: string;
  address: string;
  city: string;
  pincode: string;
  notes: string;
  donationDetails: string;
}

// Payment result interface
interface PaymentResult {
  success: boolean;
  paymentId?: string;
  subscriptionId?: string;
  error?: string;
}

// Export the payment service interface
export interface PaymentService {
  initiatePayment(
    amount: number,
    type: string,
    formData: PaymentFormData
  ): Promise<void>;
  verifyPayment(paymentData: RazorpayResponse): Promise<boolean>;
  getRazorpayKey(): Promise<string>;
  submitToGoogleForm(data: GoogleFormData): Promise<void>;
}

// Export types for external use
export type { GoogleFormData, PaymentResult };
export { PAYMENT_CONSTANTS };

// API helper functions
const apiCall = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse> => {
  const url = `${SUPPORT_US_CONFIG.API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || `HTTP ${response.status}: Request failed`
      );
    }
    return data;
  } catch (error) {
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error(getTextSync("errors.connectionError"));
    }
    throw error;
  }
};

const getRazorpayKey = async (): Promise<string> => {
  try {
    const response = await apiCall("/razorpay-key");
    return response.data?.key || SUPPORT_US_CONFIG.RAZORPAY_KEY;
  } catch (error) {
    return SUPPORT_US_CONFIG.RAZORPAY_KEY;
  }
};
const getOrCreatePlan = (amount: number, frequency: string): string | null => {
  if (frequency === "onetime") return null;
  const subscriptionFrequencies =
    PAYMENT_CONSTANTS.SUPPORTED_FREQUENCIES.filter((f) => f !== "onetime");
  if (!subscriptionFrequencies.includes(frequency as any)) {
    return null;
  }

  const plans =
    SUPPORT_US_CONFIG.PREDEFINED_PLANS[
      frequency as keyof typeof SUPPORT_US_CONFIG.PREDEFINED_PLANS
    ];

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
}: GoogleFormData): Promise<void> => {
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
    formData.append(
      SUPPORT_US_CONFIG.GOOGLE_FORM.ENTRIES.DONATION_DETAILS,
      donationDetails
    );

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
const verifyPayment = async (
  paymentData: RazorpayResponse
): Promise<boolean> => {
  if (
    !paymentData.razorpay_payment_id ||
    !paymentData.razorpay_order_id ||
    !paymentData.razorpay_signature
  ) {
    return false;
  }

  try {
    const response = await apiCall("/verify-payment", {
      method: "POST",
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
const initiatePayment = async (
  amount: number,
  type: string,
  formData: PaymentFormData,
  callbacks: {
    showLoader: (show: boolean) => void;
    showNotification: (
      message: string,
      type: "success" | "error" | "info"
    ) => void;
    onSuccess: () => void;
  }
): Promise<void> => {
  callbacks.showLoader(true);

  try {
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
    const endpoint =
      type === "onetime" ? "/create-order" : "/create-subscription";

    const response = await apiCall(endpoint, {
      method: "POST",
      body: JSON.stringify(formData),
    });

    if (!response.success) {
      throw new Error(
        response.message || getTextSync("errors.paymentCreationFailed")
      );
    }

    // Check if Razorpay SDK is loaded
    if (typeof window.Razorpay === "undefined") {
      throw new Error(getTextSync("errors.razorpayNotLoaded"));
    }

    // Prepare Razorpay options
    const options: any = {
      key: razorpayKey,
      amount: formData.amount,
      currency: "INR",
      name: SUPPORT_US_CONFIG.COMPANY_NAME,
      description:
        type === "onetime"
          ? "Donation"
          : `${type.charAt(0).toUpperCase() + type.slice(1)} Subscription`,
      image: SUPPORT_US_CONFIG.COMPANY_LOGO,
      handler: async (razorpayResponse: RazorpayResponse) => {
        callbacks.showLoader(true);
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
            razorpayResponse.razorpay_payment_id ||
            razorpayResponse.razorpay_subscription_id ||
            "N/A"
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

          callbacks.showNotification(
            type === "onetime"
              ? getTextSync("success.paymentSuccess")
              : getTextSync("success.subscriptionSuccess"),
            "success"
          );

          // Call success callback
          callbacks.onSuccess();
        } catch (error) {
          callbacks.showNotification(
            getTextSync("errors.postPaymentIssue"),
            "error"
          );
        } finally {
          callbacks.showLoader(false);
        }
      },
      modal: {
        ondismiss: function () {
          callbacks.showLoader(false);
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
    handlePaymentError(error, callbacks.showNotification);
  } finally {
    callbacks.showLoader(false);
  }
};
// Validation function for payment initiation
const validatePaymentInitiation = (
  amount: number,
  type: string
): PaymentValidationResult => {
  // Validate amount parameter
  if (amount <= 0) {
    return {
      isValid: false,
      errorMessage: getTextSync("errors.invalidAmountValue"),
    };
  }

  // Validate frequency parameter
  if (!PAYMENT_CONSTANTS.SUPPORTED_FREQUENCIES.includes(type as any)) {
    return {
      isValid: false,
      errorMessage: getTextSync("errors.invalidFrequencyValue"),
    };
  }

  return { isValid: true };
};

// Function to collect form data from DOM elements
const getFormData = (amount: number, type: string): PaymentFormData => {
  return {
    name: (document.getElementById("name") as HTMLInputElement).value.trim(),
    email: (document.getElementById("email") as HTMLInputElement).value.trim(),
    phone: (document.getElementById("phone") as HTMLInputElement).value.trim(),
    country: (
      document.getElementById("country") as HTMLInputElement
    ).value.trim(),
    city: (document.getElementById("city") as HTMLInputElement).value.trim(),
    zipcode: (
      document.getElementById("zipcode") as HTMLInputElement
    ).value.trim(),
    address: (
      document.getElementById("address") as HTMLInputElement
    ).value.trim(),
    notes: {
      additional_notes:
        (
          document.getElementById("notes") as HTMLTextAreaElement
        )?.value?.trim() || "",
      city: (document.getElementById("city") as HTMLInputElement).value.trim(),
      zipcode: (
        document.getElementById("zipcode") as HTMLInputElement
      ).value.trim(),
      address: (
        document.getElementById("address") as HTMLInputElement
      ).value.trim(),
    },
    amount: amount * 100, // Convert to paise
    currency: "INR",
    frequency: type,
  };
};

// Enhanced error handling
const handlePaymentError = (
  error: any,
  showNotification: (message: string, type: "error") => void
): void => {
  let errorMessage = getTextSync("errors.paymentFailed");

  if (error.message?.includes("connect")) {
    errorMessage = getTextSync("errors.connectionError");
  } else if (error.message?.includes("Invalid")) {
    errorMessage = error.message;
  } else if (error.message) {
    errorMessage = error.message;
  }

  showNotification(errorMessage, "error");
};
// Main payment service object with clean interface
export const PaymentService = {
  initiatePayment,
  verifyPayment,
  getRazorpayKey,
  submitToGoogleForm: postToGoogleForm,
  validatePaymentInitiation,
  getFormData,
  handlePaymentError,
  getOrCreatePlan,
  apiCall,
};

// Export individual functions for direct use
export {
  initiatePayment,
  verifyPayment,
  getRazorpayKey,
  postToGoogleForm as submitToGoogleForm,
  validatePaymentInitiation,
  getFormData,
  handlePaymentError,
  getOrCreatePlan,
  apiCall,
};
