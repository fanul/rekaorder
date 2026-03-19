/**
 * RekaOrder - Image Upload Handler
 * Handles image uploads to Google Drive
 *
 * @author RekaOrder
 * @version 1.0.0
 */

/**
 * Configuration for image storage
 */
const IMAGE_CONFIG = {
  FOLDER_ID: '1W1hlwriONNgwOU2QSSZbwIT8rXpXhumM', // Your specified folder ID
  MAX_SIZE_MB: 5,
  ALLOWED_EXTENSIONS: ['jpg', 'jpeg', 'png', 'gif', 'webp']
};

/**
 * Upload image from frontend (base64)
 * Called via google.script.run
 */
function uploadImageBase64(data) {
  try {
    const { imageData, fileName, productId } = data;

    if (!imageData || !fileName) {
      return { success: false, error: 'Image data and file name are required' };
    }

    // Validate file extension
    const extension = fileName.split('.').pop().toLowerCase();
    if (!IMAGE_CONFIG.ALLOWED_EXTENSIONS.includes(extension)) {
      return { success: false, error: 'File type not allowed. Use: jpg, jpeg, png, gif, or webp' };
    }

    // Decode base64 data
    let byteCharacters;
    try {
      // Handle data URL format (data:image/jpeg;base64,...)
      if (imageData.includes('base64,')) {
        byteCharacters = Utilities.base64Decode(imageData.split('base64,')[1]);
      } else {
        byteCharacters = Utilities.base64Decode(imageData);
      }
    } catch (e) {
      return { success: false, error: 'Invalid base64 data' };
    }

    // Check file size
    const sizeMB = (byteCharacters.length / (1024 * 1024));
    if (sizeMB > IMAGE_CONFIG.MAX_SIZE_MB) {
      return { success: false, error: 'File too large. Maximum size is ' + IMAGE_CONFIG.MAX_SIZE_MB + 'MB' };
    }

    // Generate unique filename
    const timestamp = new Date().getTime();
    const uniqueFileName = productId
      ? `${productId}_${timestamp}.${extension}`
      : `product_${timestamp}.${extension}`;

    // Get or create the upload folder
    let folder;
    try {
      folder = DriveApp.getFolderById(IMAGE_CONFIG.FOLDER_ID);
    } catch (e) {
      // If folder doesn't exist, create it in root
      folder = DriveApp.createFolder('RekaOrder Images');
    }

    // Create the file
    const blob = Utilities.newBlob(byteCharacters, 'image/' + extension, uniqueFileName);
    const file = folder.createFile(blob);

    // Set file sharing to anyone with link (for viewing)
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    // Get the direct URL for viewing
    const webViewLink = file.getDownloadUrl().replace('&export=download', '');

    // Get thumbnail URL (using Google's thumbnail service)
    const thumbnailUrl = `https://drive.google.com/thumbnail?id=${file.getId()}&width=400`;

    // Return both URLs
    return {
      success: true,
      fileId: file.getId(),
      fileName: uniqueFileName,
      webViewLink: webViewLink,
      thumbnailUrl: thumbnailUrl,
      directLink: `https://drive.google.com/uc?export=download&id=${file.getId()}`
    };

  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Delete image from Drive
 */
function deleteImage(fileId) {
  try {
    if (!fileId) {
      return { success: false, error: 'File ID is required' };
    }

    const file = DriveApp.getFileById(fileId);
    file.setTrashed(true);

    return { success: true, message: 'Image deleted successfully' };

  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Get image URL from Drive file ID
 * Use this to convert stored file IDs to usable URLs
 * Uses docs.google.com format for reliable display
 */
function getImageUrl(fileIdOrUrl) {
  if (!fileIdOrUrl) return '';

  // If it's already a URL, return as-is
  if (fileIdOrUrl.startsWith('http')) {
    return fileIdOrUrl;
  }

  // If it's a file ID, generate the URL using docs.google.com format
  // This format works reliably for displaying images in web apps
  return `https://docs.google.com/uc?export=download&id=${fileIdOrUrl}`;
}

/**
 * Get multiple image URLs from comma-separated file IDs
 * Returns array of objects with id and url
 */
function getImageUrls(imageIds) {
  if (!imageIds) return [];

  const ids = imageIds.split(',').map(id => id.trim()).filter(id => id);
  return ids.map(id => ({
    id: id,
    url: getImageUrl(id)
  }));
}

/**
 * Process product images for frontend display
 * Converts stored image IDs to viewable URLs
 */
function processProductImages(imagesField) {
  if (!imagesField) return [];

  // Check if it's already a JSON array
  try {
    const parsed = JSON.parse(imagesField);
    if (Array.isArray(parsed)) {
      return parsed.map(img => ({
        id: img.id || img,
        url: img.url || getImageUrl(img.id || img)
      }));
    }
  } catch (e) {
    // Not JSON, try comma-separated
  }

  // Comma-separated IDs
  const ids = imagesField.split(',').map(id => id.trim()).filter(id => id);
  return ids.map(id => ({
    id: id,
    url: getImageUrl(id)
  }));
}

/**
 * List images in the upload folder
 */
function listUploadFolderImages() {
  try {
    const folder = DriveApp.getFolderById(IMAGE_CONFIG.FOLDER_ID);
    const files = folder.getFiles();

    const images = [];
    while (files.hasNext()) {
      const file = files.next();
      if (file.getMimeType().startsWith('image/')) {
        images.push({
          id: file.getId(),
          name: file.getName(),
          url: `https://drive.google.com/uc?export=download&id=${file.getId()}`,
          date: file.getDateCreated()
        });
      }
    }

    return { success: true, images: images.reverse() };

  } catch (error) {
    return { success: false, error: error.message };
  }
}
