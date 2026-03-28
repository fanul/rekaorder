/**
 * Product Module - Handles product CRUD operations
 * Refactored from dashboard.html for better maintainability
 */

class ProductModule {
  constructor() {
    this.products = ref([]);
    this.loading = ref(false);
    this.error = ref(null);
  }

  /**
   * Load all products from backend
   */
  async loadProducts() {
    this.loading.value = true;
    this.error.value = null;

    try {
      const result = await this.callBackend('getProductsAdmin', {});
      if (result.success) {
        this.products.value = result.products || [];
      } else {
        this.error.value = result.error || 'Gagal memuat produk';
      }
    } catch (e) {
      console.error('Error loading products:', e);
      this.error.value = e.message;
    } finally {
      this.loading.value = false;
    }
  }

  /**
   * Add new product
   */
  async addProduct(productData) {
    try {
      const result = await this.callBackend('addProduct', productData);
      return result;
    } catch (e) {
      console.error('Error adding product:', e);
      return { success: false, error: e.message };
    }
  }

  /**
   * Update existing product
   */
  async updateProduct(productData) {
    try {
      const result = await this.callBackend('updateProduct', productData);
      return result;
    } catch (e) {
      console.error('Error updating product:', e);
      return { success: false, error: e.message };
    }
  }

  /**
   * Delete product
   */
  async deleteProduct(productId) {
    try {
      const result = await this.callBackend('deleteProduct', { ProductID: productId });
      return result;
    } catch (e) {
      console.error('Error deleting product:', e);
      return { success: false, error: e.message };
    }
  }

  /**
   * Toggle product availability
   */
  async toggleAvailability(productId) {
    try {
      const result = await this.callBackend('toggleProductAvailability', { ProductID: productId });
      return result;
    } catch (e) {
      console.error('Error toggling availability:', e);
      return { success: false, error: e.message };
    }
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

  /**
   * Get default product form
   */
  getDefaultForm() {
    return {
      Name: '',
      Description: '',
      Category: 'Makanan',
      Price: 0,
      LeadTimeDays: 0,
      Stock: 0,
      Images: '',
      Tags: ''
    };
  }

  /**
   * Format price to IDR
   */
  formatPrice(price) {
    return 'Rp ' + Number(price).toLocaleString('id-ID');
  }
}

// Export for use in dashboard
window.ProductModule = ProductModule;
