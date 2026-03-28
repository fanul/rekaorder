/**
 * Order Module - Handles order management operations
 * Refactored from dashboard.html for better maintainability
 */

class OrderModule {
  constructor() {
    this.orders = ref([]);
    this.loading = ref(false);
    this.error = ref(null);
  }

  /**
   * Load all orders from backend
   */
  async loadOrders() {
    this.loading.value = true;
    this.error.value = null;

    try {
      const result = await this.callBackend('getAllOrders', {});
      if (result.success) {
        this.orders.value = result.orders || [];
      } else {
        this.error.value = result.error || 'Gagal memuat pesanan';
      }
    } catch (e) {
      console.error('Error loading orders:', e);
      this.error.value = e.message;
    } finally {
      this.loading.value = false;
    }
  }

  /**
   * Update order status
   */
  async updateStatus(orderId, newStatus) {
    try {
      await this.callBackend('updateOrderStatus', {
        orderId: orderId,
        status: newStatus
      });
      // Update local state
      const order = this.orders.value.find(o => o.OrderID === orderId);
      if (order) order.Status = newStatus;
      return { success: true };
    } catch (e) {
      console.error('Error updating status:', e);
      return { success: false, error: e.message };
    }
  }

  /**
   * Export orders to CSV
   */
  async exportCSV() {
    try {
      const result = await this.callBackend('exportOrdersCSV', {});
      if (result.success && result.fileUrl) {
        window.open(result.fileUrl, '_blank');
        return { success: true };
      }
      return { success: false, error: 'Gagal export' };
    } catch (e) {
      console.error('Error exporting orders:', e);
      return { success: false, error: e.message };
    }
  }

  /**
   * Parse cart JSON to array
   */
  parseCart(cartJson) {
    try {
      return JSON.parse(cartJson);
    } catch {
      return [];
    }
  }

  /**
   * Get order statistics
   */
  getStats() {
    return this.orders.value.reduce((acc, o) => {
      acc.total++;
      if (o.Status === 'Baru') acc.baru++;
      if (['Dikonfirmasi', 'Diproses', 'Siap'].includes(o.Status)) acc.diproses++;
      if (o.Status === 'Selesai') {
        acc.selesai++;
        acc.totalRevenue += Number(o.TotalAmount) || 0;
      }
      return acc;
    }, { total: 0, baru: 0, diproses: 0, selesai: 0, totalRevenue: 0 });
  }

  /**
   * Filter orders by status
   */
  filterByStatus(orders, status) {
    if (!status) return orders;
    return orders.filter(o => o.Status === status);
  }

  /**
   * Format price to IDR
   */
  formatPrice(price) {
    return 'Rp ' + Number(price).toLocaleString('id-ID');
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

// Export for use in dashboard
window.OrderModule = OrderModule;
