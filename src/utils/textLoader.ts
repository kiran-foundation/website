export interface TextConfig {
  errors: Record<string, string>;
  success: Record<string, string>;
  validation: Record<string, string>;
  laptopValidation: Record<string, string>;
  notifications: Record<string, string>;
  buttons: Record<string, string>;
  display: Record<string, string>;
  paymentLoader: {
    title: string;
    description: string;
  };
}

// Fallback text configuration in case markdown loading fails
const FALLBACK_TEXT: TextConfig = {
  errors: {
    invalidAmount: "Invalid donation amount specified",
    selectAmount: "Please go back and select a donation amount",
    invalidFrequency: "Invalid payment frequency specified",
    selectFrequency: "Please go back and select a valid payment frequency",
    invalidAmountValue: "Invalid donation amount. Please go back and select a valid amount.",
    invalidFrequencyValue: "Invalid payment frequency. Please go back and select a valid frequency.",
    fillRequiredFields: "Please fill in all required fields correctly.",
    paymentFailed: "Payment failed. Please try again.",
    connectionError: "Unable to connect to payment server. Please check your connection.",
    paymentVerificationFailed: "Payment verification failed",
    razorpayNotLoaded: "Razorpay SDK not loaded. Please refresh the page and try again.",
    invalidServerResponse: "Invalid response from payment server",
    paymentCreationFailed: "Payment creation failed",
    postPaymentIssue: "Payment completed but there was an issue with confirmation. Please contact support.",
    submissionFailed: "Submission failed. Please try again later."
  },
  success: {
    paymentSuccess: "Payment successful! Thank you for your donation.",
    subscriptionSuccess: "Subscription activated! Thank you for your ongoing support.",
    formSubmitted: "Form submitted successfully, redirecting..."
  },
  validation: {
    nameError: "Name must be 2-50 characters (letters and spaces only)",
    nameEmpty: "Name is required",
    emailError: "Please enter a valid email address",
    emailEmpty: "Email is required",
    phoneError: "Phone must be 8-15 digits with optional country code",
    phoneEmpty: "Phone number is required",
    countryError: "Country name must be 2-50 characters",
    countryEmpty: "Country is required",
    addressError: "Address must be 5-200 characters",
    addressEmpty: "Address is required",
    cityError: "City name must be 2-50 characters",
    cityEmpty: "City is required",
    zipcodeError: "Pin/Zip code must be 5-10 digits",
    zipcodeEmpty: "Pin/Zip code is required",
    laptopAddressError: "Laptop address must be at least 5 characters",
    laptopAddressEmpty: "Laptop pickup address is required",
    descriptionError: "Description must be at least 10 characters",
    descriptionEmpty: "Description is required"
  },
  laptopValidation: {
    nameError: "Please enter a valid name (2-50 letters).",
    emailError: "Please enter a valid email address.",
    phoneError: "Please enter a valid phone number (8-15 digits).",
    addressError: "Address must be at least 5 characters.",
    cityError: "City must be at least 2 characters.",
    pincodeError: "Pin code must be 4-10 digits.",
    laptopAddressError: "Laptop address must be at least 5 characters.",
    descriptionError: "Description must be at least 10 characters.",
    nameEmpty: "Name is required.",
    emailEmpty: "Email is required.",
    phoneEmpty: "Phone number is required.",
    addressEmpty: "Address is required.",
    cityEmpty: "City is required.",
    pincodeEmpty: "Pin code is required.",
    laptopAddressEmpty: "Laptop pickup address is required.",
    descriptionEmpty: "Description is required.",
    fieldRequired: "This field is required."
  },
  notifications: {
    fillSingleField: "Please fill in the required field.",
    fillMultipleFields: "Please fill in all {count} required fields.",
    correctInvalidField: "Please correct the invalid field.",
    correctMultipleFields: "Please correct {count} invalid fields.",
    fillAndCorrect: "Please fill in all required fields and correct any errors."
  },
  buttons: {
    selectAmountFrequency: "Please go back and select amount & frequency",
    submitting: "Submitting..."
  },
  display: {
    perMonth: "per month",
    perYear: "per year",
    oneTime: "One Time",
    selectFrequency: "Please select frequency"
  },
  paymentLoader: {
    title: "Connecting to Server",
    description: "Please wait while we connect you to the Payment Server. This may take a moment. Please do not close or refresh your browser window."
  }
};

let textConfig: TextConfig | null = null;

/**
 * Load text configuration from markdown file
 * Falls back to hardcoded configuration if loading fails
 */
export async function loadTextConfig(): Promise<TextConfig> {
  if (textConfig) {
    return textConfig;
  }

  try {
    // In a browser environment, we'll need to fetch the processed markdown data
    // This assumes the markdown is processed by Astro and available as JSON
    const response = await fetch('/api/support-form-text');
    if (response.ok) {
      const data = await response.json();
      textConfig = data;
      return textConfig;
    }
  } catch (error) {
    // Silently fall back to default configuration
  }

  // Use fallback configuration
  textConfig = FALLBACK_TEXT;
  return textConfig;
}

/**
 * Get text by key path (e.g., "errors.invalidAmount")
 * Supports parameter interpolation using {param} syntax
 */
export function getText(keyPath: string, params?: Record<string, any>): string {
  if (!textConfig) {
    // If not loaded yet, use fallback
    textConfig = FALLBACK_TEXT;
  }

  const keys = keyPath.split('.');
  let value: any = textConfig;

  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = value[key];
    } else {
      return `[Missing text: ${keyPath}]`;
    }
  }

  if (typeof value !== 'string') {
    return `[Invalid text type: ${keyPath}]`;
  }

  // Handle parameter interpolation
  if (params) {
    return value.replace(/\{(\w+)\}/g, (match, paramName) => {
      return params[paramName]?.toString() || match;
    });
  }

  return value;
}

/**
 * Initialize text loading for browser environment
 * Call this early in your application lifecycle
 */
export async function initializeTextLoader(): Promise<void> {
  try {
    await loadTextConfig();
  } catch (error) {
    // Silently use fallback configuration
    textConfig = FALLBACK_TEXT;
  }
}

/**
 * Synchronous text getter that uses loaded configuration
 * Must call loadTextConfig() or initializeTextLoader() first
 */
export function getTextSync(keyPath: string, params?: Record<string, any>): string {
  return getText(keyPath, params);
}