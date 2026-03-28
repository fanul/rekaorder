/**
 * Cart Module - Handles shopping cart operations
 * Refactored from vue_app.html for better maintainability
 */

class CartModule {
  constructor() {
    this.cart = ref([]);
    this.deliveryFee = ref(0);
  }

  /**
   * Load cart from localStorage
   */
  loadFromStorage() {
    const saved = localStorage.getItem('rekaorder_cart');
    if (saved) {
      try {
        this.cart.value = JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing cart:', e);
        this.cart.value = [];
      }
    }
  }

  /**
   * Save cart to localStorage
   */
  saveToStorage() {
    localStorage.setItem('rekaorder_cart', JSON.stringify(this.cart.value));
  }

  /**
   * Add item to cart
   */
  addItem(product, quantity) {
    const item = {
      productId: product.ProductID,
      name: product.Name,
      price: product.Price,
      quantity: quantity,
      ImageURL: product.ImageURL,
      LeadTimeDays: product.LeadTimeDays || 0
    };

    const existing = this.cart.value.find(c => c.productId === item.productId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      this.cart.value.push(item);
    }

    this.saveToStorage();
  }

  /**
   * Update item quantity
   */
  updateQuantity(index, newQty) {
    if (newQty <= 0) {
      this.removeItem(index);
    } else {
      this.cart.value[index].quantity = newQty;
      this.saveToStorage();
    }
  }

  /**
   * Remove item from cart
   */
  removeItem(index) {
    if (index >= 0 && index < this.cart.value.length) {
      this.cart.value.splice(index, 1);
      this.saveToStorage();
    }
  }

  /**
   * Clear entire cart
   */
  clear() {
    this.cart.value = [];
    this.saveToStorage();
  }

  /**
   * Get cart subtotal (without delivery fee)
   */
  getSubtotal() {
    return this.cart.value.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  /**
   * Get cart total (with delivery fee)
   */
  getTotal() {
    return this.getSubtotal() + this.deliveryFee.value;
  }

  /**
   * Set delivery fee
   */
  setDeliveryFee(fee) {
    this.deliveryFee.value = Number(fee) || 0;
  }

  /**
   * Check if cart is empty
   */
  isEmpty() {
    return this.cart.value.length === 0;
  }

  /**
   * Get cart item count
   */
  getItemCount() {
    return this.cart.value.reduce((sum, item) => sum + item.quantity, 0);
  }

  /**
   * Format price to IDR
   */
  formatPrice(price) {
    return 'Rp ' + Number(price).toLocaleString('id-ID');
  }

  /**
   * Load delivery fee from settings
   */
  loadDeliveryFee() {
    return new Promise((resolve, reject) => {
      google.script.run
        .withSuccessHandler((r) => {
          this.deliveryFee.value = Number(r.DELIVERY_FEE) || 0;
          resolve(this.deliveryFee.value);
        })
        .withFailureHandler(reject)
        .getSettings();
    });
  }
}

// Export for use in customer app
window.CartModule = CartModule;
