/**
 * RekaOrder - Spreadsheet Helpers
 * Shared functions for spreadsheet access
 */

function getSpreadsheet() {
  const spreadsheetId = CONFIG.SPREADSHEET_ID;
  if (!spreadsheetId || spreadsheetId === 'YOUR_SPREADSHEET_ID_HERE') {
    throw new Error('Spreadsheet ID not configured. Run setup.createSpreadsheet() or use setSpreadsheetId()');
  }
  return SpreadsheetApp.openById(spreadsheetId);
}

function getSheet(sheetName) {
  const spreadsheet = getSpreadsheet();
  return spreadsheet.getSheetByName(sheetName);
}

function getSheetData(sheetName, includeHeader = true) {
  const sheet = getSheet(sheetName);
  const dataRange = sheet.getDataRange();
  const values = dataRange.getValues();
  return includeHeader ? values : values.slice(1);
}

function appendRow(sheetName, rowData) {
  const sheet = getSheet(sheetName);
  sheet.appendRow(rowData);
}

function updateCell(sheetName, rowIndex, colIndex, value) {
  const sheet = getSheet(sheetName);
  sheet.getRange(rowIndex, colIndex).setValue(value);
}

function findRow(sheetName, columnName, searchValue) {
  const sheet = getSheet(sheetName);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const colIndex = headers.indexOf(columnName);

  if (colIndex === -1) return -1;

  for (let i = 1; i < data.length; i++) {
    if (data[i][colIndex] == searchValue) {
      return i + 1;
    }
  }
  return -1;
}
