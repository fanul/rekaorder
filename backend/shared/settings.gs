/**
 * RekaOrder - Settings Manager
 * Functions for managing settings
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

function updateSetting(key, value) {
  const sheet = getSheet(CONFIG.SHEETS.SETTINGS);
  const data = sheet.getDataRange().getValues();
  const keyCol = 0;
  const valueCol = 1;

  for (let i = 1; i < data.length; i++) {
    if (data[i][keyCol] === key) {
      sheet.getRange(i + 1, valueCol + 1).setValue(value);
      return true;
    }
  }

  // Add new setting
  sheet.appendRow([key, value]);
  return true;
}

function setSpreadsheetId(spreadsheetId) {
  if (!spreadsheetId) {
    return { success: false, error: 'Spreadsheet ID is required' };
  }
  PropertiesService.getScriptProperties().setProperty('SPREADSHEET_ID', spreadsheetId);
  return { success: true, message: 'Spreadsheet ID set to: ' + spreadsheetId };
}

function getConfigStatus() {
  const props = PropertiesService.getScriptProperties();
  const spreadsheetId = props.getProperty('SPREADSHEET_ID');
  return {
    spreadsheetId: spreadsheetId || 'NOT_SET',
    spreadsheetUrl: spreadsheetId ? 'https://docs.google.com/spreadsheets/d/' + spreadsheetId : null,
    configured: !!spreadsheetId && spreadsheetId !== 'YOUR_SPREADSHEET_ID_HERE'
  };
}

/**
 * Get admin emails from Script Properties (not sheet)
 */
function getAdminEmails() {
  const props = PropertiesService.getScriptProperties();
  const adminEmails = props.getProperty('ADMIN_EMAILS');
  if (!adminEmails) return [];
  return adminEmails.split(',').map(function(email) {
    return email.trim().toLowerCase();
  }).filter(function(email) {
    return email.length > 0;
  });
}

/**
 * Set admin emails in Script Properties
 */
function setAdminEmailsProperty(emails) {
  const props = PropertiesService.getScriptProperties();
  props.setProperty('ADMIN_EMAILS', emails);
  return { success: true, message: 'Admin emails set to: ' + emails };
}

/**
 * Check if user email has admin access
 * @param {string} email - User email to check
 * @returns {boolean} - True if user is admin
 */
function isAdminEmail(email) {
  if (!email) return false;
  const adminEmails = getAdminEmails();
  return adminEmails.indexOf(email.toLowerCase()) > -1;
}

/**
 * Get categories from Google Sheets (Settings sheet)
 */
function getCategories() {
  try {
    const categoriesStr = getSetting('CATEGORIES');
    if (!categoriesStr) return ['Makanan', 'Minuman', 'Snack', 'Dessert'];
    return categoriesStr.split(',').map(function(cat) {
      return cat.trim();
    }).filter(function(cat) {
      return cat.length > 0;
    });
  } catch (e) {
    return ['Makanan', 'Minuman', 'Snack', 'Dessert'];
  }
}

/**
 * Set categories in Google Sheets
 */
function setCategories(categoriesStr) {
  try {
    updateSetting('CATEGORIES', categoriesStr);
    return { success: true, message: 'Categories updated: ' + categoriesStr };
  } catch (e) {
    return { success: false, error: e.message };
  }
}
