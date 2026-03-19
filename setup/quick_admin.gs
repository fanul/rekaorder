/**
 * Quick Admin Setup - Run this from GAS Editor
 * Just edit the email below and run this function
 */

// ===== EDIT YOUR EMAIL HERE =====
var ADMIN_EMAIL = 'your-email@example.com';
// ================================

/**
 * Run this function from GAS Editor to set admin email
 * Uses Script Properties (not Google Sheets)
 */
function setAdminEmail() {
  var email = ADMIN_EMAIL;

  if (email === 'your-email@example.com') {
    Logger.log('ERROR: Please edit ADMIN_EMAIL variable in the script first!');
    return { success: false, error: 'Please edit ADMIN_EMAIL in the script' };
  }

  try {
    var props = PropertiesService.getScriptProperties();
    props.setProperty('ADMIN_EMAILS', email);

    Logger.log('SUCCESS: Admin email set to: ' + email);
    return { success: true, message: 'Admin email set to: ' + email };
  } catch (error) {
    Logger.log('ERROR: ' + error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Run this function to set multiple admin emails
 * Uses Script Properties (not Google Sheets)
 */
function setAdminEmails() {
  // Edit this array with your admin emails
  var emails = [
    'admin@example.com',
    'manager@example.com'
  ];

  try {
    var emailStr = emails.join(', ');
    var props = PropertiesService.getScriptProperties();
    props.setProperty('ADMIN_EMAILS', emailStr);

    Logger.log('SUCCESS: Admin emails set to: ' + emailStr);
    return { success: true, message: 'Admin emails set to: ' + emailStr };
  } catch (error) {
    Logger.log('ERROR: ' + error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Check current admin emails
 */
function checkAdminEmail() {
  var props = PropertiesService.getScriptProperties();
  var emails = props.getProperty('ADMIN_EMAILS');
  Logger.log('Current admin emails: ' + (emails || 'NOT SET'));
  return emails || 'NOT SET';
}
