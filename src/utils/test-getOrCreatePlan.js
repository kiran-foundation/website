// Test script for getOrCreatePlan method
// Run this in browser console or Node.js environment

// Mock SUPPORT_US_CONFIG for testing
const SUPPORT_US_CONFIG = {
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
  }
};

// Copy of the FIXED getOrCreatePlan function (working with paise)
const getOrCreatePlan = (amount, frequency) => {
  if (frequency === 'onetime') return null;
  
  // Validate frequency
  if (!['monthly', 'yearly'].includes(frequency)) {
    console.warn(`Invalid frequency: ${frequency}. Supported: monthly, yearly`);
    return null;
  }
  
  console.log(`Looking for predefined plan: ${frequency}, amount: ${amount} paise (₹${(amount/100).toFixed(2)})`);
  
  // Check if predefined plan exists (amount is already in paise)
  const plans = SUPPORT_US_CONFIG.PREDEFINED_PLANS[frequency];
  console.log(`Available plans for ${frequency}:`, plans);
  
  if (plans && amount in plans) {
    const planId = plans[amount];
    
    // Check if plan ID is not null (some plans may be null in config)
    if (planId !== null) {
      console.log(`Found predefined plan: ${planId} for ${amount} paise (₹${(amount/100).toFixed(2)}) ${frequency}`);
      return planId;
    } else {
      console.log(`Plan exists but is null for ${amount} paise (₹${(amount/100).toFixed(2)}) ${frequency}, will create dynamically`);
    }
  }
  
  console.log(`No predefined plan found for ${amount} paise (₹${(amount/100).toFixed(2)}) ${frequency}, will create dynamically`);
  // Return null to indicate a new plan needs to be created
  return null;
};

// Test cases
console.log("=== Testing getOrCreatePlan ===\n");

// Test Case 1: One-time payment (should return null)
console.log("Test 1: One-time payment");
const result1 = getOrCreatePlan(100000, 'onetime'); // ₹1000 one-time
console.log(`Result: ${result1}\n`);

// Test Case 2: Monthly plan that exists
console.log("Test 2: Monthly plan that exists (₹50.01)");
const result2 = getOrCreatePlan(5001, 'monthly'); // ₹50.01 monthly (should find plan for 5001)
console.log(`Result: ${result2}\n`);

// Test Case 3: Monthly plan that doesn't exist
console.log("Test 3: Monthly plan that doesn't exist (₹25.00)");
const result3 = getOrCreatePlan(2500, 'monthly'); // ₹25 monthly
console.log(`Result: ${result3}\n`);

// Test Case 4: Yearly plan (all are null in config)
console.log("Test 4: Yearly plan (₹1080.00)");
const result4 = getOrCreatePlan(108000, 'yearly'); // ₹1080 yearly
console.log(`Result: ${result4}\n`);

// Test Case 5: Invalid frequency
console.log("Test 5: Invalid frequency");
const result5 = getOrCreatePlan(5001, 'weekly'); // Invalid frequency
console.log(`Result: ${result5}\n`);

// Test Case 6: Edge case - plan exists but value is null
console.log("Test 6: Plan exists but value is null (₹100.01 monthly)");
const result6 = getOrCreatePlan(10001, 'monthly'); // ₹100.01 monthly (null in config)
console.log(`Result: ${result6}\n`);

console.log("=== Test Summary ===");
console.log("✅ One-time:", result1 === null);
console.log("✅ Existing monthly plan:", result2 === "plan_PFJfnMnXPs6TMS");
console.log("✅ Non-existing monthly plan:", result3 === null);
console.log("✅ Yearly plan (null value):", result4 === null);
console.log("✅ Invalid frequency:", result5 === null);
console.log("✅ Null plan value:", result6 === null);

console.log("\n=== ISSUES FOUND ===");
if (result2 !== "plan_PFJfnMnXPs6TMS") {
  console.log("❌ ISSUE: ₹50.01 (5001 paise) should find plan for ₹50.01, not ₹50");
  console.log("   The amount conversion is losing precision!");
}
