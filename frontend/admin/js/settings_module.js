/**
 * Settings Module - Handles settings management
 * Refactored from dashboard.html for better maintainability
 */

class SettingsModule {
  constructor() {
    this.settings = ref({
      STORE_NAME: '',
      MIN_ORDER_AMOUNT: '0',
      DELIVERY_FEE: '0',
      WAHA_URL: '',
      WAHA_SESSION: 'default',
      ADMIN_PHONE: '',
      ADMIN_EMAILS: ''
    });
    this.categories = ref(['Makanan', 'Minuman', 'Snack', 'Dessert']);
    this.loading = ref(false);
    this.error = ref(null);
  }

  /**
   * Load settings from backend
   */
  async loadSettings() {
    this.loading.value = true;
    this.error.value = null;

    try {
      const result = await this.callBackend('getSettings');
      this.settings.value = { ...this.settings.value, ...result };
      // Also load categories
      await this.loadCategories();
    } catch (e) {
      console.error('Error loading settings:', e);
      this.error.value = e.message;
    } finally {
      this.loading.value = false;
    }
  }

  /**
   * Load categories from backend
   */
  async loadCategories() {
    try {
      const cats = await this.callBackend('getCategories');
      if (cats && cats.length > 0) {
        this.categories.value = cats;
      }
    } catch (e) {
      console.error('Error loading categories:', e);
    }
  }

  /**
   * Save categories to backend
   */
  saveCategories() {
    this.callBackend('setCategories', this.categories.value.join(', '));
  }

  /**
   * Save settings to backend
   */
  async saveSettings() {
    this.loading.value = true;
    this.error.value = null;

    try {
      const promises = [];
      for (const [key, value] of Object.entries(this.settings.value)) {
        promises.push(
          this.callBackend('updateSettings', { key, value })
        );
      }
      await Promise.all(promises);
      return { success: true };
    } catch (e) {
      console.error('Error saving settings:', e);
      this.error.value = e.message;
      return { success: false, error: e.message };
    } finally {
      this.loading.value = false;
    }
  }

  /**
   * Get default settings
   */
  getDefaults() {
    return {
      STORE_NAME: 'RekaOrder',
      MIN_ORDER_AMOUNT: '0',
      DELIVERY_FEE: '0',
      WAHA_URL: '',
      WAHA_SESSION: 'default',
      ADMIN_PHONE: ''
    };
  }

  /**
   * Reset to defaults
   */
  resetToDefaults() {
    this.settings.value = this.getDefaults();
  }

  /**
   * Format date to Indonesian locale
   */
  formatDate(date) {
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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
if (typeof window !== 'undefined') {
  window.SettingsModule = SettingsModule;
}
