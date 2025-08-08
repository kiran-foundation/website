/**
 * API Module
 * Handles all HTTP API communications with the backend server.
 * Provides centralized error handling, consistent headers, and proper error localization.
 */

import { SUPPORT_US_CONFIG } from "../config";
import { getTextSync } from "../textLoader";
import type { ApiResponse } from "../../types/payment";

/**
 * Makes an HTTP API call to the backend server with standardized error handling
 * @param endpoint - The API endpoint to call (e.g., "/razorpay-key")
 * @param options - Additional fetch options (method, body, headers, etc.)
 * @returns Promise resolving to the API response
 * @throws Error with localized message for connection or server errors
 */
export const apiCall = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse> => {
  const url = `${SUPPORT_US_CONFIG.API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || `HTTP ${response.status}: Request failed`
      );
    }
    return data;
  } catch (error) {
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error(getTextSync("errors.connectionError"));
    }
    throw error;
  }
};

/**
 * Retrieves the Razorpay API key from the backend server
 * Falls back to configuration value if API call fails
 * @returns Promise resolving to the Razorpay API key
 */
export const getRazorpayKey = async (): Promise<string> => {
  try {
    const response = await apiCall("/razorpay-key");
    return response.data?.key || SUPPORT_US_CONFIG.RAZORPAY_KEY;
  } catch (error) {
    // Fallback to configuration key if API call fails
    return SUPPORT_US_CONFIG.RAZORPAY_KEY;
  }
};
