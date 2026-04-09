const calculateLineTotal = ({ price, quantity }) => {
  return Number((price * quantity).toFixed(2));
};

const calculateCartTotals = ({ items, discount = 0, shippingCharge = 0 }) => {
  const subtotal = Number(
    items.reduce((sum, item) => sum + item.lineTotal, 0).toFixed(2)
  );

  const sanitizedDiscount = Math.max(0, Number(discount || 0));
  const sanitizedShippingCharge = Math.max(0, Number(shippingCharge || 0));

  const total = Number(
    (subtotal - sanitizedDiscount + sanitizedShippingCharge).toFixed(2)
  );

  return {
    subtotal,
    discount: sanitizedDiscount,
    shippingCharge: sanitizedShippingCharge,
    total: total < 0 ? 0 : total,
  };
};

export { calculateLineTotal, calculateCartTotals };