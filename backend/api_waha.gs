/**
 * RekaOrder - WAHA WhatsApp API Integration
 * Handles WhatsApp notifications via WAHA (WhatsApp HTTP API)
 *
 * @author RekaOrder
 * @version 1.0.0
 */

/**
 * Send WhatsApp message via WAHA
 */
function sendWhatsAppMessage(phone, message) {
  try {
    const wahaUrl = getSetting('WAHA_URL');
    const wahaSession = getSetting('WAHA_SESSION') || 'default';

    if (!wahaUrl) {
      return { success: false, error: 'WAHA_URL not configured' };
    }

    // Format phone number
    const formattedPhone = formatPhoneNumber(phone);

    const payload = {
      session: wahaSession,
      phone: formattedPhone,
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

    const response = UrlFetchApp.fetch(wahaUrl + '/api/sendText', options);
    const responseData = JSON.parse(response.getResponseText());

    if (response.getResponseCode() === 200 && responseData.success) {
      return { success: true, message: 'Message sent' };
    } else {
      return { success: false, error: responseData.error || 'Failed to send message' };
    }

  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Send WhatsApp message with buttons
 */
function sendWhatsAppMessageWithButtons(phone, message, buttons) {
  try {
    const wahaUrl = getSetting('WAHA_URL');
    const wahaSession = getSetting('WAHA_SESSION') || 'default';

    if (!wahaUrl) {
      return { success: false, error: 'WAHA_URL not configured' };
    }

    const formattedPhone = formatPhoneNumber(phone);

    const payload = {
      session: wahaSession,
      phone: formattedPhone,
      text: message,
      buttons: buttons
    };

    const options = {
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };

    const response = UrlFetchApp.fetch(wahaUrl + '/api/sendButtons', options);
    const responseData = JSON.parse(response.getResponseText());

    return {
      success: response.getResponseCode() === 200,
      data: responseData
    };

  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Send WhatsApp image
 */
function sendWhatsAppImage(phone, imageUrl, caption) {
  try {
    const wahaUrl = getSetting('WAHA_URL');
    const wahaSession = getSetting('WAHA_SESSION') || 'default';

    if (!wahaUrl) {
      return { success: false, error: 'WAHA_URL not configured' };
    }

    const formattedPhone = formatPhoneNumber(phone);

    const payload = {
      session: wahaSession,
      phone: formattedPhone,
      url: imageUrl,
      caption: caption
    };

    const options = {
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };

    const response = UrlFetchApp.fetch(wahaUrl + '/api/sendImage', options);

    return {
      success: response.getResponseCode() === 200,
      response: JSON.parse(response.getResponseText())
    };

  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Send order confirmation message to customer
 */
function sendOrderConfirmation(phone, orderData) {
  const message = buildOrderConfirmationMessage(orderData);
  return sendWhatsAppMessage(phone, message);
}

/**
 * Send order status update to customer
 */
function sendStatusUpdate(phone, orderId, status, message) {
  const text = `*Update Pesanan #${orderId}*\n\nStatus: *${status}*\n\n${message || 'Pesananmu sudah diupdate ya!'}\n\nHubungi kami jika ada pertanyaan.`;
  return sendWhatsAppMessage(phone, text);
}

/**
 * Send daily order summary to admin
 */
function sendDailySummaryToAdmin(adminPhone) {
  try {
    // Get today's orders
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sheet = getSheet(CONFIG.SHEETS.ORDERS);
    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();
    const headers = values[0];

    const timestampCol = headers.indexOf('Timestamp');
    const statusCol = headers.indexOf('Status');
    const amountCol = headers.indexOf('TotalAmount');
    const nameCol = headers.indexOf('CustomerName');

    let count = 0;
    let revenue = 0;

    for (let i = 1; i < values.length; i++) {
      const timestamp = new Date(values[i][timestampCol]);
      if (timestamp >= today) {
        count++;
        revenue += Number(values[i][amountCol]) || 0;

        if (values[i][statusCol] === 'Baru') {
          // New order notification
          const orderMsg = `*Pesanan Baru!*\n`;
          const name = values[i][nameCol] || 'Customer';
          const amount = Number(values[i][amountCol]) || 0;
          const orderMsgFull = orderMsg + `Customer: ${name}\nTotal: Rp ${amount.toLocaleString('id-ID')}`;
          sendWhatsAppMessage(adminPhone, orderMsgFull);
        }
      }
    }

    const summaryMessage = `*RekaOrder - Ringkasan Harian*\n\n`;
    const todayStr = Utilities.formatDate(today, 'Asia/Jakarta', 'dd MMM yyyy');
    const summary = `📅 ${todayStr}\n`;
    const summary2 = `🛒 Pesanan hari ini: ${count}\n`;
    const summary3 = `💰 Total revenue: Rp ${revenue.toLocaleString('id-ID')}`;

    return sendWhatsAppMessage(adminPhone, summaryMessage + summary + summary2 + summary3);

  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Format phone number for WAHA
 */
function formatPhoneNumber(phone) {
  // Remove all non-numeric characters
  let cleaned = phone.replace(/[^0-9]/g, '');

  // Handle different formats
  if (cleaned.startsWith('0')) {
    // 0812... -> 62812...
    cleaned = '62' + cleaned.substring(1);
  } else if (!cleaned.startsWith('62')) {
    // 812... -> 62812...
    cleaned = '62' + cleaned;
  }

  return cleaned;
}

/**
 * Build order confirmation message
 */
function buildOrderConfirmationMessage(orderData) {
  let message = '*Halo ' + orderData.customerName + '* 👋\n\n';
  message += 'Terima kasih sudah memesan di *RekaOrder* 💛\n\n';
  message += '*📝 Detail Pesanan:*\n';
  message += '─────────────────\n';

  if (orderData.orderItems && orderData.orderItems.length > 0) {
    for (const item of orderData.orderItems) {
      message += `• ${item.name} x${item.quantity} = Rp ${item.subtotal.toLocaleString('id-ID')}\n`;
    }
  }

  message += '─────────────────\n';
  message += `*Total: Rp ${orderData.totalAmount.toLocaleString('id-ID')}*\n`;
  message += `*Pembayaran: ${orderData.paymentMethod}*\n`;
  message += `*Pengiriman: ${orderData.deliveryDate}*\n\n`;
  message += `📍 Alamat: ${orderData.customerAddress}\n\n`;
  message += `🎫 ID Pesanan: \`${orderData.orderId}\`\n\n`;
  message += 'Mohon tunggu konfirmasi dari kami ya! 😊\n';
  message += 'Ada pertanyaan? Balas pesan ini aja!';

  return message;
}

/**
 * Check WAHA connection status
 */
function checkWAHAStatus() {
  try {
    const wahaUrl = getSetting('WAHA_URL');
    const wahaSession = getSetting('WAHA_SESSION') || 'default';

    if (!wahaUrl) {
      return { success: false, error: 'WAHA_URL not configured' };
    }

    const options = {
      method: 'get',
      muteHttpExceptions: true
    };

    const response = UrlFetchApp.fetch(wahaUrl + '/api/session/' + wahaSession + '/status', options);
    const data = JSON.parse(response.getResponseText());

    return {
      success: response.getResponseCode() === 200,
      status: data,
      session: wahaSession
    };

  } catch (error) {
    return { success: false, error: error.message };
  }
}
