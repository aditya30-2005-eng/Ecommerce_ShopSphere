// Formats a number as Indian Rupees, e.g. 129900 -> "₹1,29,900"
export const formatCurrency = (amount = 0) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
