---
title: "Supporter's Details"
name:
  title: "Full Name"
  placeholder: "Enter your full name"
email:
  title: "E-mail"
  placeholder: "Enter your email"
phone:
  title: "Phone Number"
  placeholder: "Enter your phone number"
address:
  title: "Address"
  placeholder: "Enter your address"
city:
  title: "City"
  placeholder: "Enter your city"
pin:
  title: "Pin code"
  placeholder: "Pin code"
other: "Order Notes (Optional)"
country:
  title: "Country"
  placeholder: "Enter your country"
  value: "India"

paymentLoader:
  title: "Connecting to Server"
  description: "Please wait while we connect you to the Payment Server. This may take a moment. Please do not close or refresh your browser window."

# Error Messages
errors:
  invalidAmount: "Invalid donation amount specified"
  selectAmount: "Please go back and select a donation amount"
  invalidFrequency: "Invalid payment frequency specified"
  selectFrequency: "Please go back and select a valid payment frequency"
  invalidAmountValue: "Invalid donation amount. Please go back and select a valid amount."
  invalidFrequencyValue: "Invalid payment frequency. Please go back and select a valid frequency."
  fillRequiredFields: "Please fill in all required fields correctly."
  paymentFailed: "Payment failed. Please try again."
  connectionError: "Unable to connect to payment server. Please check your connection."
  paymentVerificationFailed: "Payment verification failed"
  razorpayNotLoaded: "Razorpay SDK not loaded. Please refresh the page and try again."
  invalidServerResponse: "Invalid response from payment server"
  paymentCreationFailed: "Payment creation failed"
  postPaymentIssue: "Payment completed but there was an issue with confirmation. Please contact support."
  submissionFailed: "Submission failed. Please try again later."

# Success Messages
success:
  paymentSuccess: "Payment successful! Thank you for your donation."
  subscriptionSuccess: "Subscription activated! Thank you for your ongoing support."
  formSubmitted: "Form submitted successfully, redirecting..."

# Validation Messages
validation:
  nameError: "Name must be 2-50 characters (letters and spaces only)"
  nameEmpty: "Name is required"
  emailError: "Please enter a valid email address"
  emailEmpty: "Email is required"
  phoneError: "Phone must be 8-15 digits with optional country code"
  phoneEmpty: "Phone number is required"
  countryError: "Country name must be 2-50 characters"
  countryEmpty: "Country is required"
  addressError: "Address must be 5-200 characters"
  addressEmpty: "Address is required"
  cityError: "City name must be 2-50 characters"
  cityEmpty: "City is required"
  zipcodeError: "Pin/Zip code must be 5-10 digits"
  zipcodeEmpty: "Pin/Zip code is required"

  descriptionError: "Description must be at least 10 characters"
  descriptionEmpty: "Description is required"

# Laptop Form Validation (for laptopForm.ts)
laptopValidation:
  nameError: "Please enter a valid name (2-50 letters)."
  emailError: "Please enter a valid email address."
  phoneError: "Please enter a valid phone number (8-15 digits)."
  addressError: "Address must be at least 5 characters."
  cityError: "City must be at least 2 characters."
  pincodeError: "Pin code must be 4-10 digits."

  descriptionError: "Description must be at least 10 characters."
  nameEmpty: "Name is required."
  emailEmpty: "Email is required."
  phoneEmpty: "Phone number is required."
  addressEmpty: "Address is required."
  cityEmpty: "City is required."
  pincodeEmpty: "Pin code is required."

  descriptionEmpty: "Description is required."
  fieldRequired: "This field is required."

# Notifications
notifications:
  fillSingleField: "Please fill in the required field."
  fillMultipleFields: "Please fill in all {count} required fields."
  correctInvalidField: "Please correct the invalid field."
  correctMultipleFields: "Please correct {count} invalid fields."
  fillAndCorrect: "Please fill in all required fields and correct any errors."

# Button Text
buttons:
  selectAmountFrequency: "Please go back and select amount & frequency"
  submitting: "Submitting..."

# Display Text
display:
  perMonth: "per month"
  perYear: "per year"
  oneTime: "One Time"
  selectFrequency: "Please select frequency"
---
