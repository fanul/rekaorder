/**
 * RekaOrder - Get All Orders
 * Returns all orders for admin view
 */

function getAllOrders(data) {
  try {
    const sheet = getSheet(CONFIG.SHEETS.ORDERS);
    const values = getSheetData(CONFIG.SHEETS.ORDERS);

    if (values.length <= 1) {
      return { success: true, orders: [], total: 0 };
    }

    const headers = values[0];
    const orders = [];

    for (let i = 1; i < values.length; i++) {
      const row = values[i];
      const order = {};
      for (let j = 0; j < headers.length; j++) {
        order[headers[j]] = row[j];
      }

      try {
        order.CartItems = JSON.parse(order.CartJSON);
      } catch (e) {
        order.CartItems = [];
      }

      order.TotalAmount = parseNumber(order.TotalAmount);
      orders.push(order);
    }

    // Sort by timestamp
    orders.sort((a, b) => new Date(b.Timestamp) - new Date(a.Timestamp));

    // Filter by status if provided
    const statusFilter = data && data.status;
    const filtered = statusFilter
      ? orders.filter(o => o.Status === statusFilter)
      : orders;

    return {
      success: true,
      orders: filtered,
      total: filtered.length
    };

  } catch (error) {
    return { success: false, error: error.message };
  }
}
