/**
 * Image Module - Handles image upload and management
 * Refactored from dashboard.html for better maintainability
 */

class ImageModule {
  constructor() {
    this.images = ref([]);
    this.currentIndex = ref(0);
    this.uploading = ref(false);
    this.error = ref(null);
  }

  /**
   * Load existing images from product
   */
  loadImages(product) {
    this.images.value = product.Images || [];
    this.currentIndex.value = 0;
  }

  /**
   * Upload single image
   */
  async uploadImage(file, productId = null) {
    // Validate file
    if (!file) {
      return { success: false, error: 'File tidak ditemukan' };
    }

    if (!file.type.startsWith('image/')) {
      return { success: false, error: 'File harus berupa gambar' };
    }

    if (file.size > 5 * 1024 * 1024) {
      return { success: false, error: 'Ukuran maksimal 5MB' };
    }

    this.uploading.value = true;
    this.error.value = null;

    try {
      const base64Data = await this.readFileAsDataURL(file);
      const result = await this.callBackend('uploadImageBase64', {
        imageData: base64Data,
        fileName: file.name,
        productId: productId
      });

      if (result.success) {
        // Add to images array
        this.images.value.push({
          id: result.fileId,
          url: result.directLink
        });
        return { success: true, image: { id: result.fileId, url: result.directLink } };
      } else {
        this.error.value = result.error || 'Gagal upload gambar';
        return { success: false, error: result.error };
      }
    } catch (e) {
      console.error('Error uploading image:', e);
      this.error.value = e.message;
      return { success: false, error: e.message };
    } finally {
      this.uploading.value = false;
    }
  }

  /**
   * Remove image at index
   */
  removeImage(index) {
    if (index >= 0 && index < this.images.value.length) {
      this.images.value.splice(index, 1);
      // Adjust current index if needed
      if (this.currentIndex.value >= this.images.value.length) {
        this.currentIndex.value = Math.max(0, this.images.value.length - 1);
      }
    }
  }

  /**
   * Navigate to previous image
   */
  prevImage() {
    if (this.images.value.length === 0) return;
    if (this.currentIndex.value > 0) {
      this.currentIndex.value--;
    } else {
      this.currentIndex.value = this.images.value.length - 1;
    }
  }

  /**
   * Navigate to next image
   */
  nextImage() {
    if (this.images.value.length === 0) return;
    if (this.currentIndex.value < this.images.value.length - 1) {
      this.currentIndex.value++;
    } else {
      this.currentIndex.value = 0;
    }
  }

  /**
   * Go to specific image
   */
  goToImage(index) {
    if (index >= 0 && index < this.images.value.length) {
      this.currentIndex.value = index;
    }
  }

  /**
   * Get comma-separated image IDs
   */
  getImageIds() {
    return this.images.value.map(img => img.id).join(',');
  }

  /**
   * Clear all images
   */
  clear() {
    this.images.value = [];
    this.currentIndex.value = 0;
    this.error.value = null;
  }

  /**
   * Reset to initial state
   */
  reset() {
    this.images.value = [];
    this.currentIndex.value = 0;
    this.uploading.value = false;
    this.error.value = null;
  }

  /**
   * Read file as base64 data URL
   */
  readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = () => reject(new Error('Gagal membaca file'));
      reader.readAsDataURL(file);
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
window.ImageModule = ImageModule;
