// Email validation
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || typeof email !== 'string') {
      return { isValid: false, message: 'Email is required' };
    }
    if (!emailRegex.test(email)) {
      return { isValid: false, message: 'Please enter a valid email address' };
    }
    return { isValid: true, message: '' };
  };
  
  // Password validation
  const validatePassword = (password) => {
    if (!password || typeof password !== 'string') {
      return { isValid: false, message: 'Password is required' };
    }
    if (password.length < 6) {
      return { isValid: false, message: 'Password must be at least 6 characters long' };
    }
    return { isValid: true, message: '' };
  };
  
  // Payment method validation
  const validatePaymentMethod = (method) => {
    if (!method || typeof method !== 'object') {
      return { isValid: false, message: 'Payment method data is required' };
    }
  
    const { methodType, cardNumberLastFour, bankAccountNumberLastFour } = method;
  
    // Validate method type
    const validMethodTypes = ['credit_card', 'debit_card', 'bank_transfer', 'paypal'];
    if (!methodType || !validMethodTypes.includes(methodType)) {
      return { isValid: false, message: 'Invalid payment method type' };
    }
  
    // Validate last four digits based on method type
    if (methodType === 'bank_transfer') {
      if (!bankAccountNumberLastFour || !/^\d{4}$/.test(bankAccountNumberLastFour)) {
        return { isValid: false, message: 'Bank account number must end with exactly 4 digits' };
      }
    } else if (methodType !== 'paypal') {
      if (!cardNumberLastFour || !/^\d{4}$/.test(cardNumberLastFour)) {
        return { isValid: false, message: 'Card number must end with exactly 4 digits' };
      }
    }
  
    return { isValid: true, message: '' };
  };
  
  // Billing address validation
  const validateBillingAddress = (address) => {
    if (!address || typeof address !== 'object') {
      return { isValid: false, message: 'Billing address data is required' };
    }
  
    const { street, city, state, postalCode, country } = address;
  
    if (!street || street.trim() === '') {
      return { isValid: false, message: 'Street is required' };
    }
    if (!city || city.trim() === '') {
      return { isValid: false, message: 'City is required' };
    }
    if (!state || state.trim() === '') {
      return { isValid: false, message: 'State is required' };
    }
    if (!postalCode || !/^\d{5}(-\d{4})?$/.test(postalCode)) {
      return { isValid: false, message: 'Postal code must be a valid 5-digit code (e.g., 12345 or 12345-6789)' };
    }
    if (!country || country.trim() === '') {
      return { isValid: false, message: 'Country is required' };
    }
  
    return { isValid: true, message: '' };
  };
  
  // Discount code validation (simple example)
  const validateDiscountCode = (code) => {
    if (!code || typeof code !== 'string') {
      return { isValid: false, message: 'Discount code is required' };
    }
    if (code.trim() === '') {
      return { isValid: false, message: 'Discount code cannot be empty' };
    }
    // Add more specific rules if needed (e.g., length, format)
    return { isValid: true, message: '' };
  };
  
  export {
    validateEmail,
    validatePassword,
    validatePaymentMethod,
    validateBillingAddress,
    validateDiscountCode,
  };