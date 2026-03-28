/**
 * Order Module - Handles order submission
 * Refactored from vue_app.html for better maintainability
 */

class OrderSubmissionModule {
  constructor() {
    this.submitting = ref(false);
    this.lastOrderId = ref('');
    this.myOrders = ref([]);
    this.paymentMethods = ref(['Transfer Bank', 'COD', 'E-Wallet']);
  }

  /**
   * Validate order data
   */
  validate(customerName, customerPhone, customerAddress, deliveryDate, paymentMethod) {
    const errors = [];

    if (!customerName || !customerName.trim()) {
      errors.push('Nama harus diisi');
    }

    if (!customerPhone || !customerPhone.trim()) {
      errors.push('Nomor WhatsApp harus diisi');
    }

    if (!customerAddress || !customerAddress.trim()) {
      errors.push('Alamat harus diisi');
    }

    if (!deliveryDate) {
      errors.push('Tanggal pengambilan harus diisi');
    }

    if (!paymentMethod) {
      errors.push('Metode pembayaran harus dipilih');
    }

    return errors;
  }

  /**
   * Submit order to backend
   */
  async submit(orderData) {
    this.submitting.value = true;

    try {
      const result = await this.callBackend('submitOrder', {
        customerName: orderData.customerName,
        customerPhone: orderData.customerPhone,
        customerAddress: orderData.customerAddress,
        deliveryDate: orderData.deliveryDate,
        paymentMethod: orderData.paymentMethod,
        cart: orderData.cart
      });

      if (result.success) {
        this.lastOrderId.value = result.orderId;
        // Add to local orders list
        this.myOrders.value.unshift({
          OrderID: result.orderId,
          Timestamp: new Date().toISOString(),
          TotalAmount: result.totalAmount,
          Status: 'Baru'
        });
        return { success: true, orderId: result.orderId };
      } else {
        return { success: false, error: result.error || 'Gagal submit pesanan' };
      }
    } catch (e) {
      console.error('Error submitting order:', e);
      return { success: false, error: e.message };
    } finally {
      this.submitting.value = false;
    }
  }

  /**
   * Generate WhatsApp link for order confirmation
   */
  generateWhatsAppLink(orderId, customerName) {
    const message = `Halo RekaOrder, saya ${customerName} ingin konfirmasi pesanan saya dengan ID: ${orderId}`;
    return 'https://wa.me/?text=' + encodeURIComponent(message);
  }

  /**
   * Get minimum delivery date (tomorrow)
   */
  getMinDeliveryDate() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  }

  /**
   * Reset form after successful submission
   */
  resetForm(customerNameRef, customerPhoneRef, customerAddressRef, deliveryDateRef) {
    customerNameRef.value = '';
    customerPhoneRef.value = '';
    customerAddressRef.value = '';
    deliveryDateRef.value = this.getMinDeliveryDate();
  }

  /**
   * Helper: Call GAS backend
   */
  callBackend(functionName, params) {
    return new Promise((resolve, reject) => {
      google.script.run
        .withSuccessHandler(resolve)
        .withFailureHandler(reject)
        [functionName](params);
    });
  }
}

// Export for use in customer app
if (typeof window !== 'undefined') {
  window.OrderSubmissionModule = OrderSubmissionModule;
}
