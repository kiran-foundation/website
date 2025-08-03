


// Environment detection utilities
const isProduction = (): boolean => {
  // Method 1: Check environment variable (most reliable)
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env.PROD || import.meta.env.NODE_ENV === 'production';
  }
  
  // Method 2: Check hostname (for browser environments)
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    // Add your production domains here
    const productionDomains = [
      'kiran.foundation',
      'www.kiran.foundation',
      // Add any other production domains
    ];
    return productionDomains.includes(hostname);
  }
  
  // Method 3: Check process.env (for Node.js environments)
  if (typeof process !== 'undefined' && process.env) {
    return process.env.NODE_ENV === 'production';
  }
  
  // Default to test environment for safety
  return false;
};

// You can also add specific environment checks
const getEnvironment = (): 'development' | 'test' | 'production' => {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    if (import.meta.env.DEV) return 'development';
    if (import.meta.env.PROD) return 'production';
  }
  
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') return 'development';
    if (hostname.includes('test') || hostname.includes('staging')) return 'test';
    return 'production';
  }
  
  return 'test'; // Default fallback
};

const CONFIG_TEST = {
  API_BASE_URL: "http://localhost:3000" || "https://support-us-test.kiran.foundation",
  RAZORPAY_KEY: "rzp_test_PoZqAR7MVlHjIz", // Will be fetched from backend
  COMPANY_NAME: "Kiran Foundations Test",
  COMPANY_LOGO: "https://kfastro.netlify.app/favicon.ico",
  THEME_COLOR: "#3399cc",
  PREDEFINED_PLANS: {
    monthly: {
      5000: "plan_PFJfnMnXPs6TMS", // Patron Test - ₹5000
      1001: "plan_PFJfPtteneZ7Tn", // Super Supporter Test - ₹1001
      501: "plan_PFJa00kkaP1Tdb", // Supporter Test - ₹501
    },
    yearly: {
      // Add yearly plans if available
      5000: null, // Will create dynamically
      1001: null, // Will create dynamically
      501: null, // Will create dynamically
    },
  }
};

const CONFIG_LIVE = {
  API_BASE_URL: "https://support-us.kiran.foundation",
  RAZORPAY_KEY: "rzp_test_PoZqAR7MVlHjIz", // Will be fetched from backend
  COMPANY_NAME: "Kiran Foundations",
  COMPANY_LOGO: "https://kfastro.netlify.app/favicon.ico",
  THEME_COLOR: "#3399cc",
  PREDEFINED_PLANS: {
    monthly: {
      5000: "plan_PFJfnMnXPs6TMS", // Patron Test - ₹50
      1001: "plan_PFJfPtteneZ7Tn", // Super Supporter Test - ₹10.01
      501: "plan_PFJa00kkaP1Tdb", // Supporter Test - ₹5.01
    },
    yearly: {
      // Add yearly plans if available
      5000: null, // Will create dynamically
      1001: null, // Will create dynamically
      501: null, // Will create dynamically
    },
  }
};

// Automatically select the correct configuration based on environment
const CONFIG = isProduction() ? CONFIG_LIVE : CONFIG_TEST;

// Export the selected configuration and utility functions
export { CONFIG, isProduction, getEnvironment, CONFIG_TEST, CONFIG_LIVE };