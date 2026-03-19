/**
 * RekaOrder - Utility Functions
 * Common helper functions
 */

function generateId(prefix) {
  const timestamp = new Date().getTime().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return prefix + '_' + timestamp + '_' + random;
}

function formatDate(date) {
  return Utilities.formatDate(new Date(date), 'Asia/Jakarta', 'dd MMM yyyy, HH:mm');
}

function formatCurrency(amount) {
  return 'Rp ' + Number(amount).toLocaleString('id-ID');
}

function validateRequired(data, fields) {
  const missing = [];
  for (const field of fields) {
    if (!data[field] || data[field].toString().trim() === '') {
      missing.push(field);
    }
  }
  return missing;
}

function parseNumber(value) {
  return Number(value) || 0;
}

function parseBoolean(value) {
  return value === true || value === 'TRUE' || value === 'true';
}

function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
