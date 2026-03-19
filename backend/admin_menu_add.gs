/**
 * RekaOrder - Admin Menu & Order Management
 * Handles product CRUD and order management for admin
 *
 * @author RekaOrder
 * @version 1.0.0
 */

/**
 * Get all orders (admin view)
 */
function getAllOrders(data) {
  try {
    const sheet = getSheet(CONFIG.SHEETS.ORDERS);
    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();

    if (values.length <= 1) {
      return { success: true, orders: [] };
    }

    const orders = [];
    const headers = values[0];

    // Get start and limit for pagination
    const start = data.start ? Number(data.start) : 0;
    const limit = data.limit ? Number(data.limit) : 50;

    // Get status filter if provided
    const statusFilter = data.status;

    for (let i = 1; i < values.length; i++) {
      const row = values[i];
      const order = {};

      // Map each column to header
      for (let j = 0; j < headers.length; j++) {
        order[headers[j]] = row[j];
      }

      // Parse cart JSON
      try {
        order.CartItems = JSON.parse(order.CartJSON);
      } catch (e) {
        order.CartItems = [];
      }

      // Filter by status if specified
      if (statusFilter && order.Status !== statusFilter) {
        continue;
      }

      // Parse numeric fields
      order.TotalAmount = Number(order.TotalAmount) || 0;

      orders.push(order);
    }

    // Sort by timestamp descending (newest first)
    orders.sort((a, b) => new Date(b.Timestamp) - new Date(a.Timestamp));

    // Apply pagination
    const paginatedOrders = orders.slice(start, start + limit);

    return {
      success: true,
      orders: paginatedOrders,
      total: orders.length,
      start: start,
      limit: limit
    };

  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Update order status
 */
function updateOrderStatus(data) {
  try {
    const requiredFields = ['orderId', 'status'];
    const missing = validateRequired(data, requiredFields);

    if (missing.length > 0) {
      return { success: false, error: 'Missing required fields: ' + missing.join(', ') };
    }

    const validStatuses = ['Baru', 'Dikonfirmasi', 'Diproses', 'Siap', 'Selesai', 'Batal'];
    if (!validStatuses.includes(data.status)) {
      return { success: false, error: 'Invalid status' };
    }

    const sheet = getSheet(CONFIG.SHEETS.ORDERS);
    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();
    const headers = values[0];

    const orderIdCol = headers.indexOf('OrderID');
    const statusCol = headers.indexOf('Status');
    const adminNoteCol = headers.indexOf('AdminNote');

    let found = false;
    for (let i = 1; i < values.length; i++) {
      if (values[i][orderIdCol] === data.orderId) {
        sheet.getRange(i + 1, statusCol + 1).setValue(data.status);

        if (data.adminNote) {
          sheet.getRange(i + 1, adminNoteCol + 1).setValue(data.adminNote);
        }

        found = true;
        break;
      }
    }

    if (!found) {
      return { success: false, error: 'Order not found' };
    }

    return { success: true, message: 'Status updated to ' + data.status };

  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Get all products (admin view - includes unavailable)
 */
function getProductsAdmin(data) {
  try {
    const sheet = getSheet(CONFIG.SHEETS.PRODUCTS);
    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();

    if (values.length <= 1) {
      return { success: true, products: [] };
    }

    const products = [];
    const headers = values[0];

    for (let i = 1; i < values.length; i++) {
      const row = values[i];
      const product = {};

      // Map each column to header
      for (let j = 0; j < headers.length; j++) {
        product[headers[j]] = row[j];
      }

      // Parse numeric fields
      product.Price = Number(product.Price) || 0;
      product.LeadTimeDays = Number(product.LeadTimeDays) || 0;
      product.Stock = Number(product.Stock) || 0;

      products.push(product);
    }

    return { success: true, products: products };

  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Add new product
 */
function addProduct(data) {
  try {
    const requiredFields = ['Name', 'Price'];
    const missing = validateRequired(data, requiredFields);

    if (missing.length > 0) {
      return { success: false, error: 'Missing required fields: ' + missing.join(', ') };
    }

    // Generate product ID
    const productId = 'PRD_' + new Date().getTime().toString(36).toUpperCase();

    const productData = [
      productId,
      data.Name,
      data.Description || '',
      data.Category || 'Makanan',
      Number(data.Price) || 0,
      Number(data.LeadTimeDays) || 0,
      Number(data.Stock) || 0,
      data.ImageURL || '',
      data.IsAvailable !== false,
      data.Tags || ''
    ];

    const sheet = getSheet(CONFIG.SHEETS.PRODUCTS);
    sheet.appendRow(productData);

    return {
      success: true,
      message: 'Product added successfully',
      productId: productId
    };

  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Update existing product
 */
function updateProduct(data) {
  try {
    const requiredFields = ['ProductID'];
    const missing = validateRequired(data, requiredFields);

    if (missing.length > 0) {
      return { success: false, error: 'Missing required fields: ' + missing.join(', ') };
    }

    const sheet = getSheet(CONFIG.SHEETS.PRODUCTS);
    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();
    const headers = values[0];

    const productIdCol = headers.indexOf('ProductID');

    // Find product
    let rowIndex = -1;
    for (let i = 1; i < values.length; i++) {
      if (values[i][productIdCol] === data.ProductID) {
        rowIndex = i;
        break;
      }
    }

    if (rowIndex === -1) {
      return { success: false, error: 'Product not found' };
    }

    // Update fields
    const fieldsToUpdate = ['Name', 'Description', 'Category', 'Price', 'LeadTimeDays', 'Stock', 'ImageURL', 'Tags'];

    for (const field of fieldsToUpdate) {
      if (data[field] !== undefined) {
        const colIndex = headers.indexOf(field);
        if (colIndex !== -1) {
          const value = field === 'Price' || field === 'LeadTimeDays' || field === 'Stock'
            ? Number(data[field]) || 0
            : data[field];
          sheet.getRange(rowIndex + 1, colIndex + 1).setValue(value);
        }
      }
    }

    return { success: true, message: 'Product updated successfully' };

  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Delete product
 */
function deleteProduct(data) {
  try {
    if (!data.ProductID) {
      return { success: false, error: 'ProductID is required' };
    }

    const sheet = getSheet(CONFIG.SHEETS.PRODUCTS);
    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();
    const headers = values[0];

    const productIdCol = headers.indexOf('ProductID');

    // Find and delete product
    for (let i = 1; i < values.length; i++) {
      if (values[i][productIdCol] === data.ProductID) {
        sheet.deleteRow(i + 1);
        return { success: true, message: 'Product deleted successfully' };
      }
    }

    return { success: false, error: 'Product not found' };

  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Toggle product availability
 */
function toggleProductAvailability(data) {
  try {
    if (!data.ProductID) {
      return { success: false, error: 'ProductID is required' };
    }

    const sheet = getSheet(CONFIG.SHEETS.PRODUCTS);
    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();
    const headers = values[0];

    const productIdCol = headers.indexOf('ProductID');
    const isAvailableCol = headers.indexOf('IsAvailable');

    // Find and toggle
    for (let i = 1; i < values.length; i++) {
      if (values[i][productIdCol] === data.ProductID) {
        const currentValue = values[i][isAvailableCol];
        const newValue = !(currentValue === true || currentValue === 'TRUE' || currentValue === 'true');
        sheet.getRange(i + 1, isAvailableCol + 1).setValue(newValue);

        return {
          success: true,
          message: 'Product availability toggled',
          isAvailable: newValue
        };
      }
    }

    return { success: false, error: 'Product not found' };

  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Export orders to CSV
 */
function exportOrdersCSV(data) {
  try {
    const sheet = getSheet(CONFIG.SHEETS.ORDERS);
    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();

    if (values.length <= 1) {
      return { success: false, error: 'No orders to export' };
    }

    const headers = values[0];
    const csvRows = [];

    // Add header row
    csvRows.push(headers.join(','));

    // Get date filter if provided
    const startDate = data.startDate ? new Date(data.startDate) : null;
    const endDate = data.endDate ? new Date(data.endDate) : null;

    // Add data rows
    for (let i = 1; i < values.length; i++) {
      const row = values[i];

      // Filter by date if specified
      if (startDate || endDate) {
        const orderDate = new Date(row[headers.indexOf('Timestamp')]);
        if (startDate && orderDate < startDate) continue;
        if (endDate && orderDate > endDate) continue;
      }

      // Escape CSV values
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

    // Create file in Drive
    const fileName = 'RekaOrder_Orders_' + Utilities.formatDate(new Date(), 'Asia/Jakarta', 'yyyyMMdd_HHmmss') + '.csv';
    const folder = DriveApp.getRootFolder(); // Or specify a folder

    const file = folder.createFile(fileName, csvContent, MimeType.CSV);
    const fileUrl = file.getUrl();

    return {
      success: true,
      fileUrl: fileUrl,
      fileName: fileName,
      message: 'Export successful'
    };

  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Update settings
 */
function updateSettings(data) {
  try {
    if (!data.key || data.value === undefined) {
      return { success: false, error: 'Key and value are required' };
    }

    const sheet = getSheet(CONFIG.SHEETS.SETTINGS);
    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();
    const headers = values[0];

    const keyCol = headers.indexOf('Key');
    const valueCol = headers.indexOf('Value');

    // Find and update or add
    let found = false;
    for (let i = 1; i < values.length; i++) {
      if (values[i][keyCol] === data.key) {
        sheet.getRange(i + 1, valueCol + 1).setValue(data.value);
        found = true;
        break;
      }
    }

    if (!found) {
      // Add new setting
      sheet.appendRow([data.key, data.value]);
    }

    return { success: true, message: 'Setting updated successfully' };

  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Get order statistics for dashboard
 */
function getOrderStats() {
  try {
    const sheet = getSheet(CONFIG.SHEETS.ORDERS);
    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();

    if (values.length <= 1) {
      return {
        success: true,
        stats: {
          total: 0,
          baru: 0,
          diproses: 0,
          selesai: 0,
          batal: 0,
          totalRevenue: 0
        }
      };
    }

    const headers = values[0];
    const statusCol = headers.indexOf('Status');
    const amountCol = headers.indexOf('TotalAmount');

    let stats = {
      total: 0,
      baru: 0,
      diproses: 0,
      selesai: 0,
      batal: 0,
      totalRevenue: 0
    };

    for (let i = 1; i < values.length; i++) {
      const status = values[i][statusCol];
      const amount = Number(values[i][amountCol]) || 0;

      stats.total++;

      switch (status) {
        case 'Baru':
          stats.baru++;
          break;
        case 'Diproses':
        case 'Dikonfirmasi':
        case 'Siap':
          stats.diproses++;
          break;
        case 'Selesai':
          stats.selesai++;
          stats.totalRevenue += amount;
          break;
        case 'Batal':
          stats.batal++;
          break;
      }
    }

    return { success: true, stats: stats };

  } catch (error) {
    return { success: false, error: error.message };
  }
}
