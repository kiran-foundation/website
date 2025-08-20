/**
 * Validation Module
 * Handles all validation logic and form data collection.
 * Provides comprehensive input validation and DOM element interaction.
 */

import { getTextSync } from "../textLoader";
import { PAYMENT_CONSTANTS } from "./types";
import type {
  PaymentFormData,
  PaymentValidationResult,
} from "../../types/payment";

/**
 * Validates payment initiation parameters
 * @param amount - Payment amount to validate
 * @param type - Payment frequency type to validate
 * @returns Validation result with error message if invalid
 */
export const validatePaymentInitiation = (
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

/**
 * Collects form data from DOM elements and prepares it for payment processing
 * @param amount - Payment amount in rupees (will be converted to paise)
 * @param type - Payment frequency type
 * @returns PaymentFormData object with all form fields
 */
export const getFormData = (amount: number, type: string): PaymentFormData => {
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
