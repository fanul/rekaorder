/**
 * RekaOrder - Image Upload
 * Upload images to Google Drive
 */

const IMAGE_CONFIG = {
  FOLDER_ID: '1KUThCih1a5qwnkYwC2WboeaZSgYHYDJy',
  MAX_SIZE_MB: 5,
  ALLOWED_EXTENSIONS: ['jpg', 'jpeg', 'png', 'gif', 'webp']
};

function uploadImageBase64(data) {
  try {
    const { imageData, fileName, productId } = data;

    if (!imageData || !fileName) {
      return { success: false, error: 'Image data and file name required' };
    }

    const extension = fileName.split('.').pop().toLowerCase();
    if (!IMAGE_CONFIG.ALLOWED_EXTENSIONS.includes(extension)) {
      return { success: false, error: 'File type not allowed' };
    }

    // Decode base64
    let byteCharacters;
    try {
      byteCharacters = imageData.includes('base64,')
        ? Utilities.base64Decode(imageData.split('base64,')[1])
        : Utilities.base64Decode(imageData);
    } catch (e) {
      return { success: false, error: 'Invalid base64 data' };
    }

    const sizeMB = byteCharacters.length / (1024 * 1024);
    if (sizeMB > IMAGE_CONFIG.MAX_SIZE_MB) {
      return { success: false, error: 'File too large (max 5MB)' };
    }

    const timestamp = new Date().getTime();
    const uniqueFileName = productId
      ? `${productId}_${timestamp}.${extension}`
      : `product_${timestamp}.${extension}`;

    // Get or create folder
    let folder;
    try {
      folder = DriveApp.getFolderById(IMAGE_CONFIG.FOLDER_ID);
    } catch (e) {
      folder = DriveApp.createFolder('RekaOrder Images');
    }

    const blob = Utilities.newBlob(byteCharacters, 'image/' + extension, uniqueFileName);
    const file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    return {
      success: true,
      fileId: file.getId(),
      fileName: uniqueFileName,
      directLink: `https://drive.google.com/uc?export=download&id=${file.getId()}`
    };

  } catch (error) {
    return { success: false, error: error.message };
  }
}

function deleteImage(fileId) {
  try {
    if (!fileId) {
      return { success: false, error: 'File ID required' };
    }
    DriveApp.getFileById(fileId).setTrashed(true);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
