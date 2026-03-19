# RekaOrder - Pre Order Food PWA

Pre-order food application built with Google Apps Script, Vue 3, and Tailwind CSS.

## Quick Start

### Step 1: Enable Apps Script API
1. Go to https://script.google.com/home/usersettings
2. Enable "Google Apps Script API"

### Step 2: Create Spreadsheet
1. Copy `setup/create_spreadsheet.gs` content
2. Create a new Google Apps Script project at script.google.com
3. Paste the code and run `createSpreadsheet()`
4. Copy the Spreadsheet ID from the logs

### Step 3: Update Configuration
1. Edit `.clasp.json` and replace `REPLACE_WITH_YOUR_SCRIPT_ID` with your Script ID
2. In `backend/main.gs`, update `CONFIG.SPREADSHEET_ID` with your Spreadsheet ID

### Step 4: Deploy
1. Run `npx clasp push` to upload code
2. In Apps Script: Deploy > New Deployment
3. Select "Web app"
4. Set "Execute as" to "Me"
5. Set "Who has access" to "Anyone"
6. Deploy and copy the URL

## Project Structure

```
rekaorder/
├── backend/
│   ├── main.gs              # Main entry point & routing
│   ├── customer_order.gs     # Customer APIs
│   ├── admin_menu_add.gs    # Admin APIs
│   └── api_waha.gs         # WhatsApp integration
├── frontend/
│   ├── customer/
│   │   ├── index_cart_order.html  # Main PWA
│   │   └── style.html            # Custom styling
│   ├── admin/
│   │   └── dashboard.html        # Admin panel
│   └── pwa_manifest.json         # PWA manifest
├── setup/
│   └── create_spreadsheet.gs     # Spreadsheet setup
├── .clasp.json
├── appsscript.json
└── README.md
```

## Features

- Mobile-first PWA design
- Shopping cart with localStorage
- WhatsApp order notifications via WAHA
- Admin dashboard for order management
- Product management (add/edit/delete)
- Order status tracking
- CSV export
- Warm Batik Luxe theme (women-friendly)

## Design Theme

- **Colors**: Cream, Terracotta, Dusty Rose, Soft Gold
- **Typography**: Playfair Display (headings) + Plus Jakarta Sans (body)
- **Tone**: Friendly Bahasa Indonesia

## Configuration

Edit `backend/main.gs`:

```javascript
const CONFIG = {
  SPREADSHEET_ID: 'YOUR_SPREADSHEET_ID',
  SHEETS: {
    PRODUCTS: 'Products',
    ORDERS: 'Orders',
    SETTINGS: 'Settings'
  }
};
```

## License

MIT
