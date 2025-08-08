/**
 * Razorpay Module
 * Manages all Razorpay-specific operations including plan management,
 * payment options creation, and success/failure handling.
 */

import { SUPPORT_US_CONFIG } from "../config";
import { getTextSync } from "../textLoader";
import { PAYMENT_CONSTANTS, type PaymentCallbacks } from "./types";
import { formatPaymentDescription, createRedirectUrl } from "./utilities";
import { createDonationDetails, submitToGoogleForm } from "./google-forms";
import { apiCall } from "./api";
import type {
  PaymentFormData,
  ApiResponse,
  RazorpayResponse,
} from "../../types/payment";

/**
 * Retrieves existing plan ID or indicates that a new plan needs to be created
 * @param amount - Payment amount in paise
 * @param frequency - Payment frequency ("onetime", "monthly", "yearly")
 * @returns Plan ID if exists, null if new plan needed or for one-time payments
 */
export const getOrCreatePlan = (
  amount: number,
  frequency: string
): string | null => {
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

/**
 * Creates Razorpay options object for payment initialization
 * @param formData - Payment form data
 * @param type - Payment type ("onetime", "monthly", "yearly")
 * @param razorpayKey - Razorpay API key
 * @param response - API response containing order/subscription ID
 * @param amount - Payment amount for display
 * @param callbacks - UI callback functions
 * @returns Razorpay options object
 */
export const createRazorpayOptions = (
  formData: PaymentFormData,
  type: string,
  razorpayKey: string,
  response: ApiResponse,
  amount: number,
  callbacks: PaymentCallbacks
): any => {
  const options: any = {
    key: razorpayKey,
    amount: formData.amount,
    currency: "INR",
    name: SUPPORT_US_CONFIG.COMPANY_NAME,
    description: formatPaymentDescription(type),
    image: SUPPORT_US_CONFIG.COMPANY_LOGO,
    handler: async (razorpayResponse: RazorpayResponse) => {
      await handleRazorpaySuccess(
        razorpayResponse,
        formData,
        type,
        amount,
        callbacks
      );
    },
    modal: {
      ondismiss: () => handleRazorpayDismiss(amount, type, callbacks),
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

  return options;
};

/**
 * Handles successful Razorpay payment response
 * @param razorpayResponse - Response from Razorpay
 * @param formData - Original form data
 * @param type - Payment type
 * @param amount - Payment amount
 * @param callbacks - UI callback functions
 */
export const handleRazorpaySuccess = async (
  razorpayResponse: RazorpayResponse,
  formData: PaymentFormData,
  type: string,
  amount: number,
  callbacks: PaymentCallbacks
): Promise<void> => {
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
    const selectedDuration = (formData as any).selectedDuration || 5;
    const donationDetails = createDonationDetails(
      amount,
      type,
      razorpayResponse.razorpay_payment_id ||
        razorpayResponse.razorpay_subscription_id ||
        "N/A",
      selectedDuration
    );

    await submitToGoogleForm({
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

    // Show success notification
    callbacks.showNotification(
      type === "onetime"
        ? getTextSync("success.paymentSuccess")
        : getTextSync("success.subscriptionSuccess"),
      "success"
    );

    // Redirect to confirmation page
    const paymentId =
      razorpayResponse.razorpay_payment_id ||
      razorpayResponse.razorpay_subscription_id ||
      "N/A";

    const confirmationUrl = createRedirectUrl("confirmation", {
      amount,
      type,
      txnId: paymentId,
    });

    // Small delay to ensure user sees the success message
    setTimeout(() => {
      window.location.href = confirmationUrl;
    }, 1500);

    // Call success callback
    callbacks.onSuccess();
  } catch (error) {
    callbacks.showNotification(getTextSync("errors.postPaymentIssue"), "error");

    // Redirect to unsuccessful page
    const paymentId =
      razorpayResponse.razorpay_payment_id ||
      razorpayResponse.razorpay_subscription_id ||
      "N/A";

    const unsuccessfulUrl = createRedirectUrl("unsuccessful", {
      amount,
      type,
      txnId: paymentId,
      reason: "verification_failed",
    });

    // Small delay to ensure user sees the error message
    setTimeout(() => {
      window.location.href = unsuccessfulUrl;
    }, 2000);
  } finally {
    callbacks.showLoader(false);
  }
};

/**
 * Handles Razorpay modal dismissal (user cancellation)
 * @param amount - Payment amount
 * @param type - Payment type
 * @param callbacks - UI callback functions
 */
export const handleRazorpayDismiss = (
  amount: number,
  type: string,
  callbacks: PaymentCallbacks
): void => {
  callbacks.showLoader(false);

  // Redirect to unsuccessful page when payment is dismissed
  const unsuccessfulUrl = createRedirectUrl("unsuccessful", {
    amount,
    type,
    txnId: "N/A",
    reason: "payment_cancelled",
  });

  // Small delay before redirect
  setTimeout(() => {
    window.location.href = unsuccessfulUrl;
  }, 1000);
};

/**
 * Verifies payment with the backend server
 * @param paymentData - Razorpay payment response data
 * @returns Promise resolving to verification result
 */
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
