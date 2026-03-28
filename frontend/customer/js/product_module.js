/**
 * Product Module - Handles product display and filtering
 * Refactored from vue_app.html for better maintainability
 */

class ProductDisplayModule {
  constructor() {
    this.products = ref([]);
    this.categories = ref(['Makanan', 'Minuman', 'Snack', 'Dessert']);
    this.selectedCategory = ref('all');
    this.searchQuery = ref('');
    this.loading = ref(true);
  }

  /**
   * Load products from backend
   */
  async loadProducts() {
    this.loading.value = true;

    try {
      const result = await this.callBackend('getProducts', {});
      if (result.success) {
        this.products.value = result.products || [];
        this.extractCategories();
      }
    } catch (e) {
      console.error('Error loading products:', e);
    } finally {
      this.loading.value = false;
    }
  }

  /**
   * Load categories from backend
   */
  async loadCategories() {
    try {
      const cats = await this.callBackend('getCategories', {});
      if (cats && cats.length > 0) {
        this.categories.value = ['all'].concat(cats);
      }
    } catch (e) {
      console.error('Error loading categories:', e);
    }
  }

  /**
   * Extract unique categories from products
   */
  extractCategories() {
    const uniqueCategories = ['all'];
    this.products.value.forEach(p => {
      if (p.Category && !uniqueCategories.includes(p.Category)) {
        uniqueCategories.push(p.Category);
      }
    });
    this.categories.value = uniqueCategories;
  }

  /**
   * Get filtered products based on category and search
   */
  getFiltered() {
    let result = this.products.value;

    // Filter by category
    if (this.selectedCategory.value !== 'all') {
      result = result.filter(p => p.Category === this.selectedCategory.value);
    }

    // Filter by search query
    if (this.searchQuery.value) {
      const query = this.searchQuery.value.toLowerCase();
      result = result.filter(p =>
        p.Name.toLowerCase().includes(query) ||
        (p.Description && p.Description.toLowerCase().includes(query))
      );
    }

    return result;
  }

  /**
   * Set selected category
   */
  setCategory(category) {
    this.selectedCategory.value = category;
  }

  /**
   * Set search query
   */
  setSearchQuery(query) {
    this.searchQuery.value = query;
  }

  /**
   * Clear search
   */
  clearSearch() {
    this.searchQuery.value = '';
  }

  /**
   * Check if product is preorder
   */
  isPreorder(product) {
    return product.ProductType === 'Preorder';
  }

  /**
   * Check if product is available
   */
  isAvailable(product) {
    if (this.isPreorder(product)) return true;
    return (product.Stock || 0) > 0;
  }

  /**
   * Get stock display text
   */
  getStockText(product) {
    if (this.isPreorder(product)) {
      const leadTime = product.LeadTimeDays || 0;
      return leadTime > 0 ? `Preorder H+${leadTime}` : 'Preorder';
    }
    const stock = product.Stock || 0;
    return stock > 0 ? `Stok: ${stock}` : 'Habis';
  }

  /**
   * Get max quantity for product
   */
  getMaxQuantity(product) {
    if (this.isPreorder(product)) return 999;
    return product.Stock || 0;
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
window.ProductDisplayModule = ProductDisplayModule;
