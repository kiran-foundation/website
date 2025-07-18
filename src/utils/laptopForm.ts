export interface FieldValidators {
  [key: string]: (v: string) => boolean;
}

export const validators: FieldValidators = {
  name: v => v.trim() !== '' && /^[a-zA-Z\s]{2,50}$/.test(v.trim()),
  email: v => v.trim() !== '' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
  phone: v => v.trim() !== '' && /^\+?[0-9\s\-()]{8,15}$/.test(v.trim()),
  address: v => v.trim() !== '' && v.trim().length >= 5,
  city: v => v.trim() !== '' && v.trim().length >= 2,
  pincode: v => v.trim() !== '' && /^\d{4,10}$/.test(v.trim()),
  laptopAddress: v => v.trim() !== '' && v.trim().length >= 5,
  description: v => v.trim() !== '' && v.trim().length >= 10,
};

export const errorTexts: Record<string, string> = {
  name: "Please enter a valid name (2-50 letters).",
  email: "Please enter a valid email address.",
  phone: "Please enter a valid phone number (8-15 digits).",
  address: "Address must be at least 5 characters.",
  city: "City must be at least 2 characters.",
  pincode: "Pin code must be 4-10 digits.",
  laptopAddress: "Laptop address must be at least 5 characters.",
  description: "Description must be at least 10 characters.",
};

export const emptyTexts: Record<string, string> = {
  name: "Name is required.",
  email: "Email is required.",
  phone: "Phone number is required.",
  address: "Address is required.",
  city: "City is required.",
  pincode: "Pin code is required.",
  laptopAddress: "Laptop pickup address is required.",
  description: "Description is required.",
};

export function showToast(message: string, type: 'success' | 'error' | 'info' = 'info') {
  const existing = document.querySelector('.toast-notification');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = `toast-notification fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 transition-all transform translate-x-0 ${
    type === 'success' ? 'bg-green-500 text-white' :
    type === 'error' ? 'bg-[#D33C0D] text-white' :
    'bg-blue-500 text-white'
  }`;
  toast.innerHTML = `
    <div class="flex items-center">
      <span>${message}</span>
      <button class="ml-4 text-white hover:text-gray-200" onclick="this.parentElement.parentElement.remove()">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
    </div>
  `;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('translate-x-full', 'opacity-0');
    setTimeout(() => toast.remove(), 300);
  }, 5000);
}

export function showError(input: HTMLInputElement | HTMLTextAreaElement, message: string) {
  const errorDiv = input.parentElement?.querySelector('.form-error') as HTMLDivElement | null;
  if (errorDiv) {
    errorDiv.textContent = message;
    errorDiv.classList.remove('hidden');
  }
  input.classList.add('error');
}

export function clearError(input: HTMLInputElement | HTMLTextAreaElement) {
  const errorDiv = input.parentElement?.querySelector('.form-error') as HTMLDivElement | null;
  if (errorDiv) {
    errorDiv.textContent = '';
    errorDiv.classList.add('hidden');
  }
  input.classList.remove('error');
}

export function validateField(input: HTMLInputElement | HTMLTextAreaElement): boolean {
  const name = input.name;
  if (!validators[name]) return true;
  if (input.value.trim() === '') {
    showError(input, emptyTexts[name] || 'This field is required.');
    return false;
  }
  if (!validators[name](input.value)) {
    showError(input, errorTexts[name]);
    return false;
  }
  clearError(input);
  return true;
}

export function setupForm(formId: string, successId: string, failId: string) {
  const form = document.getElementById(formId) as HTMLFormElement | null;
  const successMsg = document.getElementById(successId) as HTMLDivElement | null;
  const failMsg = document.getElementById(failId) as HTMLDivElement | null;

  if (!form) throw new Error("Form not found");
  if (!successMsg || !failMsg) throw new Error("Success/Fail message element not found");

  // Real-time validation on blur
  form.addEventListener('focusout', (e) => {
    const target = e.target as HTMLInputElement | HTMLTextAreaElement;
    if (target && target.name && validators[target.name]) {
      validateField(target);
    }
  });

  // Clear error on input
  form.addEventListener('input', (e) => {
    const target = e.target as HTMLInputElement | HTMLTextAreaElement;
    if (target && target.name && validators[target.name]) {
      if (target.value.trim() !== '') {
        clearError(target);
      }
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    successMsg.classList.add('hidden');
    failMsg.classList.add('hidden');

    let valid = true;
    let firstErrorField: HTMLInputElement | HTMLTextAreaElement | null = null;
    let emptyFieldCount = 0;
    let invalidFieldCount = 0;

    // Validate all fields
    for (const input of form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('input:not([readonly]), textarea')) {
      if (validators[input.name]) {
        const isValid = validateField(input);
        if (!isValid) {
          valid = false;
          if (!firstErrorField) {
            firstErrorField = input;
          }
          if (input.value.trim() === '') {
            emptyFieldCount++;
          } else {
            invalidFieldCount++;
          }
        }
      }
    }

    if (!valid) {
      // Focus and scroll to first error field
      if (firstErrorField) {
        firstErrorField.focus();
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }

      // Show appropriate toast message
      let toastMessage = '';
      if (emptyFieldCount > 0 && invalidFieldCount === 0) {
        toastMessage = emptyFieldCount === 1 
          ? "Please fill in the required field." 
          : `Please fill in all ${emptyFieldCount} required fields.`;
      } else if (invalidFieldCount > 0 && emptyFieldCount === 0) {
        toastMessage = invalidFieldCount === 1
          ? "Please correct the invalid field."
          : `Please correct ${invalidFieldCount} invalid fields.`;
      } else {
        toastMessage = "Please fill in all required fields and correct any errors.";
      }
      showToast(toastMessage, 'error');
      return;
    }

    // Only disable while submitting
    const submitButton = form.querySelector('button[type="submit"]') as HTMLButtonElement | null;
    let originalText = '';
    if (submitButton) {
      originalText = submitButton.textContent || '';
      submitButton.disabled = true;
      submitButton.textContent = 'Submitting...';
    }

    try {
      // Simulate async submission (replace with your API call)
      await new Promise(resolve => setTimeout(resolve, 1200));

      showToast("Form submitted successfully! We'll contact you soon.", 'success');
      form.reset();

      // Clear all errors after reset
      for (const input of form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('input, textarea')) {
        clearError(input);
      }

      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = originalText;
      }
    } catch (err) {
      showToast("Submission failed. Please try again later.", 'error');
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = originalText || 'Submit';
      }
    }
  });
}