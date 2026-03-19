/**
 * RekaOrder - Main Entry Point
 * Routes requests to appropriate handlers
 *
 * @author RekaOrder
 * @version 2.0.0
 */

// Configuration loaded from shared/config.gs

/**
 * Main doGet - serves the PWA
 */
function doGet(e) {
  const path = e.parameter.path || 'customer';

  if (path === 'admin') {
    return serveHtml('frontend/admin/dashboard', 'RekaOrder - Admin Dashboard');
  }

  return serveHtml('frontend/customer/shell', 'RekaOrder - Pre Order');
}

/**
 * Serve HTML template
 */
function serveHtml(templateName, title) {
  return HtmlService.createTemplateFromFile(templateName)
    .evaluate()
    .setTitle(title)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no')
    .addMetaTag('theme-color', '#C0622F');
}

/**
 * doPost - API routing
 */
function doPost(e) {
  const postData = JSON.parse(e.postData.contents);
  const action = postData.action;

  try {
    let result;

    switch (action) {
      // Customer APIs
      case 'getProducts':
        result = getProducts(postData);
        break;
      case 'submitOrder':
        result = submitOrder(postData);
        break;
      case 'getSettings':
        result = getSettings();
        break;

      // Admin APIs
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
        result = updateSetting(postData.key, postData.value);
        break;
      case 'getOrderStats':
        result = getOrderStats();
        break;

      // Image APIs
      case 'uploadImage':
        result = uploadImageBase64(postData);
        break;
      case 'deleteImage':
        result = deleteImage(postData.fileId);
        break;

      // Config APIs
      case 'setSpreadsheetId':
        result = setSpreadsheetId(postData.spreadsheetId);
        break;
      case 'getConfigStatus':
        result = getConfigStatus();
        break;

      default:
        result = { success: false, error: 'Unknown action: ' + action };
    }

    return jsonResponse(result);

  } catch (error) {
    return jsonResponse({ success: false, error: error.message });
  }
}

/**
 * Include HTML file content
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/**
 * JSON response helper
 */
function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
