/**
 * RekaOrder - Product CRUD Operations
 * Add, update, delete products
 */

function getProductsAdmin(data) {
  try {
    const products = getProductsFromSheet();
    return { success: true, products: products };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

function addProduct(data) {
  try {
    const { Name, Price, Description, Category, ProductType, LeadTimeDays, Stock, DailyCapacity, Images, Tags } = data;

    if (!Name || Price === undefined) {
      return { success: false, error: 'Name and Price are required' };
    }

    const productId = 'PRD_' + new Date().getTime().toString(36).toUpperCase();

    const productData = [
      productId,
      Name,
      Description || '',
      Category || 'Makanan',
      parseNumber(Price),
      ProductType || 'Regular',
      parseNumber(LeadTimeDays) || 0,
      parseNumber(Stock) || 0,
      parseNumber(DailyCapacity) || 0,
      Images || '',
      true,
      Tags || ''
    ];

    appendRow(CONFIG.SHEETS.PRODUCTS, productData);

    return {
      success: true,
      message: 'Product added successfully',
      productId: productId
    };

  } catch (error) {
    return { success: false, error: error.message };
  }
}

function updateProduct(data) {
  try {
    const { ProductID, Name, Description, Category, Price, ProductType, LeadTimeDays, Stock, DailyCapacity, Images, Tags } = data;

    if (!ProductID) {
      return { success: false, error: 'ProductID is required' };
    }

    const rowIndex = findRow(CONFIG.SHEETS.PRODUCTS, 'ProductID', ProductID);
    if (rowIndex === -1) {
      return { success: false, error: 'Product not found' };
    }

    const headers = getSheetData(CONFIG.SHEETS.PRODUCTS)[0];
    const fields = { Name, Description, Category, Price, ProductType, LeadTimeDays, Stock, DailyCapacity, Images, Tags };

    for (const [field, value] of Object.entries(fields)) {
      if (value !== undefined) {
        const colIndex = headers.indexOf(field);
        if (colIndex !== -1) {
          const finalValue = ['Price', 'LeadTimeDays', 'Stock', 'DailyCapacity'].includes(field)
            ? parseNumber(value)
            : value;
          updateCell(CONFIG.SHEETS.PRODUCTS, rowIndex, colIndex + 1, finalValue);
        }
      }
    }

    return { success: true, message: 'Product updated successfully' };

  } catch (error) {
    return { success: false, error: error.message };
  }
}

function deleteProduct(data) {
  try {
    const { ProductID } = data;

    if (!ProductID) {
      return { success: false, error: 'ProductID is required' };
    }

    const rowIndex = findRow(CONFIG.SHEETS.PRODUCTS, 'ProductID', ProductID);
    if (rowIndex === -1) {
      return { success: false, error: 'Product not found' };
    }

    const sheet = getSheet(CONFIG.SHEETS.PRODUCTS);
    sheet.deleteRow(rowIndex);

    return { success: true, message: 'Product deleted successfully' };

  } catch (error) {
    return { success: false, error: error.message };
  }
}

function toggleProductAvailability(data) {
  try {
    const { ProductID } = data;

    if (!ProductID) {
      return { success: false, error: 'ProductID is required' };
    }

    const rowIndex = findRow(CONFIG.SHEETS.PRODUCTS, 'ProductID', ProductID);
    if (rowIndex === -1) {
      return { success: false, error: 'Product not found' };
    }

    const headers = getSheetData(CONFIG.SHEETS.PRODUCTS)[0];
    const isAvailableCol = headers.indexOf('IsAvailable') + 1;

    const currentValue = getSheet(CONFIG.SHEETS.PRODUCTS).getRange(rowIndex, isAvailableCol).getValue();
    const newValue = !parseBoolean(currentValue);

    updateCell(CONFIG.SHEETS.PRODUCTS, rowIndex, isAvailableCol, newValue);

    return { success: true, isAvailable: newValue };

  } catch (error) {
    return { success: false, error: error.message };
  }
}
