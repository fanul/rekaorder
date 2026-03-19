/**
 * RekaOrder - Export Orders CSV
 * Export orders to CSV file
 */

function exportOrdersCSV(data) {
  try {
    const sheet = getSheet(CONFIG.SHEETS.ORDERS);
    const values = sheet.getDataRange().getValues();

    if (values.length <= 1) {
      return { success: false, error: 'No orders to export' };
    }

    const headers = values[0];
    const csvRows = [headers.join(',')];

    // Date filter
    const startDate = data && data.startDate ? new Date(data.startDate) : null;
    const endDate = data && data.endDate ? new Date(data.endDate) : null;

    for (let i = 1; i < values.length; i++) {
      const row = values[i];

      // Filter by date
      if (startDate || endDate) {
        const orderDate = new Date(row[headers.indexOf('Timestamp')]);
        if (startDate && orderDate < startDate) continue;
        if (endDate && orderDate > endDate) continue;
      }

      const escapedRow = row.map(cell => {
        const value = String(cell || '');
        if (value.includes(',') || value.includes('"') || value.includes('\n')) {
          return '"' + value.replace(/"/g, '""') + '"';
        }
        return value;
      });
      csvRows.push(escapedRow.join(','));
    }

    const csvContent = csvRows.join('\n');
    const fileName = 'RekaOrder_Orders_' + Utilities.formatDate(new Date(), 'Asia/Jakarta', 'yyyyMMdd_HHmmss') + '.csv';
    const file = DriveApp.createFile(fileName, csvContent, MimeType.CSV);

    return {
      success: true,
      fileUrl: file.getUrl(),
      fileName: fileName
    };

  } catch (error) {
    return { success: false, error: error.message };
  }
}
