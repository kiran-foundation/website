/**
 * Google Forms Module
 * Handles Google Forms integration for donation data submission.
 * Provides robust form data preparation and silent error handling.
 */

import { SUPPORT_US_CONFIG } from "../config";
import type { GoogleFormData } from "./types";

/**
 * Creates formatted donation details string for Google Forms submission
 * @param amount - Payment amount in rupees
 * @param type - Payment type ("onetime", "monthly", "yearly")
 * @param paymentId - Payment or subscription ID from Razorpay
 * @param duration - Duration in years for subscriptions (optional)
 * @returns Formatted donation details string
 */
export const createDonationDetails = (
  amount: number,
  type: string,
  paymentId: string,
  duration?: number
): string => {
  const durationText =
    type !== "onetime" && duration ? ` | Duration: ${duration} years` : "";

  return `Donation: ₹${amount} | Frequency: ${type}${durationText} | Payment ID: ${paymentId}`;
};

/**
 * Submits donation data to Google Forms
 * Handles form data preparation, URL encoding, and silent error handling
 * @param data - Google Forms data object
 * @returns Promise that resolves when submission is complete (or fails silently)
 */
export const submitToGoogleForm = async ({
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
    // This is intentional as Google Forms submissions can fail due to CORS
    // but we don't want to interrupt the payment flow
  }
};
