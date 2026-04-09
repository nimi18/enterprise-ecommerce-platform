const generateOrderNumber = () => {
  const now = new Date();
  const year = now.getFullYear();
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(1000 + Math.random() * 9000);

  return `ORD-${year}-${timestamp}${random}`;
};

export default generateOrderNumber;