/**
 * Utility Module
 * Shared utilities and helper functions.
 * Provides pure utility functions and reusable helper methods.
 */

/**
 * Calculates total count for subscription payments based on type and duration
 * @param type - Payment type ("monthly" or "yearly")
 * @param duration - Duration in years
 * @returns Total count for subscription
 */
export const calculateTotalCount = (type: string, duration: number): number => {
  if (type === "monthly") {
    return duration * 12;
  } else if (type === "yearly") {
    // For yearly subscriptions, we need to ensure correct end date calculation
    // The behavior might differ between pre-created plans and dynamically created plans
    // Current approach: add 1 to duration to compensate for Razorpay's date calculation
    // This ensures: 2 years selected → subscription active until 2027
    return duration + 1;
  }
  return duration;
};

/**
 * Formats payment description for Razorpay display
 * @param type - Payment type ("onetime", "monthly", "yearly")
 * @returns Formatted description string
 */
export const formatPaymentDescription = (type: string): string => {
  return type === "onetime"
    ? "Donation"
    : `${type.charAt(0).toUpperCase() + type.slice(1)} Subscription`;
};

/**
 * Creates redirect URL with parameters
 * @param page - Page name ("confirmation", "unsuccessful")
 * @param params - URL parameters object
 * @returns Formatted redirect URL
 */
export const createRedirectUrl = (
  page: string,
  params: {
    amount: number;
    type: string;
    txnId: string;
    reason?: string;
    planId?: string;
  }
): string => {
  const baseUrl = `/support-us/${page}/`;
  const urlParams = new URLSearchParams();

  urlParams.append("amount", params.amount.toString());
  urlParams.append("type", params.type);
  urlParams.append("txnId", params.txnId);

  if (params.reason) {
    urlParams.append("reason", params.reason);
  }

  if (params.planId) {
    urlParams.append("planId", params.planId);
  }

  return `${baseUrl}?${urlParams.toString()}`;
};

/**
 * Validates duration value and ensures it falls within acceptable range
 * @param duration - Duration value to validate
 * @returns Valid duration (1-5 years) with fallback to 5 if invalid
 */
export const validateDuration = (duration: number): number => {
  const validDuration = duration >= 1 && duration <= 5 ? duration : 5;
  if (validDuration !== duration) {
    console.warn(`Invalid duration ${duration}, using ${validDuration} years`);
  }
  return validDuration;
};
