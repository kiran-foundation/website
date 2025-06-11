// src/utils/support-form.ts
declare var Razorpay: any;

interface FormFieldConfig {
  validate: (value: string) => boolean;
  errorText: string;
  emptyText: string;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  zipcode: string;
  address: string;
  notes: {
    additional_notes: string;
    city: string;
    zipcode: string;
    address: string;
  };
  amount: number;
  currency: string;
  plan_id?: string;
}

export function initializeSupportForm() {
  const urlParams = new URLSearchParams(window.location.search);
  const donationAmount = Number(urlParams.get("amount")) || 0;
  const paymentType = String(urlParams.get("frequency")) || "onetime";
  const plan_id = String(urlParams.get("plan_id"));

  // Initialize amount display
  const amountDisplay = document.getElementById("amountToDisplay") as HTMLDivElement;
  amountDisplay.innerHTML = `₹${donationAmount}`;

  // Initialize frequency display
  const frequencyDisplay = document.getElementById("toBeDisplay") as HTMLDivElement;
  switch(paymentType.toLowerCase()) {
    case 'onetime':
    case 'one time':
      frequencyDisplay.innerHTML = "One Time";
      break;
    case 'monthly':
      frequencyDisplay.innerHTML = "per month";
      break;
    case 'yearly':
      frequencyDisplay.innerHTML = "per year";
      break;
    default:
      frequencyDisplay.innerHTML = "";
  }

  // Setup form validation
  setupFormValidation();

  // Setup payment button
  document.getElementById("donate-now-button")?.addEventListener("click", (e) => {
    e.preventDefault();
    initiatePayment(donationAmount, paymentType, plan_id);
  });
}

function setupFormValidation() {
  const form = document.getElementById("donation-form");
  const donateButton = document.getElementById("donate-now-button") as HTMLButtonElement;
  if (!form || !donateButton) return;

  donateButton.disabled = true;

  const formFieldConfig: Record<string, FormFieldConfig> = {
    name: {
      validate: (value) => /^[a-zA-Z\s]+$/.test(value),
      errorText: "Please enter your full name (letters only)",
      emptyText: "Please enter your name"
    },
    email: {
      validate: (value) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value),
      errorText: "Invalid email format (e.g., name@domain.com)",
      emptyText: "Please enter your email"
    },
    phone: {
      validate: (value) => /^\+?[1-9][0-9]{7,14}$/.test(value.replace(/[\s\-()]/g, "")),
      errorText: "8-15 digits with optional '+' prefix",
      emptyText: "Please enter your phone number"
    },
    country: {
      validate: (value) => value.trim().length > 0,
      errorText: "Please select a country",
      emptyText: "Please select a country"
    },
    address: {
      validate: (value) => value.trim().length > 0,
      errorText: "Please enter your address",
      emptyText: "Please enter your address"
    },
    city: {
      validate: (value) => value.trim().length > 0,
      errorText: "Please enter your city",
      emptyText: "Please enter your city"
    },
    zipcode: {
      validate: (value) => /^\d{6}$/.test(value),
      errorText: "6-digit pin code required",
      emptyText: "Please enter your pin code"
    }
  };

  const validateEntireForm = () => {
    const allValid = Object.entries(formFieldConfig).every(
      ([fieldId, { validate }]) => {
        const fieldValue = (document.getElementById(fieldId) as HTMLInputElement)?.value.trim() || "";
        return validate(fieldValue);
      }
    );
    donateButton.disabled = !allValid;
  };

  const validateFieldOnBlur = (fieldId: string) => {
    const inputElement = document.getElementById(fieldId) as HTMLInputElement;
    if (!inputElement) return;

    const fieldValue = inputElement.value.trim();
    const { validate, errorText, emptyText } = formFieldConfig[fieldId];

    if (!fieldValue) {
      showFieldError(fieldId, emptyText);
    } else if (!validate(fieldValue)) {
      showFieldError(fieldId, errorText);
    }
  };

  const setupFieldEventListeners = () => {
    Object.keys(formFieldConfig).forEach((fieldId) => {
      const inputElement = document.getElementById(fieldId) as HTMLInputElement;
      if (!inputElement) return;

      inputElement.addEventListener("input", () => {
        validateEntireForm();
        clearFieldError(fieldId);
      });

      inputElement.addEventListener("blur", () => {
        validateFieldOnBlur(fieldId);
      });
    });
  };

  const showFieldError = (fieldId: string, message: string) => {
    const inputElement = document.getElementById(fieldId) as HTMLInputElement;
    if (!inputElement) return;

    inputElement.classList.add("error");
    inputElement.style.borderColor = "#D33C0D";

    const existingErrorElement = inputElement.nextElementSibling as HTMLDivElement;
    if (existingErrorElement?.classList.contains("form-error")) {
      existingErrorElement.textContent = message;
    } else {
      const errorElement = document.createElement("div");
      errorElement.className = "form-error text-[#D33C0D] text-sm mt-1";
      errorElement.textContent = message;
      inputElement.parentNode?.insertBefore(errorElement, inputElement.nextSibling);
    }
  };

  const clearFieldError = (fieldId: string) => {
    const inputElement = document.getElementById(fieldId) as HTMLInputElement;
    if (!inputElement) return;

    inputElement.classList.remove("error");
    inputElement.style.borderColor = "";

    const existingErrorElement = inputElement.nextElementSibling as HTMLDivElement;
    if (existingErrorElement?.classList.contains("form-error")) {
      existingErrorElement.remove();
    }
  };

  setupFieldEventListeners();
  validateEntireForm();
}

