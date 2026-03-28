/**
 * Utils Module - Shared utility functions
 */

const AppUtils = {
  /**
   * Format price to IDR
   */
  formatPrice: function(price) {
    return 'Rp ' + Number(price).toLocaleString('id-ID');
  },

  /**
   * Format date to Indonesian locale
   */
  formatDate: function(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  },

  /**
   * Format date for display (simple)
   */
  formatDateSimple: function(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  },

  /**
   * Show toast notification
   */
  showToast: function(toastRef, message, type) {
    if (type === undefined) type = 'success';
    toastRef.value = { show: true, message: message, type: type };
    setTimeout(function() {
      toastRef.value.show = false;
    }, 3000);
  },

  /**
   * Handle image load error
   */
  handleImageError: function(event) {
    event.target.style.display = 'none';
  },

  /**
   * Debounce function
   */
  debounce: function(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = function() {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  /**
   * Get current date in YYYY-MM-DD format
   */
  getCurrentDate: function() {
    return new Date().toISOString().split('T')[0];
  },

  /**
   * Get tomorrow's date in YYYY-MM-DD format
   */
  getTomorrowDate: function() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  },

  /**
   * Validate phone number (Indonesian format)
   */
  validatePhone: function(phone) {
    // Remove spaces and dashes
    const cleaned = phone.replace(/[\s-]/g, '');
    // Check if starts with 0, +62, or 62
    return /^(\+?62|0)[0-9]{9,12}$/.test(cleaned);
  },

  /**
   * Format phone number to standard format
   */
  formatPhone: function(phone) {
    // Remove all except digits and +
    return phone.replace(/[^0-9+]/g, '');
  }
};

// Export for use in apps
window.AppUtils = AppUtils;
