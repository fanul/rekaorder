/**
 * RekaOrder - Database Adjustment Script
 * Run this to add new columns to existing database
 *
 * New columns added:
 * - ProductType (Regular/Preorder)
 * - DailyCapacity (for preorder products)
 *
 * Access: https://script.google.com/macros/s/YOUR_SCRIPT_ID/dev?setup=adjustdb
 */

/**
 * Main function to adjust database
 */
function adjustDatabase01() {
  try {
    var results = [];

    // 1. Add ProductType and DailyCapacity columns to Products sheet
    var productsSheet = getSheet('Products');
    var productsHeaders = productsSheet.getRange(1, 1, 1, productsSheet.getLastColumn()).getValues()[0];

    // Check and add ProductType column
    var productTypeColIndex = productsHeaders.indexOf('ProductType');
    if (productTypeColIndex === -1) {
      productsSheet.getRange(1, productsSheet.getLastColumn() + 1).setValue('ProductType');
      // Set default value 'Regular' for existing products
      var lastRow = productsSheet.getLastRow();
      if (lastRow > 1) {
        productsSheet.getRange(2, productsSheet.getLastColumn(), lastRow - 1, 1).setValue('Regular');
      }
      results.push('Added ProductType column to Products sheet');
    } else {
      results.push('ProductType column already exists');
    }

    // Check and add DailyCapacity column
    var dailyCapacityColIndex = productsHeaders.indexOf('DailyCapacity');
    if (dailyCapacityColIndex === -1) {
      productsSheet.getRange(1, productsSheet.getLastColumn() + 1).setValue('DailyCapacity');
      results.push('Added DailyCapacity column to Products sheet');
    } else {
      results.push('DailyCapacity column already exists');
    }

    // 2. Add CATEGORIES to Settings sheet
    var settingsSheet = getSheet('Settings');
    var settingsData = settingsSheet.getDataRange().getValues();
    var foundCategory = false;
    for (var i = 1; i < settingsData.length; i++) {
      if (settingsData[i][0] === 'CATEGORIES') {
        foundCategory = true;
        break;
      }
    }
    if (!foundCategory) {
      settingsSheet.appendRow(['CATEGORIES', 'Makanan, Minuman, Snack, Dessert']);
      results.push('Added CATEGORIES to Settings sheet');
    } else {
      results.push('CATEGORIES already exists in Settings sheet');
    }

    return {
      success: true,
      message: 'Database adjusted successfully!\n\n' + results.join('\n')
    };

  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Serve the adjustment page
 */
function serveAdjustDbPage() {
  var html = HtmlService.createHtmlOutput(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>RekaOrder - Database Adjustment</title>
      <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-gray-100 min-h-screen flex items-center justify-center">
      <div class="bg-white rounded-2xl shadow-lg p-8 max-w-md">
        <h1 class="text-2xl font-bold mb-4">Database Adjustment</h1>
        <p class="text-gray-600 mb-4">Add ProductType and DailyCapacity columns to Products sheet.</p>
        <button onclick="runAdjustment()" class="w-full bg-terracotta text-white py-3 rounded-lg font-medium hover:bg-opacity-90">
          Run Adjustment
        </button>
        <div id="result" class="mt-4 p-4 bg-gray-50 rounded-lg hidden"></div>
        <a href="?" class="block text-center mt-4 text-gray-500">Back to Home</a>
      </div>
      <script>
        function runAdjustment() {
          google.script.run.withSuccessHandler(function(result) {
            var el = document.getElementById('result');
            el.classList.remove('hidden');
            if (result.success) {
              el.className = 'mt-4 p-4 bg-green-50 text-green-700 rounded-lg';
              el.textContent = result.message;
            } else {
              el.className = 'mt-4 p-4 bg-red-50 text-red-700 rounded-lg';
              el.textContent = 'Error: ' + result.error;
            }
          }).adjustDatabase01();
        }
      </script>
    </body>
    </html>
  `).setTitle('Database Adjustment');
  return html;
}
