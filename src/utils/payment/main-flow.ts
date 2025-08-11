/**
 * Main Payment Flow Module
 * Main payment initiation function that orchestrates the entire payment process.
 * Handles both one-time payments and subscription payments with comprehensive error handling.
 */

import { getTextSync } from "../textLoader";
import { type PaymentCallbacks } from "./types";
import { apiCall, getRazorpayKey } from "./api";
import { getOrCreatePlan, createRazorpayOptions } from "./razorpay";
import { calculateTotalCount, validateDuration } from "./utilities";
import { handlePaymentError, createErrorRedirectUrl } from "./error-handling";
import type { PaymentFormData, ApiResponse } from "../../types/payment";

declare global {
  interface Window {
    Razorpay: any;
  }
}

/**
 * Prepares form data for payment processing by adding plan and subscription details
 * @param formData - Base form data to enhance
 * @param type - Payment type
 * @returns Enhanced form data ready for API submission
 */
export const preparePaymentData = (
  formData: PaymentFormData,
  type: string
): PaymentFormData => {
  // Check for existing plan or prepare for new plan creation
  const existingPlanId = getOrCreatePlan(formData.amount, type);
  if (existingPlanId) {
    formData.plan_id = existingPlanId;
  }

  // Add total_count parameter for subscriptions
  if (type !== "onetime") {
    const selectedDuration = (formData as any).selectedDuration || 5;
    const validDuration = validateDuration(selectedDuration);
    (formData as any).total_count = calculateTotalCount(type, validDuration);

    // Add original duration for backend reference (especially for yearly subscriptions)
    (formData as any).duration_years = validDuration;
  }

  return formData;
};

/**
 * Creates and submits payment order/subscription to the backend
 * @param formData - Prepared payment form data
 * @param type - Payment type
 * @returns API response containing order/subscription details
 */
export const createPaymentOrder = async (
  formData: PaymentFormData,
  type: string
): Promise<ApiResponse> => {
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

  return response;
};

/**
 * Validates Razorpay SDK availability and throws error if not loaded
 * @throws Error if Razorpay SDK is not available
 */
export const validateRazorpaySDK = (): void => {
  if (typeof window.Razorpay === "undefined") {
    throw new Error(getTextSync("errors.razorpayNotLoaded"));
  }
};

/**
 * Initiates payment process with comprehensive error handling and user feedback
 * @param amount - Payment amount in rupees
 * @param type - Payment type ("onetime", "monthly", "yearly")
 * @param formData - Payment form data
 * @param callbacks - UI callback functions for loader, notifications, and success
 * @returns Promise that resolves when payment process is initiated
 */
export const initiatePayment = async (
  amount: number,
  type: string,
  formData: PaymentFormData,
  callbacks: PaymentCallbacks
): Promise<void> => {
  callbacks.showLoader(true);

  try {
    // Prepare payment data with plan and subscription details
    const preparedFormData = preparePaymentData(formData, type);

    // Get Razorpay key from backend
    const razorpayKey = await getRazorpayKey();

    // Create payment order/subscription
    const response = await createPaymentOrder(preparedFormData, type);

    // Validate Razorpay SDK availability
    validateRazorpaySDK();

    // Create Razorpay options and initialize payment
    const options = createRazorpayOptions(
      preparedFormData,
      type,
      razorpayKey,
      response,
      amount,
      callbacks
    );

    // Open Razorpay checkout
    const razorpay = new window.Razorpay(options);
    razorpay.open();
  } catch (error: any) {
    handlePaymentError(error, callbacks.showNotification);

    // Redirect to unsuccessful page for payment initiation errors
    const unsuccessfulUrl = createErrorRedirectUrl(
      amount,
      type,
      "payment_failed"
    );

    // Small delay to ensure user sees the error message
    setTimeout(() => {
      window.location.href = unsuccessfulUrl;
    }, 200);
  } finally {
    callbacks.showLoader(false);
  }
};
