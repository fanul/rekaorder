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
  const setup = e.parameter.setup;

  // Setup route
  if (setup === 'adjustdb') {
    return serveAdjustDbPage();
  }

  if (path === 'admin') {
    // Check admin access
    const userEmail = Session.getActiveUser().getEmail();
    if (!isAdminEmail(userEmail)) {
      return serveAccessDenied();
    }
    return serveHtml('frontend/admin/shell', 'RekaOrder - Admin Dashboard');
  }

  return serveHtml('frontend/customer/shell', 'RekaOrder - Pre Order');
}

/**
 * Serve access denied page
 */
function serveAccessDenied() {
  const html = HtmlService.createHtmlOutput(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Access Denied - RekaOrder</title>
      <script src="https://cdn.tailwindcss.com"></script>
      <style>
        body { font-family: 'Plus Jakarta Sans', sans-serif; }
      </style>
    </head>
    <body class="bg-gray-100 min-h-screen flex items-center justify-center">
      <div class="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center">
        <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
          </svg>
        </div>
        <h1 class="text-2xl font-bold text-gray-800 mb-2">Access Denied</h1>
        <p class="text-gray-600 mb-4">You don't have permission to access this page.</p>
        <p class="text-sm text-gray-500">Please contact the administrator to request access.</p>
        <a href="?" class="inline-block mt-6 px-6 py-2 bg-terracotta text-white rounded-lg hover:bg-opacity-90">Go to Home</a>
      </div>
    </body>
    </html>
  `).setTitle('Access Denied');
  return html;
}

/**
 * Serve HTML template
 */
function serveHtml(templateName, title) {
  return HtmlService.createTemplateFromFile(templateName)
    .evaluate()
    .setTitle(title)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .setSandboxMode(HtmlService.SandboxMode.IFRAME);
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
 * Get script URL for frontend
 */
function getScriptUrl() {
  return ScriptApp.getService().getUrl();
}

/**
 * JSON response helper
 */
function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
