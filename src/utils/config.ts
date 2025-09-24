// Environment detection utilities
const isProduction = (): boolean => {
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    const productionDomains = ["kiran.foundation", "www.kiran.foundation"];
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
      1000100: "plan_R2sViPaAPpCQnd", //Patron
      500100: "plan_R2sTq18DciEYZO", //Royal Supporter
      100100: "plan_PFJfPtteneZ7Tn", //Super Supporter
      50100: "plan_PFJa00kkaP1Tdb", //supporter
    },
    yearly: {
      10800000: "plan_R2sdSj9X0ZTobo", //Patron
      5100000: "plan_R2scS7cMduilJS", //Royal Supporter
      1100000: "plan_R2sbe0R9rYzRIO", //Super Supporter
      510000: "plan_R2sZPbueWU6ozk", //Supporter
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
      DONATION_DETAILS: "entry.2091957290",
    },
  },
} as const;

// Production configuration
const CONFIG_LIVE = {
  API_BASE_URL: "https://support-us.kiran.foundation",
  RAZORPAY_KEY: "rzp_live_4Y3zP0u7cdRg2b",
  COMPANY_NAME: "Kiran Foundations",
  COMPANY_LOGO: "https://kfastro.netlify.app/favicon.ico",
  THEME_COLOR: "#3399cc",
  PREDEFINED_PLANS: {
    monthly: {
      1000100: "plan_R4raw3Btku01ps",
      500100: "plan_R4ra0PedgZlt49",
      100100: "plan_OIiau4cIHtH3iy",
      50100: "plan_OPgoE4mY393tV7",
    },
    yearly: {
      10800000: "plan_R4rdOTOvbHkSzK",
      5100000: "plan_R4rdDUpXXppCJf",
      110000: "plan_R4rcmtjIA2rLA1",
      510000: "plan_R4rcZ8pt5eWWrd",
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
      DONATION_DETAILS: "entry.1357525015",
    },
  },
} as const;
// Google Analytics Measurement IDs
const GA_TEST_ID = "G-WEK98QPZEZ";
const GA_PROD_ID = "G-VXGS4TBSNE";

// Select configuration based on environment
const SUPPORT_US_CONFIG = isProduction() ? CONFIG_LIVE : CONFIG_TEST;
// Derived GA Tracking ID
const GA_TRACKING_ID = isProduction() ? GA_PROD_ID : GA_TEST_ID;

// Export the selected configuration and utility functions
export { SUPPORT_US_CONFIG, isProduction,GA_TEST_ID, GA_PROD_ID, GA_TRACKING_ID,};
