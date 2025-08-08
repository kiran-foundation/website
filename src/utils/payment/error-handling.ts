/**
 * Error Handling Module
 * Centralized error management and user feedback system.
 * Provides consistent error categorization and graceful failure handling.
 */

import { getTextSync } from "../textLoader";

/**
 * Creates appropriate error message based on error type and context
 * @param error - Error object to analyze
 * @returns Localized, user-friendly error message
 */
export const createErrorMessage = (error: any): string => {
  let errorMessage = getTextSync("errors.paymentFailed");

  if (error.message?.includes("connect")) {
    errorMessage = getTextSync("errors.connectionError");
  } else if (error.message?.includes("Invalid")) {
    errorMessage = error.message;
  } else if (error.message) {
    errorMessage = error.message;
  }

  return errorMessage;
};

/**
 * Handles payment errors with consistent user feedback and logging
 * @param error - Error object to handle
 * @param showNotification - Callback function to display notifications
 */
export const handlePaymentError = (
  error: any,
  showNotification: (message: string, type: "error") => void
): void => {
  const errorMessage = createErrorMessage(error);
  showNotification(errorMessage, "error");
};

/**
 * Creates redirect URL for error scenarios
 * @param amount - Payment amount
 * @param type - Payment type
 * @param reason - Error reason code
 * @returns Formatted redirect URL
 */
export const createErrorRedirectUrl = (
  amount: number,
  type: string,
  reason: string
): string => {
  return `/support-us/unsuccessful/?amount=${amount}&type=${type}&txnId=N/A&reason=${reason}`;
};
