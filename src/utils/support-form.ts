export {};

// Global types for TypeScript in browser
declare global {
  interface Window {
    Razorpay: any;
  }
}

interface FormFieldConfig {
  validate: (value: string) => boolean;
  errorText: string;
  emptyText: string;
}

interface PaymentFormData {
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
  frequency?: string;
  plan_id?: string;
}

// Subscription plans mapping
// Posts data to the Google Form using the correct entry IDs from the provided URL
const postToGoogleForm = async ({
  fullName,
  email,
  number,
  country,
  address,
  city,
  pincode,
  notes,
}: {
  fullName: string;
  email: string;
  number: string;
  country: string;
  address: string;
  city: string;
  pincode: string;
  notes: string;
}) => {
  const url =
    "https://docs.google.com/forms/d/e/1FAIpQLSedxSOPskuroSb3hJSAjVebGa1EoW1OeYjx2WHE1Um5g4iipQ/formResponse";

  const formData = new URLSearchParams();
  formData.append("entry.283978656", fullName);
  formData.append("entry.1909208105", email);
  formData.append("entry.1359110198", number);
  formData.append("entry.218344457", country);
  formData.append("entry.938609362", address);
  formData.append("entry.1458813282", city);
  formData.append("entry.726311981", pincode);
  formData.append("entry.965069241", notes);

  return fetch(url, {
    method: "POST",
    mode: "no-cors",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formData.toString(),
  });
};
export function initializeSupportForm(): void {
  const urlParams = new URLSearchParams(window.location.search);
  console.log("URL Params:", urlParams.toString());
  const donationAmount = Number(urlParams.get("amount") ?? "0");
  const paymentType = String(
    urlParams.get("frequency") ?? "onetime"
  ).toLowerCase();

  // Get plan_id based on amount and frequency

  const amountDisplay = document.getElementById(
    "amountToDisplay"
  ) as HTMLDivElement;
  const frequencyDisplay = document.getElementById(
    "toBeDisplay"
  ) as HTMLDivElement;

  if (amountDisplay) amountDisplay.innerHTML = `₹${donationAmount}`;
  if (frequencyDisplay) {
    frequencyDisplay.innerHTML =
      paymentType === "monthly"
        ? "per month"
        : paymentType === "yearly"
          ? "per year"
          : "One Time";
  }

  setupFormValidation();

  const donateButton = document.getElementById(
    "donate-now-button"
  ) as HTMLButtonElement;
  if (donateButton) {
    donateButton.addEventListener("click", (e) => {
      e.preventDefault();
      initiatePayment(donationAmount, paymentType);
    });
  }
}

function setupFormValidation(): void {
  const form = document.getElementById("donation-form") as HTMLFormElement;
  const donateButton = document.getElementById(
    "donate-now-button"
  ) as HTMLButtonElement;
  if (!form || !donateButton) return;

  donateButton.disabled = true;

  const fields: Record<string, FormFieldConfig> = {
    name: {
      validate: (v) => /^[a-zA-Z\s]+$/.test(v) && v.trim().length > 0,
      errorText: "Please enter a valid name (letters only)",
      emptyText: "Name is required",
    },
    email: {
      validate: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
      errorText: "Invalid email format",
      emptyText: "Email is required",
    },
    phone: {
      validate: (v) => /^\+?[1-9][0-9]{7,14}$/.test(v.replace(/[\s\-()]/g, "")),
      errorText: "Phone must be 8-15 digits",
      emptyText: "Phone number is required",
    },
    country: {
      validate: (v) => v.trim().length > 0,
      errorText: "Country is required",
      emptyText: "Country is required",
    },
    address: {
      validate: (v) => v.trim().length > 0,
      errorText: "Address is required",
      emptyText: "Address is required",
    },
    city: {
      validate: (v) => v.trim().length > 0,
      errorText: "City is required",
      emptyText: "City is required",
    },
    zipcode: {
      validate: (v) => /^\d{6}$/.test(v),
      errorText: "Pin code must be 6 digits",
      emptyText: "Pin code is required",
    },
  };

  const validateForm = () => {
    const valid = Object.entries(fields).every(([id, cfg]) => {
      const element = document.getElementById(id) as HTMLInputElement;
      const val = element?.value.trim() || "";
      return cfg.validate(val);
    });
    donateButton.disabled = !valid;
  };

  const showError = (id: string, message: string) => {
    const el = document.getElementById(id) as HTMLInputElement;
    if (!el) return;

    el.classList.add("error");
    el.style.borderColor = "#D33C0D";

    // Remove existing error message
    const existingError = el.parentNode?.querySelector(".form-error");
    if (existingError) {
      existingError.remove();
    }

    // Add new error message
    const error = document.createElement("div");
    error.className = "form-error text-[#D33C0D] text-sm mt-1";
    error.textContent = message;
    el.parentNode?.insertBefore(error, el.nextSibling);
  };

  const clearError = (id: string) => {
    const el = document.getElementById(id) as HTMLInputElement;
    if (!el) return;

    el.classList.remove("error");
    el.style.borderColor = "";

    const error = el.parentNode?.querySelector(".form-error");
    if (error) error.remove();
  };

  Object.keys(fields).forEach((id) => {
    const el = document.getElementById(id) as HTMLInputElement;
    if (!el) return;

    el.addEventListener("input", () => {
      validateForm();
      clearError(id);
    });

    el.addEventListener("blur", () => {
      const val = el.value.trim();
      if (!val) {
        showError(id, fields[id].emptyText);
      } else if (!fields[id].validate(val)) {
        showError(id, fields[id].errorText);
      }
    });
  });

  validateForm();
}

