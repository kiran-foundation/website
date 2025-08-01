export const CONFIG = {
  API_BASE_URL: import.meta.env.PUBLIC_API_BASE_URL || "https://support-us-backend.onrender.com",
  RAZORPAY_KEY: "rzp_test_PoZqAR7MVlHjIz", // Test key for non-production environments
  COMPANY_NAME: "Kiran Foundations",
  COMPANY_LOGO: "https://kfastro.netlify.app/favicon.ico",
  THEME_COLOR: "#3399cc",
};

// Note: All payment plans are now created dynamically by the backend
// This eliminates the need for predefined plan IDs and ensures compatibility
// with the backend's dynamic plan creation system
export const PREDEFINED_PLANS = {
  // Removed predefined plans - all plans are now created dynamically by backend
  // This ensures proper alignment with backend implementation
};
