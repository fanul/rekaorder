/**
 * RekaOrder - Get Products
 * Returns available products for customers
 */

function getProducts(data) {
  try {
    const products = getProductsFromSheet();
    const available = products.filter(p => parseBoolean(p.IsAvailable));
    return { success: true, products: available };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

function getProductsFromSheet() {
  const sheet = getSheet(CONFIG.SHEETS.PRODUCTS);
  const values = getSheetData(CONFIG.SHEETS.PRODUCTS);

  if (values.length <= 1) return [];

  const headers = values[0];
  const products = [];

  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    const product = {};
    for (let j = 0; j < headers.length; j++) {
      product[headers[j]] = row[j];
    }

    product.Price = parseNumber(product.Price);
    product.LeadTimeDays = parseNumber(product.LeadTimeDays);
    product.Stock = parseNumber(product.Stock);

    // Process images
    const processedImages = processProductImages(product.Images);
    product.Images = processedImages;
    product.ImageURL = processedImages.length > 0 ? processedImages[0].url : '';

    products.push(product);
  }

  return products;
}