async function initiatePayment(amount: number, type: string): Promise<void> {
  const form = document.getElementById("donation-form") as HTMLFormElement;

  // Manual validation check
  const fields = [
    "name",
    "email",
    "phone",
    "country",
    "address",
    "city",
    "zipcode",
  ];
  let isValid = true;

  for (const fieldId of fields) {
    const field = document.getElementById(fieldId) as HTMLInputElement;
    if (!field?.value.trim()) {
      isValid = false;
      break;
    }
  }

  if (!isValid) {
    alert("Please fill in all required fields.");
    return;
  }

  // For subscriptions, validate that we have a valid plan
  // if (type !== "onetime" && !plan_id) {
  //   alert("Invalid subscription plan selected. Please choose a valid amount.");
  //   return;
  // }

  const formData: PaymentFormData = {
    name: (document.getElementById("name") as HTMLInputElement).value,
    email: (document.getElementById("email") as HTMLInputElement).value,
    phone: (document.getElementById("phone") as HTMLInputElement).value,
    country: (document.getElementById("country") as HTMLInputElement).value,
    city: (document.getElementById("city") as HTMLInputElement).value,
    zipcode: (document.getElementById("zipcode") as HTMLInputElement).value,
    address: (document.getElementById("address") as HTMLInputElement).value,
    notes: {
      additional_notes:
        (document.getElementById("notes") as HTMLTextAreaElement)?.value || "",
      city: (document.getElementById("city") as HTMLInputElement).value,
      zipcode: (document.getElementById("zipcode") as HTMLInputElement).value,
      address: (document.getElementById("address") as HTMLInputElement).value,
    },
    amount: amount * 100,
    currency: "INR",
    frequency: type,
  };

  const endpoint =
    type === "onetime"
      ? "https://donation-backend-five.vercel.app/create-order"
      : "https://donation-backend-five.vercel.app/create-subscription";

  try {
    // console.log("Sending payment request:", { endpoint, amount, type, plan_id });

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(formData),
    });

    const data = await res.json();
    console.log("data recived  " + data);
    if (!res.ok) {
      throw new Error(
        data.message || `HTTP ${res.status}: Payment creation failed`
      );
    }

    if (typeof window.Razorpay === "undefined") {
      alert("Razorpay SDK not loaded. Please refresh the page and try again.");
      return;
    }

    const options: any = {
      key: "rzp_test_PoZqAR7MVlHjIz", // Updated to match backend
      amount: formData.amount,
      currency: "INR",
      name: "Kiran Foundations",
      description: type === "onetime" ? "Donation" : "Premier Subscription",
      image: "https://kfastro.netlify.app/favicon.ico",
      handler: (res: any) => {
        alert(
          type === "onetime" ? "Payment Successful!" : "Subscription Active!"
        );

        console.log("Payment response:", res);
        const form_res = postToGoogleForm({
          fullName: formData.name,
          email: formData.email,
          number: formData.phone,
          country: formData.country,
          address: formData.address,
          city: formData.city,
          pincode: formData.zipcode,
          notes: formData?.notes?.additional_notes || "",
        });
        console.log("Google Form response:", form_res);

        form.reset();
        // Re-initialize form after reset
        setTimeout(() => {
          initializeSupportForm();
        }, 100);
      },
      modal: {
        ondismiss: function () {
          console.log("Payment modal closed");
        },
      },
      prefill: {
        name: formData.name,
        email: formData.email,
        contact: formData.phone,
      },
      notes: formData.notes,
      theme: { color: "#3399cc" },
      ...(type === "onetime"
        ? { order_id: data.orderId }
        : { subscription_id: data.subscription_id }),
    };

    console.log("Opening Razorpay with options:", options);

    const razorpay = new window.Razorpay(options);
    razorpay.open();
  } catch (err: any) {
    console.error("Payment error:", err);

    if (err.message.includes("CORS")) {
      alert(
        "Connection error. Please check if the server is running on port 3000."
      );
    } else if (err.message.includes("Failed to fetch")) {
      alert(
        "Unable to connect to payment server. Please check your connection."
      );
    } else {
      alert(`Payment failed: ${err.message}`);
    }
  }
}

// Initialize when DOM is loaded
