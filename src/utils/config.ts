const CONFIG_TEST = {
  API_BASE_URL: "https://support-us-test.kiran.foundation",
  RAZORPAY_KEY: "rzp_test_PoZqAR7MVlHjIz", // Will be fetched from backend
  COMPANY_NAME: "Kiran Foundations Test",
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