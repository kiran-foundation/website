/**
 * Payment service types and constants
 * Contains all shared types, interfaces, and constants used across payment modules
 */

/**
 * Payment service constants used throughout the module
 */
export const PAYMENT_CONSTANTS = {
  SUPPORTED_FREQUENCIES: ["onetime", "monthly", "yearly"] as const,
  FORM_RESET_DELAY: 100,
} as const;

/**
 * Google Form data interface for donation submissions
 */
export interface GoogleFormData {
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

/**
 * Payment result interface for tracking payment outcomes
 */
export interface PaymentResult {
  success: boolean;
  paymentId?: string;
  subscriptionId?: string;
  error?: string;
}

/**
 * Payment callbacks interface for UI interactions
 */
export interface PaymentCallbacks {
  showLoader: (show: boolean) => void;
  showNotification: (
    message: string,
    type: "success" | "error" | "info"
  ) => void;
  onSuccess: () => void;
}

/**
 * Export the payment service interface
 */
export interface PaymentServiceInterface {
  initiatePayment(
    amount: number,
    type: string,
    formData: import("../../types/payment").PaymentFormData
  ): Promise<void>;
  verifyPayment(
    paymentData: import("../../types/payment").RazorpayResponse
  ): Promise<boolean>;
  getRazorpayKey(): Promise<string>;
  submitToGoogleForm(data: GoogleFormData): Promise<void>;
}
