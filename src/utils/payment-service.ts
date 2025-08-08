/**
 * Payment Service - Main Entry Point
 * This file acts as a barrel export, re-exporting all payment functionality
 * from the individual module files while maintaining backward compatibility.
 */

// Import all modules
import { apiCall, getRazorpayKey } from "./payment/api";
import { getOrCreatePlan, verifyPayment } from "./payment/razorpay";
import { submitToGoogleForm } from "./payment/google-forms";
import { validatePaymentInitiation, getFormData } from "./payment/validation";
import { handlePaymentError } from "./payment/error-handling";
import { initiatePayment } from "./payment/main-flow";

// Import and re-export types and constants
import type { PaymentServiceInterface } from "./payment/types";
export {
  PAYMENT_CONSTANTS,
  type GoogleFormData,
  type PaymentResult,
  type PaymentServiceInterface,
} from "./payment/types";

// Global declaration for Razorpay
declare global {
  interface Window {
    Razorpay: any;
  }
}

/**
 * Main payment service object with clean interface
 * Provides all payment-related functionality through a single service object
 */
export const PaymentService = {
  initiatePayment,
  verifyPayment,
  getRazorpayKey,
  submitToGoogleForm,
  validatePaymentInitiation,
  getFormData,
  handlePaymentError,
  getOrCreatePlan,
  apiCall,
};

// Export PaymentService interface for backward compatibility
export type PaymentService = PaymentServiceInterface;

/**
 * Individual function exports for direct use
 * Maintains backward compatibility with existing import patterns
 */
export {
  initiatePayment,
  verifyPayment,
  getRazorpayKey,
  submitToGoogleForm,
  validatePaymentInitiation,
  getFormData,
  handlePaymentError,
  getOrCreatePlan,
  apiCall,
};

// Legacy export alias for backward compatibility
export { submitToGoogleForm as postToGoogleForm };
