/**
 * RekaOrder - Submit Order
 * Handles order submission from customers
 */

function submitOrder(data) {
  try {
    // Validate required fields
    const required = ['customerName', 'customerPhone', 'customerAddress', 'cart', 'deliveryDate', 'paymentMethod'];
    const missing = validateRequired(data, required);
    if (missing.length > 0) {
      return { success: false, error: 'Missing: ' + missing.join(', ') };
    }

    const cart = data.cart;
    if (!cart || cart.length === 0) {
      return { success: false, error: 'Cart is empty' };
    }

    // Validate cart
    const validation = validateCart(cart);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    // Calculate totals
    const productPrices = getProductPrices();
    let totalAmount = 0;
    const orderItems = [];

    for (const item of cart) {
      const price = productPrices[item.productId] || 0;
      const subtotal = price * item.quantity;
      totalAmount += subtotal;
      orderItems.push({
        productId: item.productId,
        name: item.name,
        quantity: item.quantity,
        price: price,
        subtotal: subtotal
      });
    }

    // Check minimum order
    const minOrder = parseNumber(getSetting('MIN_ORDER_AMOUNT'));
    if (totalAmount < minOrder) {
      return { success: false, error: 'Minimum order: Rp ' + minOrder.toLocaleString('id-ID') };
    }

    const deliveryFee = parseNumber(getSetting('DELIVERY_FEE'));
    const grandTotal = totalAmount + deliveryFee;

    // Generate order ID
    const orderId = generateId('ORD');

    // Prepare order data
    const orderData = [
      orderId,
      new Date().toISOString(),
      data.customerName,
      data.customerPhone,
      data.customerAddress,
      JSON.stringify(orderItems),
      data.deliveryDate,
      grandTotal,
      data.paymentMethod,
      'Baru',
      '',
      ''
    ];

    // Insert order
    appendRow(CONFIG.SHEETS.ORDERS, orderData);

    // Decrement stock
    decrementStock(cart);

    // Send WhatsApp notification
    sendOrderNotification({
      orderId: orderId,
      customerName: data.customerName,
      customerPhone: formatPhoneNumber(data.customerPhone),
      customerAddress: data.customerAddress,
      deliveryDate: data.deliveryDate,
      orderItems: orderItems,
      totalAmount: grandTotal,
      paymentMethod: data.paymentMethod
    });

    return {
      success: true,
      orderId: orderId,
      message: 'Pesanan berhasil dibuat!',
      totalAmount: grandTotal
    };

  } catch (error) {
    return { success: false, error: error.message };
  }
}

function validateCart(cart) {
  const products = getProductsFromSheet();
  const productMap = {};
  products.forEach(p => productMap[p.ProductID] = p);

  for (const item of cart) {
    const product = productMap[item.productId];
    if (!product) {
      return { valid: false, error: 'Product not found: ' + item.name };
    }
    if (!parseBoolean(product.IsAvailable)) {
      return { valid: false, error: 'Product not available: ' + item.name };
    }
    if (product.Stock < item.quantity) {
      return { valid: false, error: 'Insufficient stock: ' + item.name + ' (available: ' + product.Stock + ')' };
    }
  }
  return { valid: true };
}

function getProductPrices() {
  const products = getProductsFromSheet();
  const prices = {};
  products.forEach(p => prices[p.ProductID] = p.Price);
  return prices;
}

function decrementStock(cart) {
  const sheet = getSheet(CONFIG.SHEETS.PRODUCTS);
  const data = getSheetData(CONFIG.SHEETS.PRODUCTS);
  const headers = data[0];
  const productIdCol = headers.indexOf('ProductID');
  const stockCol = headers.indexOf('Stock');

  const cartMap = {};
  cart.forEach(item => cartMap[item.productId] = item.quantity);

  for (let i = 1; i < data.length; i++) {
    const productId = data[i][productIdCol];
    if (cartMap[productId]) {
      const currentStock = parseNumber(data[i][stockCol]);
      const newStock = currentStock - cartMap[productId];
      updateCell(CONFIG.SHEETS.PRODUCTS, i + 1, stockCol + 1, newStock);
    }
  }
}

function formatPhoneNumber(phone) {
  let cleaned = phone.replace(/[^0-9]/g, '');
  if (cleaned.startsWith('0')) cleaned = '62' + cleaned.substring(1);
  else if (!cleaned.startsWith('62')) cleaned = '62' + cleaned;
  return cleaned;
}
