/**
 * Setup Script: Create RekaOrder Spreadsheet
 * Run this script to create the Google Spreadsheet with required sheets
 *
 * How to run:
 * 1. Open this file in Apps Script editor
 * 2. Run the createSpreadsheet() function
 * 3. Check the Logs for the Spreadsheet ID
 *
 * @OnlyCurrentDoc
 */

/**
 * Creates the RekaOrder Spreadsheet with all required sheets
 */
function createSpreadsheet() {
  const FOLDER_ID = '1KUThCih1a5qwnkYwC2WboeaZSgYHYDJy';

  // Create new spreadsheet
  const spreadsheet = SpreadsheetApp.create('RekaOrder Data');

  // Get the spreadsheet ID
  const spreadsheetId = spreadsheet.getId();
  Logger.log('Spreadsheet created with ID: ' + spreadsheetId);

  // Get all sheets
  const sheets = spreadsheet.getSheets();

  // Rename the first sheet to Products
  const firstSheet = sheets[0];
  firstSheet.setName('Products');

  // Get reference to renamed sheet
  const productsSheet = firstSheet;
  // Set headers for Products
  const productsHeaders = [
    'ProductID',
    'Name',
    'Description',
    'Category',
    'Price',
    'LeadTimeDays',
    'Stock',
    'Images',
    'IsAvailable',
    'Tags'
  ];
  productsSheet.getRange(1, 1, 1, productsHeaders.length).setValues([productsHeaders]);
  productsSheet.setFrozenRows(1);

  // Format Products header
  productsSheet.getRange(1, 1, 1, productsHeaders.length)
    .setBackground('#C0622F')
    .setFontColor('#FFFFFF')
    .setFontWeight('bold');

  // Create Orders sheet
  const ordersSheet = spreadsheet.insertSheet('Orders');
  const ordersHeaders = [
    'OrderID',
    'Timestamp',
    'CustomerName',
    'CustomerPhone',
    'CustomerAddress',
    'CartJSON',
    'DeliveryDate',
    'TotalAmount',
    'PaymentMethod',
    'Status',
    'AdminNote',
    'WAHASentAt'
  ];
  ordersSheet.getRange(1, 1, 1, ordersHeaders.length).setValues([ordersHeaders]);
  ordersSheet.setFrozenRows(1);

  // Format Orders header
  ordersSheet.getRange(1, 1, 1, ordersHeaders.length)
    .setBackground('#C0622F')
    .setFontColor('#FFFFFF')
    .setFontWeight('bold');

  // Create Settings sheet
  const settingsSheet = spreadsheet.insertSheet('Settings');
  const settingsHeaders = ['Key', 'Value'];
  settingsSheet.getRange(1, 1, 1, settingsHeaders.length).setValues([settingsHeaders]);
  settingsSheet.setFrozenRows(1);

  // Format Settings header
  settingsSheet.getRange(1, 1, 1, settingsHeaders.length)
    .setBackground('#C0622F')
    .setFontColor('#FFFFFF')
    .setFontWeight('bold');

  // Add default settings
  const defaultSettings = [
    ['WAHA_URL', ''],
    ['WAHA_SESSION', 'default'],
    ['ADMIN_PHONE', ''],
    ['STORE_NAME', 'RekaOrder'],
    ['MIN_ORDER_AMOUNT', '0'],
    ['DELIVERY_FEE', '0']
  ];
  settingsSheet.getRange(2, 1, defaultSettings.length, 2).setValues(defaultSettings);

  // Auto-resize columns
  productsSheet.autoResizeColumns(1, productsHeaders.length);
  ordersSheet.autoResizeColumns(1, ordersHeaders.length);
  settingsSheet.autoResizeColumns(1, settingsHeaders.length);

  // Move spreadsheet to the specified folder
  try {
    const folder = DriveApp.getFolderById(FOLDER_ID);
    const rootFolder = DriveApp.getRootFolder();
    const file = rootFolder.getFileById(spreadsheetId);
    folder.addFile(file);
    rootFolder.removeFile(file);
    Logger.log('Spreadsheet moved to folder: ' + FOLDER_ID);
  } catch (e) {
    Logger.log('Error moving spreadsheet to folder: ' + e.message);
    Logger.log('Please manually move the spreadsheet to the desired folder.');
  }

  // Save spreadsheet ID to Properties Service
  const scriptProperties = PropertiesService.getScriptProperties();
  scriptProperties.setProperty('SPREADSHEET_ID', spreadsheetId);
  scriptProperties.setProperty('SPREADSHEET_URL', 'https://docs.google.com/spreadsheets/d/' + spreadsheetId);
  Logger.log('Spreadsheet ID saved to Properties Service');

  // Log final result
  Logger.log('========================================');
  Logger.log('Spreadsheet setup complete!');
  Logger.log('Spreadsheet ID: ' + spreadsheetId);
  Logger.log('Spreadsheet URL: https://docs.google.com/spreadsheets/d/' + spreadsheetId);
  Logger.log('Sheets created: Products, Orders, Settings');
  Logger.log('========================================');

  // Return the spreadsheet ID for use in .clasp.json
  return {
    spreadsheetId: spreadsheetId,
    spreadsheetUrl: 'https://docs.google.com/spreadsheets/d/' + spreadsheetId
  };
}

/**
 * Alternative function to link to existing spreadsheet
 * Use this if you already have a spreadsheet and just want to configure it
 */
function configureExistingSpreadsheet(spreadsheetId) {
  const spreadsheet = SpreadsheetApp.openById(spreadsheetId);

  // Check and create Products sheet
  let productsSheet = spreadsheet.getSheetByName('Products');
  if (!productsSheet) {
    productsSheet = spreadsheet.insertSheet('Products');
    const productsHeaders = [
      'ProductID', 'Name', 'Description', 'Category', 'Price',
      'LeadTimeDays', 'Stock', 'ImageURL', 'IsAvailable', 'Tags'
    ];
    productsSheet.getRange(1, 1, 1, productsHeaders.length).setValues([productsHeaders]);
  }

  // Check and create Orders sheet
  let ordersSheet = spreadsheet.getSheetByName('Orders');
  if (!ordersSheet) {
    ordersSheet = spreadsheet.insertSheet('Orders');
    const ordersHeaders = [
      'OrderID', 'Timestamp', 'CustomerName', 'CustomerPhone',
      'CustomerAddress', 'CartJSON', 'DeliveryDate', 'TotalAmount',
      'PaymentMethod', 'Status', 'AdminNote', 'WAHASentAt'
    ];
    ordersSheet.getRange(1, 1, 1, ordersHeaders.length).setValues([ordersHeaders]);
  }

  // Check and create Settings sheet
  let settingsSheet = spreadsheet.getSheetByName('Settings');
  if (!settingsSheet) {
    settingsSheet = spreadsheet.insertSheet('Settings');
    settingsSheet.getRange(1, 1, 1, 2).setValues([['Key', 'Value']]);
  }

  Logger.log('Spreadsheet configured: ' + spreadsheet.getUrl());
  return spreadsheet.getUrl();
}
