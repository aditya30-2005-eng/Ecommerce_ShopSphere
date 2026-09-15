// Pure helper functions for cart math - kept outside components/context so
// they are easy to unit test and reuse (Cart page, Checkout page, tests).

export const getUnitPrice = (product) =>
  product?.discountPrice > 0 ? product.discountPrice : product?.price || 0;

export const getItemSubtotal = (item) => getUnitPrice(item.product) * item.quantity;

export const calculateCartTotals = (items = []) => {
  const itemsPrice = items.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);
  const discountedPrice = items.reduce((sum, item) => sum + getItemSubtotal(item), 0);
  const discount = itemsPrice - discountedPrice;
  const shipping = discountedPrice > 999 || discountedPrice === 0 ? 0 : 49;
  const total = discountedPrice + shipping;

  return { itemsPrice, discount, shipping, total };
};