async function initiatePayment(donationAmount: number, paymentType: string, plan_id: string) {
  const form = document.getElementById("donation-form") as HTMLFormElement;
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const formData: FormData = {
    name: (document.getElementById("name") as HTMLInputElement).value,
    email: (document.getElementById("email") as HTMLInputElement).value,
    phone: (document.getElementById("phone") as HTMLInputElement).value,
    country: (document.getElementById("country") as HTMLInputElement).value,
    city: (document.getElementById("city") as HTMLInputElement).value,
    zipcode: (document.getElementById("zipcode") as HTMLInputElement).value,
    address: (document.getElementById("address") as HTMLInputElement).value,
    notes: {
      additional_notes: (document.getElementById("notes") as HTMLTextAreaElement).value,
      city: (document.getElementById("city") as HTMLInputElement).value,
      zipcode: (document.getElementById("zipcode") as HTMLInputElement).value,
      address: (document.getElementById("address") as HTMLInputElement).value,
    },
    amount: donationAmount * 100,
    currency: "INR",
    ...(paymentType !== "onetime" && { plan_id })
  };

  try {
    const endpoint = paymentType === "onetime" 
      ? "https://donation-backend-five.vercel.app/create-order"
      : "https://donation-backend-five.vercel.app/create-subscription";

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Payment initiation failed");
    }

    const options = {
      key: "rzp_test_HmglXnBOLh8qwp",
      amount: formData.amount,
      currency: "INR",
      name: "Kiran Foundations",
      description: paymentType === "onetime" ? "Donation" : "Subscription for Premier Support",
      image: "https://kfastro.netlify.app/favicon.ico",
      ...(paymentType === "onetime" ? { order_id: data.orderId } : { subscription_id: data.subscription_id }),
      handler: function(response: any) {
        alert(paymentType === "onetime" ? "Payment Successful!" : "Subscription Successful!");
        console.log(paymentType === "onetime" ? "Payment ID:" : "Subscription ID:", 
          paymentType === "onetime" ? response.razorpay_payment_id : response.razorpay_subscription_id);
        form.reset();
      },
      prefill: {
        name: formData.name,
        email: formData.email,
        contact: formData.phone,
      },
      notes: formData.notes,
      theme: {
        color: "#3399cc",
      },
    };

    const rzp = new Razorpay(options);
    rzp.open();
  } catch (error) {
    console.error("Error initiating payment:", error);
    alert("Payment initiation failed. Please try again.");
  }
}