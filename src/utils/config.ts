
// Environment detection utilities
const isProduction = (): boolean => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const productionDomains = [
      'kiran.foundation',
      'www.kiran.foundation'];
    return productionDomains.includes(hostname);
  }  
  return false;
};

// Test/Development configuration
const CONFIG_TEST = {
  API_BASE_URL: "https://support-us-test.kiran.foundation",
  RAZORPAY_KEY: "not-defined",
  COMPANY_NAME: "Kiran Foundations Test",
  COMPANY_LOGO: "https://kfastro.netlify.app/favicon.ico",
  THEME_COLOR: "#3399cc",
  PREDEFINED_PLANS: {
    monthly: {
      10001: null,
      5001: "plan_PFJfnMnXPs6TMS",
      1001: "plan_PFJfPtteneZ7Tn",
      501: "plan_PFJa00kkaP1Tdb",
    },
    yearly: {
      108000: null,
      51000: null,
      1100: null,
      5100: null,
    },
  },
  GOOGLE_FORM: {
    URL: "https://docs.google.com/forms/d/e/1FAIpQLSeCSnUWYOT6yURnKDOVIqlAxjhPTyDIdo4RzJQhCM_rUgz5xA/formResponse",
    ENTRIES: {
      FULL_NAME: "entry.31137184",
      EMAIL: "entry.1480524677",
      PHONE: "entry.504971788",
      COUNTRY: "entry.2040851156",
      ADDRESS: "entry.189619044",
      CITY: "entry.40687982",
      PINCODE: "entry.1929245861",
      NOTES: "entry.2091957290",
      DONATION_DETAILS: "entry.2091957290"
    }
  }
} as const;

// Production configuration
const CONFIG_LIVE = {
  API_BASE_URL: "https://support-us.kiran.foundation",
  RAZORPAY_KEY: "not-defined",
  COMPANY_NAME: "Kiran Foundations",
  COMPANY_LOGO: "https://kfastro.netlify.app/favicon.ico",
  THEME_COLOR: "#3399cc",
  PREDEFINED_PLANS: {
    monthly: {
      10001: null,
      5001: "plan_PFJfnMnXPs6TMS",
      1001: "plan_PFJfPtteneZ7Tn",
      501: "plan_PFJa00kkaP1Tdb",
    },
    yearly: {
      108000: null,
      51000: null,
      1100: null,
      5100: null,
    },
  },
  GOOGLE_FORM: {
    URL: "https://docs.google.com/forms/d/e/1FAIpQLSedxSOPskuroSb3hJSAjVebGa1EoW1OeYjx2WHE1Um5g4iipQ/formResponse",
    ENTRIES: {
      FULL_NAME: "entry.283978656",
      EMAIL: "entry.1909208105", 
      PHONE: "entry.1359110198",
      COUNTRY: "entry.218344457",
      ADDRESS: "entry.938609362",
      CITY: "entry.1458813282",
      PINCODE: "entry.726311981",
      NOTES: "entry.965069241",
      DONATION_DETAILS: "entry.1357525015"
    }
  }
} as const;

// Select configuration based on environment
const SUPPORT_US_CONFIG = isProduction() ? CONFIG_LIVE : CONFIG_TEST;

// Export the selected configuration and utility functions
export { SUPPORT_US_CONFIG, isProduction };