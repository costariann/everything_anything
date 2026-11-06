/**
 * Formats a numeric price or string into Ghana Cedis (GH₵)
 * Example: formatPrice(150.5) -> "GH₵ 150.50"
 */
export function formatPrice(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined) {
    return 'GH₵ 0.00';
  }
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) {
    return 'GH₵ 0.00';
  }
  return `GH₵ ${num.toLocaleString('en-GH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

