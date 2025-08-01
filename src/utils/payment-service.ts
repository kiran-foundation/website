import { CONFIG } from "./config";
import { getTextSync } from "./textLoader";

// Global types for TypeScript in browser
declare global {
  interface Window {
    Razorpay: any;
  }
}

export interface PaymentFormData {
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

export interface RazorpayResponse {
  razorpay_payment_id?: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
  razorpay_subscription_id?: string;
}

interface ApiResponse {
  success: boolean;
  data?: any;
  message?: string;
  error?: string;
}

// Utility functions that payment service needs
const showLoader = (show: boolean) => {
  const loader = document.getElementById("payment-loader");
  if (loader) {
    loader.style.display = show ? "block" : "none";
  }
};

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

// API helper function
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

      let errorData: { message?: string };
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

// Get Razorpay key from backend
export const getRazorpayKey = async (): Promise<string> => {
  // Check if current domain is production domain
  const currentDomain = window.location.origin;
  const isProduction = currentDomain === "https://kiran.foundation";
  // const isProduction=true;
  // If not production domain, use test key from config
  if (!isProduction) {
    console.log(
      "Using test Razorpay key for non-production domain:",
      currentDomain
    );
    return CONFIG.RAZORPAY_KEY;
  }

  try {
    console.log("Fetching Razorpay key from backend...");
    const response = await fetch(`${CONFIG.API_BASE_URL}/razorpay-key`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    console.log("Razorpay key response status:", response.status);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Failed to fetch Razorpay key`);
    }

    const data = await response.json();
    console.log("Razorpay key response data:", data);

    if (data.key) {
      console.log("Successfully fetched Razorpay key from backend");
      return data.key;
    } else {
      throw new Error("No key found in backend response");
    }
  } catch (error: any) {
    console.error("Failed to fetch Razorpay key from backend:", error);
    throw new Error(`Unable to fetch Razorpay key: ${error.message}`);
  }
};

// Function to get or create plan - simplified to always let backend handle plan creation
export const getOrCreatePlan = (
  amount: number,
  frequency: string
): string | null => {
  // For one-time payments, no plan is needed
  if (frequency === "onetime") return null;

  // For all subscription payments, let the backend create plans dynamically
  // This aligns with the backend's design which creates plans for any amount/frequency
  return null;
};

// Posts data to the Google Form
export const postToGoogleForm = async ({
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
    const url =
      "https://docs.google.com/forms/d/e/1FAIpQLSedxSOPskuroSb3hJSAjVebGa1EoW1OeYjx2WHE1Um5g4iipQ/formResponse";

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
export const verifyPayment = async (
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

// Main payment initiation function
export async function initiatePayment(
  amount: number,
  type: string
): Promise<void> {
  // Validate amount and frequency parameters first
  if (amount <= 0) {
    showNotification(getTextSync("errors.invalidAmountValue"), "error");
    return;
  }

  if (!["onetime", "monthly", "yearly"].includes(type)) {
    showNotification(getTextSync("errors.invalidFrequencyValue"), "error");
    return;
  }

  // Validate form before proceeding
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

  showLoader(true);

  try {
    // Get form data
    const formData: PaymentFormData = {
      name: (document.getElementById("name") as HTMLInputElement).value.trim(),
      email: (
        document.getElementById("email") as HTMLInputElement
      ).value.trim(),
      phone: (
        document.getElementById("phone") as HTMLInputElement
      ).value.trim(),
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
        city: (
          document.getElementById("city") as HTMLInputElement
        ).value.trim(),
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

    // Let the backend handle all plan creation dynamically
    // No need to set plan_id as the backend creates plans based on amount and frequency

    // Get Razorpay key - this MUST succeed
    let razorpayKey: string;
    try {
      razorpayKey = await getRazorpayKey();
    } catch (error) {
      showNotification(
        "Unable to connect to payment service. Please try again later.",
        "error"
      );
      return;
    }

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
      name: CONFIG.COMPANY_NAME,
      description:
        type === "onetime"
          ? "Donation"
          : `${type.charAt(0).toUpperCase() + type.slice(1)} Subscription`,
      image: CONFIG.COMPANY_LOGO,
      handler: async (razorpayResponse: RazorpayResponse) => {
        showLoader(true);
        try {
          // Verify payment for one-time payments
          if (type === "onetime") {
            const isVerified = await verifyPayment(razorpayResponse);
            if (!isVerified) {
              // Redirect to unsuccessful page with verification error
              const errorParams = new URLSearchParams({
                error: "verification_failed",
                message: "Payment verification failed",
                txnId: razorpayResponse.razorpay_payment_id || "N/A",
                amount: amount.toString(),
              });
              window.location.href = `/support-us/unsuccessful?${errorParams.toString()}`;
              return;
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

          // Redirect to success page with transaction details
          const successParams = new URLSearchParams({
            amount: amount.toString(),
            txnId:
              razorpayResponse.razorpay_payment_id ||
              razorpayResponse.razorpay_subscription_id ||
              "N/A",
            type: type,
          });
          window.location.href = `/support-us/confirmation?${successParams.toString()}`;
        } catch (error: any) {
          console.error("Post-payment error:", error);

          // Redirect to unsuccessful page with error details
          const errorParams = new URLSearchParams({
            error: "server_error",
            message: error.message || "An error occurred after payment",
            txnId:
              razorpayResponse.razorpay_payment_id ||
              razorpayResponse.razorpay_subscription_id ||
              "N/A",
            amount: amount.toString(),
          });
          window.location.href = `/support-us/unsuccessful?${errorParams.toString()}`;
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

    // Add error handler for payment failures
    options.modal.ondismiss = function () {
      showLoader(false);
      // User closed the payment modal - this is not necessarily an error
      console.log("Payment modal dismissed by user");
    };

    // Open Razorpay checkout
    const razorpay = new window.Razorpay(options);
    razorpay.on("payment.failed", function (response: any) {
      console.error("Payment failed:", response.error);

      // Redirect to unsuccessful page with payment failure details
      const errorParams = new URLSearchParams({
        error: "payment_failed",
        message: response.error.description || "Payment was declined",
        txnId: response.error.metadata?.payment_id || "N/A",
        amount: amount.toString(),
      });
      window.location.href = `/support-us/unsuccessful?${errorParams.toString()}`;
    });

    razorpay.open();
  } catch (error: any) {
    console.error("Payment initiation error:", error);

    // Determine error type and redirect to unsuccessful page
    let errorType = "unknown";
    let errorMessage = error.message || "An unexpected error occurred";

    if (
      error.message.includes("connect") ||
      error.message.includes("network")
    ) {
      errorType = "network_error";
      errorMessage =
        "Network connection error. Please check your internet connection.";
    } else if (
      error.message.includes("server") ||
      error.message.includes("HTTP")
    ) {
      errorType = "server_error";
      errorMessage = "Server error occurred. Please try again later.";
    } else if (error.message.includes("Razorpay")) {
      errorType = "razorpay_error";
      errorMessage = "Payment gateway error. Please try again.";
    } else if (error.message.includes("Razorpay")) {
      errorType = "razorpay_error";
      errorMessage = "Payment gateway error. Please try again.";
    }

    // Redirect to unsuccessful page
    const errorParams = new URLSearchParams({
      error: errorType,
      message: errorMessage,
      txnId: "N/A",
      amount: amount.toString(),
    });
    window.location.href = `/support-us/unsuccessful?${errorParams.toString()}`;
  } finally {
    showLoader(false);
  }
}