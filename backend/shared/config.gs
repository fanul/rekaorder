/**
 * RekaOrder - Configuration
 * Shared configuration loaded from Properties Service
 */

const CONFIG = {
  get SPREADSHEET_ID() {
    return PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID') || 'YOUR_SPREADSHEET_ID_HERE';
  },
  SHEETS: {
    PRODUCTS: 'Products',
    ORDERS: 'Orders',
    SETTINGS: 'Settings'
  }
};
