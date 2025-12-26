/**
 * Verhoeff Algorithm Implementation for Aadhaar Number Validation
 * The Verhoeff algorithm is a checksum formula for error detection developed by Johannes Verhoeff
 */

// Multiplication table for Verhoeff algorithm
const multiplicationTable: number[][] = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
  [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
  [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
  [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
  [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
  [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
  [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
  [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
  [9, 8, 7, 6, 5, 4, 3, 2, 1, 0]
];

// Permutation table for Verhoeff algorithm
const permutationTable: number[][] = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
  [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
  [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
  [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
  [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
  [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
  [7, 0, 4, 6, 9, 1, 3, 2, 5, 8]
];

// Inverse table for Verhoeff algorithm
const inverseTable: number[] = [0, 4, 3, 2, 1, 5, 6, 7, 8, 9];

/**
 * Validates an Aadhaar number using the Verhoeff algorithm
 * @param aadhaar - The Aadhaar number as a string (12 digits)
 * @returns boolean - True if valid, false otherwise
 */
export const validateAadhaar = (aadhaar: string): boolean => {
  try {
    // Remove spaces and non-digit characters
    const cleanAadhaar = aadhaar.replace(/\D/g, '');
    
    // Check if it's exactly 12 digits
    if (cleanAadhaar.length !== 12) {
      return false;
    }

    // Convert to array of numbers
    const digits = cleanAadhaar.split('').map(Number);
    
    // Apply Verhoeff algorithm
    let checksum = 0;
    
    // Process each digit from right to left
    for (let i = 0; i < digits.length; i++) {
      const position = digits.length - i - 1; // Position from right (0-based)
      const digit = digits[i];
      
      // Apply permutation based on position
      const permutedDigit = permutationTable[position % 8][digit];
      
      // Apply multiplication table
      checksum = multiplicationTable[checksum][permutedDigit];
    }
    
    // Valid if checksum is 0
    return checksum === 0;
  } catch (error) {
    console.error('Verhoeff validation error:', error);
    return false;
  }
};

/**
 * Formats an Aadhaar number with spaces (XXXX XXXX XXXX)
 * @param aadhaar - The Aadhaar number as a string
 * @returns string - Formatted Aadhaar number
 */
export const formatAadhaar = (aadhaar: string): string => {
  const cleanAadhaar = aadhaar.replace(/\D/g, '');
  if (cleanAadhaar.length <= 4) {
    return cleanAadhaar;
  } else if (cleanAadhaar.length <= 8) {
    return cleanAadhaar.replace(/(\d{4})(\d+)/, '$1 $2');
  } else {
    return cleanAadhaar.replace(/(\d{4})(\d{4})(\d+)/, '$1 $2 $3');
  }
};

/**
 * Masks an Aadhaar number showing only last 4 digits (XXXX XXXX 1234)
 * @param aadhaar - The Aadhaar number as a string
 * @returns string - Masked Aadhaar number
 */
export const maskAadhaar = (aadhaar: string): string => {
  const cleanAadhaar = aadhaar.replace(/\D/g, '');
  if (cleanAadhaar.length !== 12) {
    return aadhaar;
  }
  const lastFour = cleanAadhaar.slice(-4);
  return `XXXX XXXX ${lastFour}`;
};

/**
 * Validates Aadhaar format and returns validation result with message
 * @param aadhaar - The Aadhaar number as a string
 * @returns object - Validation result with isValid and message
 */
export const validateAadhaarWithMessage = (aadhaar: string): { isValid: boolean; message: string } => {
  const cleanAadhaar = aadhaar.replace(/\D/g, '');
  
  if (!cleanAadhaar) {
    return { isValid: false, message: 'Aadhaar number is required' };
  }
  
  if (cleanAadhaar.length < 12) {
    return { isValid: false, message: `Aadhaar number must be 12 digits (${cleanAadhaar.length}/12)` };
  }
  
  if (cleanAadhaar.length > 12) {
    return { isValid: false, message: 'Aadhaar number cannot exceed 12 digits' };
  }
  
  // Check for invalid patterns
  if (/^(\d)\1{11}$/.test(cleanAadhaar)) {
    return { isValid: false, message: 'Invalid Aadhaar number (all digits are same)' };
  }
  
  if (!validateAadhaar(cleanAadhaar)) {
    return { isValid: false, message: 'Invalid Aadhaar number (checksum verification failed)' };
  }
  
  return { isValid: true, message: '✅ Valid Aadhaar number' };
};

/**
 * Cleans and returns only digits from Aadhaar input
 * @param aadhaar - The Aadhaar number as a string
 * @returns string - Clean Aadhaar number with only digits
 */
export const cleanAadhaar = (aadhaar: string): string => {
  return aadhaar.replace(/\D/g, '');
};

/**
 * Generates a valid Aadhaar number for testing purposes
 * @returns string - A valid 12-digit Aadhaar number
 */
export const generateValidAadhaar = (): string => {
  // Generate first 11 digits randomly
  let digits = '';
  for (let i = 0; i < 11; i++) {
    digits += Math.floor(Math.random() * 10).toString();
  }
  
  // Calculate the check digit using Verhoeff algorithm
  let checksum = 0;
  const digitArray = digits.split('').map(Number);
  
  for (let i = 0; i < digitArray.length; i++) {
    const position = digitArray.length - i;
    const digit = digitArray[i];
    const permutedDigit = permutationTable[position % 8][digit];
    checksum = multiplicationTable[checksum][permutedDigit];
  }
  
  const checkDigit = inverseTable[checksum];
  return digits + checkDigit.toString();
};

/**
 * Test function to verify the Verhoeff implementation
 * @returns boolean - True if all tests pass
 */
export const testVerhoeffImplementation = (): boolean => {
  // Test with known valid Aadhaar numbers
  const validNumbers = [
    '234123412346', // Known valid test number
    '123456789012', // Another test number
  ];
  
  const invalidNumbers = [
    '123456789013', // Invalid checksum
    '111111111111', // All same digits
    '000000000000', // All zeros
  ];
  
  console.log('Testing Verhoeff implementation...');
  
  // Test valid numbers
  for (const num of validNumbers) {
    if (!validateAadhaar(num)) {
      console.error(`❌ Valid number ${num} failed validation`);
      return false;
    }
  }
  
  // Test invalid numbers
  for (const num of invalidNumbers) {
    if (validateAadhaar(num)) {
      console.error(`❌ Invalid number ${num} passed validation`);
      return false;
    }
  }
  
  console.log('✅ All Verhoeff tests passed');
  return true;
};

// Run tests in development
if (process.env.NODE_ENV === 'development') {
  testVerhoeffImplementation();
}