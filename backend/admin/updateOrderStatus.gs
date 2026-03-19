/**
 * RekaOrder - Update Order Status
 * Updates order status in the orders sheet
 */

function updateOrderStatus(data) {
  try {
    const { orderId, status, adminNote } = data;

    if (!orderId || !status) {
      return { success: false, error: 'orderId and status are required' };
    }

    const validStatuses = ['Baru', 'Dikonfirmasi', 'Diproses', 'Siap', 'Selesai', 'Batal'];
    if (!validStatuses.includes(status)) {
      return { success: false, error: 'Invalid status' };
    }

    const rowIndex = findRow(CONFIG.SHEETS.ORDERS, 'OrderID', orderId);
    if (rowIndex === -1) {
      return { success: false, error: 'Order not found' };
    }

    const headers = getSheetData(CONFIG.SHEETS.ORDERS)[0];
    const statusCol = headers.indexOf('Status') + 1;
    const noteCol = headers.indexOf('AdminNote') + 1;

    updateCell(CONFIG.SHEETS.ORDERS, rowIndex, statusCol, status);

    if (adminNote) {
      updateCell(CONFIG.SHEETS.ORDERS, rowIndex, noteCol, adminNote);
    }

    return { success: true, message: 'Status updated to ' + status };

  } catch (error) {
    return { success: false, error: error.message };
  }
}
