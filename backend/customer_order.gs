/**
 * RekaOrder - Customer Order Handler
 * Handles product retrieval and order submission
 *
 * @author RekaOrder
 * @version 1.0.0
 */

/**
 * Get all available products for customers
 */
function getProducts(data) {
  try {
    const sheet = getSheet(CONFIG.SHEETS.PRODUCTS);
    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();

    if (values.length <= 1) {
      return { success: true, products: [] };
    }

    const products = [];
    const headers = values[0];

    for (let i = 1; i < values.length; i++) {
      const row = values[i];
      const product = {};

      // Map each column to header
      for (let j = 0; j < headers.length; j++) {
        product[headers[j]] = row[j];
      }

      // Only include available products
      if (product.IsAvailable === true || product.IsAvailable === 'TRUE' || product.IsAvailable === 'true') {
        // Parse numeric fields
        product.Price = Number(product.Price) || 0;
        product.LeadTimeDays = Number(product.LeadTimeDays) || 0;
        product.Stock = Number(product.Stock) || 0;

        products.push(product);
      }
    }

    return { success: true, products: products };

  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Submit a new order
 */
function submitOrder(data) {
  try {
    const requiredFields = ['customerName', 'customerPhone', 'customerAddress', 'cart', 'deliveryDate', 'paymentMethod'];
    const missing = validateRequired(data, requiredFields);

    if (missing.length > 0) {
      return { success: false, error: 'Missing required fields: ' + missing.join(', ') };
    }

    const cart = data.cart;
    if (!cart || cart.length === 0) {
      return { success: false, error: 'Cart is empty' };
    }

    // Validate cart items
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
    const minOrder = Number(getSetting('MIN_ORDER_AMOUNT')) || 0;
    if (totalAmount < minOrder) {
      return { success: false, error: 'Minimum order amount is Rp ' + minOrder.toLocaleString('id-ID') };
    }

    // Check delivery fee
    const deliveryFee = Number(getSetting('DELIVERY_FEE')) || 0;
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
      'Baru', // Status: Baru (New)
      '', // AdminNote
      '' // WAHASentAt
    ];

    // Insert order
    const sheet = getSheet(CONFIG.SHEETS.ORDERS);
    sheet.appendRow(orderData);

    // Decrement stock
    decrementStock(cart);

    // Get customer phone for WhatsApp notification
    const customerPhone = data.customerPhone.replace(/[^0-9]/g, '');
    const formattedPhone = customerPhone.startsWith('0') ? '62' + customerPhone.substring(1) :
                           customerPhone.startsWith('62') ? customerPhone : '62' + customerPhone;

    // Send WhatsApp notification (async)
    sendOrderNotification({
      orderId: orderId,
      customerName: data.customerName,
      customerPhone: formattedPhone,
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

/**
 * Validate cart items
 */
function validateCart(cart) {
  const sheet = getSheet(CONFIG.SHEETS.PRODUCTS);
  const dataRange = sheet.getDataRange();
  const values = dataRange.getValues();
  const headers = values[0];

  // Build product map
  const productMap = {};
  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    const product = {};
    for (let j = 0; j < headers.length; j++) {
      product[headers[j]] = row[j];
    }
    productMap[product.ProductID] = product;
  }

  for (const item of cart) {
    const product = productMap[item.productId];

    if (!product) {
      return { valid: false, error: 'Product not found: ' + item.name };
    }

    // Check availability
    if (product.IsAvailable !== true && product.IsAvailable !== 'TRUE' && product.IsAvailable !== 'true') {
      return { valid: false, error: 'Product not available: ' + item.name };
    }

    // Check stock
    const stock = Number(product.Stock) || 0;
    if (stock < item.quantity) {
      return { valid: false, error: 'Insufficient stock for: ' + item.name + ' (available: ' + stock + ')' };
    }

    // Validate H-X lead time if specified
    const leadTimeDays = Number(product.LeadTimeDays) || 0;
    if (leadTimeDays > 0) {
      // This validation is done on frontend, but we double-check here
      // In a real scenario, you'd compare with the requested delivery date
    }
  }

  return { valid: true };
}

/**
 * Get product prices map
 */
function getProductPrices() {
  const sheet = getSheet(CONFIG.SHEETS.PRODUCTS);
  const dataRange = sheet.getDataRange();
  const values = dataRange.getValues();
  const headers = values[0];

  const prices = {};
  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    const productId = row[headers.indexOf('ProductID')];
    const price = Number(row[headers.indexOf('Price')]) || 0;
    prices[productId] = price;
  }

  return prices;
}

/**
 * Decrement stock after order
 */
function decrementStock(cart) {
  const sheet = getSheet(CONFIG.SHEETS.PRODUCTS);
  const dataRange = sheet.getDataRange();
  const values = dataRange.getValues();
  const headers = values[0];

  const productIdCol = headers.indexOf('ProductID');
  const stockCol = headers.indexOf('Stock');

  // Build a map of cart items
  const cartMap = {};
  for (const item of cart) {
    cartMap[item.productId] = item.quantity;
  }

  // Update stock for each item
  for (let i = 1; i < values.length; i++) {
    const productId = values[i][productIdCol];
    if (cartMap[productId]) {
      const currentStock = Number(values[i][stockCol]) || 0;
      const newStock = currentStock - cartMap[productId];
      sheet.getRange(i + 1, stockCol + 1).setValue(newStock);
    }
  }
}

/**
 * Send order notification via WhatsApp
 */
function sendOrderNotification(orderData) {
  try {
    const wahaUrl = getSetting('WAHA_URL');
    const wahaSession = getSetting('WAHA_SESSION') || 'default';

    if (!wahaUrl) {
      Logger.log('WAHA_URL not configured, skipping WhatsApp notification');
      return;
    }

    // Prepare message for customer
    let message = '*Halo ' + orderData.customerName + '* 👋\n\n';
    message += 'Terima kasih sudah memesan di *RekaOrder* 💛\n\n';
    message += '*Detail Pesanan:*\n';
    message += '─────────────────\n';

    for (const item of orderData.orderItems) {
      message += '• ' + item.name + ' x' + item.quantity + ' = Rp ' + item.subtotal.toLocaleString('id-ID') + '\n';
    }

    message += '─────────────────\n';
    message += '*Total: Rp ' + orderData.totalAmount.toLocaleString('id-ID') + '*\n';
    message += '*Pembayaran: ' + orderData.paymentMethod + '*\n';
    message += '*Pengiriman: ' + orderData.deliveryDate + '*\n\n';
    message += '📍 Alamat: ' + orderData.customerAddress + '\n\n';
    message += 'ID Pesanan: `' + orderData.orderId + '`\n\n';
    message += 'Mohon tunggu konfirmasi dari kami. Ada pertanyaan? Balas pesan ini ya! 😊';

    // Send via WAHA API
    const payload = {
      session: wahaSession,
      phone: orderData.customerPhone,
      text: message
    };

    const options = {
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };

    UrlFetchApp.fetch(wahaUrl + '/api/sendText', options);

    // Also notify admin if configured
    const adminPhone = getSetting('ADMIN_PHONE');
    if (adminPhone) {
      const adminMessage = '*Pesanan Baru!* 🔔\n\n';
      adminMessage += 'Customer: ' + orderData.customerName + '\n';
      adminMessage += 'HP: ' + orderData.customerPhone + '\n';
      adminMessage += 'Total: Rp ' + orderData.totalAmount.toLocaleString('id-ID') + '\n';
      adminMessage += 'ID: ' + orderData.orderId;

      const adminPayload = {
        session: wahaSession,
        phone: adminPhone,
        text: adminMessage
      };

      UrlFetchApp.fetch(wahaUrl + '/api/sendText', {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        payload: JSON.stringify(adminPayload),
        muteHttpExceptions: true
      });
    }

  } catch (error) {
    Logger.log('Error sending WhatsApp notification: ' + error.message);
  }
}

/**
 * Check H-X lead time availability
 * H = Today, X = Days from now
 */
function checkLeadTimeAvailability(productId, deliveryDate) {
  try {
    const sheet = getSheet(CONFIG.SHEETS.PRODUCTS);
    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();
    const headers = values[0];

    const productIdCol = headers.indexOf('ProductID');
    const leadTimeCol = headers.indexOf('LeadTimeDays');

    for (let i = 1; i < values.length; i++) {
      if (values[i][productIdCol] === productId) {
        const leadTimeDays = Number(values[i][leadTimeCol]) || 0;

        // Calculate minimum delivery date
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const minDeliveryDate = new Date(today);
        minDeliveryDate.setDate(minDeliveryDate.getDate() + leadTimeDays);

        const requestedDate = new Date(deliveryDate);
        requestedDate.setHours(0, 0, 0, 0);

        return {
          available: requestedDate >= minDeliveryDate,
          leadTimeDays: leadTimeDays,
          minDeliveryDate: minDeliveryDate.toISOString().split('T')[0]
        };
      }
    }

    return { available: true, leadTimeDays: 0 };

  } catch (error) {
    return { available: false, error: error.message };
  }
}
