/**
 * Format a number using Indian numbering system
 * @param amount - Number or string to format
 * @returns Formatted string with Indian number system (e.g., "1,08,000")
 */
export function formatIndianNumber(amount: number | string): string {
  const num = typeof amount === 'string' ? parseInt(amount, 10) : amount;
  
  if (isNaN(num)) {
    return String(amount);
  }
  
  return num.toLocaleString();
}
