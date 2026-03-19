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
