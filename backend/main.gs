/**
 * RekaOrder - Main Entry Point
 * Handles routing for frontend and API endpoints
 *
 * @author RekaOrder
 * @version 1.0.0
 */

// Configuration - Replace with your Spreadsheet ID
const CONFIG = {
  SPREADSHEET_ID: 'YOUR_SPREADSHEET_ID_HERE',
  SHEETS: {
    PRODUCTS: 'Products',
    ORDERS: 'Orders',
    SETTINGS: 'Settings'
  }
};

/**
 * Main doGet handler - serves the PWA
 */
function doGet(e) {
  const path = e.parameter.path || 'customer';
  const mode = e.parameter.mode || 'view';

  // Route to appropriate HTML
  if (path === 'admin') {
    return HtmlService.createTemplateFromFile('frontend/admin/dashboard')
      .evaluate()
      .setTitle('RekaOrder - Admin Dashboard')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');
  }

  // Default to customer PWA
  return HtmlService.createTemplateFromFile('frontend/customer/index_cart_order')
    .evaluate()
    .setTitle('RekaOrder - Pre Order Makanan')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no')
    .addMetaTag('theme-color', '#C0622F')
    .addMetaTag('description', 'RekaOrder - Pre Order Makanan Favoritmu');
}

/**
 * doPost handler for API calls
 */
function doPost(e) {
  const postData = JSON.parse(e.postData.contents);
  const action = postData.action;

  try {
    let result;

    switch (action) {
      // Customer actions
      case 'getProducts':
        result = getProducts(postData);
        break;
      case 'submitOrder':
        result = submitOrder(postData);
        break;
      case 'getSettings':
        result = getSettings();
        break;

      // Admin actions
      case 'getAllOrders':
        result = getAllOrders(postData);
        break;
      case 'updateOrderStatus':
        result = updateOrderStatus(postData);
        break;
      case 'getProductsAdmin':
        result = getProductsAdmin(postData);
        break;
      case 'addProduct':
        result = addProduct(postData);
        break;
      case 'updateProduct':
        result = updateProduct(postData);
        break;
      case 'deleteProduct':
        result = deleteProduct(postData);
        break;
      case 'toggleProductAvailability':
        result = toggleProductAvailability(postData);
        break;
      case 'exportOrdersCSV':
        result = exportOrdersCSV(postData);
        break;
      case 'updateSettings':
        result = updateSettings(postData);
        break;

      // Image upload
      case 'uploadImage':
        result = uploadImageBase64(postData);
        break;
      case 'deleteImage':
        result = deleteImage(postData.fileId);
        break;

      default:
        result = { success: false, error: 'Unknown action: ' + action };
    }

    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.message
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Include HTML content from a file
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/**
 * Get spreadsheet instance
 */
function getSpreadsheet() {
  return SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
}

/**
 * Get a sheet by name
 */
function getSheet(sheetName) {
  const spreadsheet = getSpreadsheet();
  return spreadsheet.getSheetByName(sheetName);
}

/**
 * Generate unique ID
 */
function generateId(prefix) {
  const timestamp = new Date().getTime().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return prefix + '_' + timestamp + '_' + random;
}

/**
 * Format date for display
 */
function formatDate(date) {
  return Utilities.formatDate(new Date(date), 'Asia/Jakarta', 'dd MMM yyyy, HH:mm');
}

/**
 * Format currency
 */
function formatCurrency(amount) {
  return 'Rp ' + Number(amount).toLocaleString('id-ID');
}

/**
 * Get setting value by key
 */
function getSetting(key) {
  const sheet = getSheet(CONFIG.SHEETS.SETTINGS);
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === key) {
      return data[i][1];
    }
  }
  return null;
}

/**
 * Get all settings as object
 */
function getSettings() {
  const sheet = getSheet(CONFIG.SHEETS.SETTINGS);
  const data = sheet.getDataRange().getValues();
  const settings = {};

  for (let i = 1; i < data.length; i++) {
    if (data[i][0]) {
      settings[data[i][0]] = data[i][1];
    }
  }

  return settings;
}

/**
 * Validate required fields
 */
function validateRequired(data, fields) {
  const missing = [];
  for (const field of fields) {
    if (!data[field] || data[field].toString().trim() === '') {
      missing.push(field);
    }
  }
  return missing;
}

/**
 * Send JSON response
 */
function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
