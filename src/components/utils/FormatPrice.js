export function formatPrice(value) {
    if (!value) return "0"; // Handle empty or null values
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }