# 🌸 Improved Prompt: Pre-order Food PWA — RekaRasa Edition
## For Indonesian Women · Built with GAS + Vue 3 + WAHA

---

## 🎯 ROLE & CONTEXT

You are a **Senior Full-Stack Engineer** with deep expertise in:
- **Google Apps Script (GAS)** as a serverless backend
- **Vue.js 3** (loaded via CDN, no build tools)
- **Progressive Web Apps (PWA)** including offline-first patterns
- **WAHA (WhatsApp HTTP API)** for automated messaging
- **UI/UX design** for Indonesian female consumers (ages 20–40), who value:
  - Aesthetic, clean, and *feminin* visual design (think soft warm tones, elegant typography, delicate UI details)
  - Trust signals (clear order status, invoice, WhatsApp confirmation)
  - Mobile-first experience (most users on Android)
  - Bahasa Indonesia as the primary language with friendly, warm copy ("Halo Kak!", "Pesanan kamu sudah kami terima 💛")

---

## 📦 THE PROJECT

Build a complete **"Pre-order Food PWA"** for a digital F&B brand called **RekaRasa**.

| Layer | Stack |
|---|---|
| Backend | Google Apps Script (GAS) + Google Sheets |
| Frontend | Vue.js 3 (CDN) + Tailwind CSS (CDN) |
| Hosting | GAS HTML Service (`doGet`) |
| Messaging | WAHA (self-hosted WhatsApp HTTP API) |
| Database | Google Sheets (Products, Orders, Settings) |

---

## 🗃️ GOOGLE SHEETS SCHEMA (Define This First)

### Sheet 1: `Products`
| Column | Type | Description |
|---|---|---|
| `ProductID` | String | Unique ID (e.g., `PRD-001`) |
| `Name` | String | Product name in Bahasa Indonesia |
| `Description` | String | Short description shown on card |
| `Category` | String | e.g., Kue, Minuman, Makanan Berat |
| `Price` | Number | In IDR |
| `LeadTimeDays` | Number | Minimum H-X advance order (e.g., `2` = H-2) |
| `Stock` | Number | Available qty (0 = sold out) |
| `ImageURL` | String | Public image URL |
| `IsAvailable` | Boolean | TRUE/FALSE toggle |
| `Tags` | String | e.g., "best seller,gluten-free" |

### Sheet 2: `Orders`
| Column | Type | Description |
|---|---|---|
| `OrderID` | String | Auto-generated (e.g., `ORD-20250619-001`) |
| `Timestamp` | DateTime | Auto-filled on submission |
| `CustomerName` | String | From form |
| `CustomerPhone` | String | WhatsApp number (format: 628xxx) |
| `CustomerAddress` | String | Delivery address |
| `CartJSON` | JSON String | Full cart snapshot (name, qty, price, leadTime) |
| `DeliveryDate` | Date | Requested delivery date |
| `TotalAmount` | Number | In IDR |
| `PaymentMethod` | String | e.g., Transfer BCA, QRIS |
| `Status` | String | `pending`, `confirmed`, `rejected`, `delivered` |
| `AdminNote` | String | Optional internal note |
| `WAHASentAt` | DateTime | Timestamp of WhatsApp notification |

### Sheet 3: `Settings`
| Column | Type | Description |
|---|---|---|
| `Key` | String | e.g., `WAHA_URL`, `WAHA_SESSION`, `ADMIN_PHONE`, `STORE_NAME`, `MIN_ORDER_AMOUNT` |
| `Value` | String | The corresponding value |

---

## 🏗️ FILE STRUCTURE & ARCHITECTURE

Output each file **one by one**, clearly labeled with its file name and a short description before the code block.

### Backend (`.gs` files)

#### `backend/main.gs`
- `doGet(e)`: Route-based serving — serve customer PWA by default, admin dashboard if `?page=admin`
- `doPost(e)`: Entry point for incoming webhooks (e.g., payment callbacks)
- Helper: `getSettings()` — reads the Settings sheet into a global config object
- Helper: `generateOrderID()` — creates a timestamp-based unique ID
- Helper: `sendJsonResponse(data)` — standardized JSON response wrapper

#### `backend/customer_order.gs`
- `submitOrder(payload)`: Main order submission function
  - Validates all required fields
  - **H-X Backend Validation**: Re-computes the minimum delivery date from each cart item's `LeadTimeDays`. Rejects if `requestedDate < today + maxLeadTime`. Return a structured error object if validation fails.
  - Writes validated order to the `Orders` sheet
  - Calls `sendOrderNotifications(orderData)` from `api_waha.gs`
  - Returns `{ success: true, orderID: "ORD-..." }` or `{ success: false, error: "..." }`
- `getProducts()`: Returns all available products as JSON array (IsAvailable = TRUE, Stock > 0)

#### `backend/admin_menu_add.gs`
- `getAllProducts()`: Returns full product list including unavailable items
- `addProduct(data)`: Appends a new row to Products sheet with auto-generated ProductID
- `updateProduct(productID, data)`: Finds row by ProductID and updates it
- `toggleProductAvailability(productID)`: Flips IsAvailable column
- `getAllOrders()`: Returns all orders sorted by Timestamp DESC
- `updateOrderStatus(orderID, newStatus, adminNote)`: Updates Status and AdminNote columns

#### `backend/api_waha.gs`
- `sendOrderNotifications(orderData)`: Orchestrator — calls both customer and admin notifs
- `sendCustomerInvoice(orderData)`: Sends a warm, formatted WhatsApp invoice to the customer with:
  - Order ID, item list with subtotals, delivery date, total, and payment instructions
  - Friendly Bahasa Indonesia copy: *"Halo Kak [Name]! 🌸 Pesanan kamu sudah kami terima..."*
- `sendAdminAlert(orderData)`: Sends a concise admin alert with order summary
- `buildInvoiceMessage(orderData)`: Pure function that formats the message string
- `wahaPost(endpoint, body)`: Low-level helper using `UrlFetchApp.fetch()` to call the WAHA REST API, with error handling

---

### Frontend (`.html` files served via GAS)

#### `frontend/customer/index_cart_order.html`
The HTML shell. Include:
- Tailwind CSS via CDN
- Vue 3 via CDN (from unpkg)
- Google Fonts: `Playfair Display` (display/headers) + `Plus Jakarta Sans` (body)
- `<div id="app">` mounting point
- Include `app_vue.html` and `style.html` content via `<?= ... ?>`
- PWA meta tags: `theme-color`, `apple-mobile-web-app-capable`, viewport
- Link to manifest: `<link rel="manifest" href="<?= manifestURL ?>">`

**Design Direction — "Warm Batik Luxe":**
- Color palette: Warm cream `#FDF6EC`, terracotta `#C0622F`, dusty rose `#E8A598`, soft gold `#D4A853`, dark charcoal `#2C2C2C`
- Elegant, feminin UI — soft shadows, rounded cards, subtle texture overlays
- Section headers in `Playfair Display`, body in `Plus Jakarta Sans`
- Bottom navigation bar (mobile-first) with cart badge
- Smooth page transitions using CSS `opacity` and `transform`

**Customer UI Sections (SPA using Vue router-less approach with `v-show`):**
1. **Home / Menu Page** (`#page-menu`):
   - Category filter pills (horizontal scroll)
   - Product cards with image, name, price, "H-X" badge showing lead time, and "Tambah" button
   - Out-of-stock items shown as greyed out with "Habis" badge
2. **Cart Page** (`#page-cart`):
   - Line items with qty stepper (+/-)
   - **"Tanggal Pengiriman Tersedia Mulai:" dynamic display** — prominently shows the computed earliest delivery date in Bahasa Indonesia format (e.g., *"Senin, 23 Juni 2025"*)
   - Date picker: `<input type="date">` with `min` attribute dynamically bound to earliest date
   - Customer info form: Name, WhatsApp number, address, payment method selector
   - Order summary with subtotal, delivery fee (from Settings), and total
   - "Pesan Sekarang" CTA button — disabled if cart empty or form invalid
3. **Success Page** (`#page-success`):
   - Order ID display
   - Friendly confirmation copy with emoji
   - "Cek WhatsApp kamu ya Kak 💛" instruction
   - "Pesan Lagi" button

#### `frontend/customer/app_vue.html`
The Vue 3 `<script>` block. Must include:

```javascript
const { createApp, ref, computed, watch } = Vue;

createApp({
  setup() {
    // State
    const currentPage = ref('menu');
    const products = ref([]);
    const cart = ref([]); // [{ product, quantity }]
    const isLoading = ref(true);
    const orderResult = ref(null);
    const form = ref({ name: '', phone: '', address: '', paymentMethod: '', deliveryDate: '' });

    // Computed: max lead time across all cart items
    const maxLeadTimeDays = computed(() => {
      if (!cart.value.length) return 2; // default
      return Math.max(...cart.value.map(i => i.product.LeadTimeDays || 1));
    });

    // Computed: earliest delivery date as YYYY-MM-DD string
    const earliestDeliveryDate = computed(() => {
      const d = new Date();
      d.setDate(d.getDate() + maxLeadTimeDays.value);
      return d.toISOString().split('T')[0];
    });

    // Computed: human-readable date in Bahasa Indonesia
    const earliestDateDisplay = computed(() => {
      // Format using Intl.DateTimeFormat with locale 'id-ID'
    });

    // Computed: cart total
    const cartTotal = computed(() => ...);

    // Computed: cart item count
    const cartCount = computed(() => ...);

    // Methods
    const loadProducts = () => {
      // Wrap google.script.run in a Promise
      return new Promise((resolve, reject) => {
        google.script.run
          .withSuccessHandler(resolve)
          .withFailureHandler(reject)
          .getProducts();
      }).then(data => {
        products.value = data;
        isLoading.value = false;
      });
    };

    const addToCart = (product) => { /* ... */ };
    const updateQty = (productID, delta) => { /* ... clamp to 0, remove if 0 */ };
    const removeFromCart = (productID) => { /* ... */ };
    const clearCart = () => { /* ... */ };

    const submitOrder = async () => {
      // Client-side validation first
      // Then call backend
      const payload = {
        ...form.value,
        cart: cart.value.map(i => ({
          productID: i.product.ProductID,
          name: i.product.Name,
          price: i.product.Price,
          leadTimeDays: i.product.LeadTimeDays,
          quantity: i.quantity
        })),
        totalAmount: cartTotal.value
      };
      // Wrap google.script.run in a Promise
      // On success: set orderResult, navigate to success page, clear cart
      // On failure: show user-friendly error toast
    };

    const formatIDR = (amount) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

    // Watch deliveryDate: auto-reset if user picks a date earlier than earliest
    watch(earliestDeliveryDate, (newMin) => {
      if (form.value.deliveryDate < newMin) form.value.deliveryDate = newMin;
    });

    // On mount
    loadProducts();

    return { /* expose all refs, computed, methods */ };
  }
}).mount('#app');
```

#### `frontend/customer/style.html`
Custom CSS in a `<style>` tag. Include:
- CSS variables matching the "Warm Batik Luxe" palette
- Subtle noise/grain texture overlay on body using `::before` pseudo-element
- Product card hover lift effect
- Cart badge pulse animation
- Page transition `fade-slide` animation
- Skeleton loader for product cards
- Custom date input styling (Tailwind override)
- Custom scrollbar for category pills
- `.btn-primary` with warm terracotta gradient and hover glow
- Toast notification component style (bottom-center, slide-up)

#### `frontend/admin/dashboard.html`
Admin dashboard — separate page, served when `?page=admin`. Must include:
- Simple authentication gate: prompt for admin password stored in Settings sheet
- **Order Management table** with columns: OrderID, Customer, Delivery Date, Total, Status, Action
  - Status badge with color coding (pending=yellow, confirmed=green, rejected=red, delivered=blue)
  - Dropdown per row to update status
  - Click row to expand CartJSON details
- **Add/Edit Product form** — all fields from Products schema, with image URL preview
- **Product List** table with toggle availability button per row
- Stats cards: Total Orders Today, Pending Count, Revenue This Week
- Design: clean light admin aesthetic — white cards, indigo accents, `Inter` font

#### `frontend/pwa_manifest.html`
Outputs `Content-Type: application/json`. Returns:
```json
{
  "name": "RekaRasa - Pre-order Makanan",
  "short_name": "RekaRasa",
  "start_url": "[WEBAPP_URL]",
  "display": "standalone",
  "background_color": "#FDF6EC",
  "theme_color": "#C0622F",
  "orientation": "portrait",
  "icons": [
    { "src": "[ICON_URL_192]", "sizes": "192x192", "type": "image/png" },
    { "src": "[ICON_URL_512]", "sizes": "512x512", "type": "image/png" }
  ]
}
```

---

## ✨ ENHANCED FEATURES (Beyond the Original)

Add these improvements on top of the base spec:

### UX & Customer Experience
1. **Skeleton Loaders** — show animated placeholder cards while `getProducts()` loads
2. **Toast Notifications** — slide-up toasts for: "Ditambahkan ke keranjang 🛍️", error messages, network failures
3. **Quantity Memory** — cart persists in `localStorage` so it survives page refresh
4. **WhatsApp Pre-fill Link** — on Success page, show a "Tanya Admin via WhatsApp" button that pre-fills a message with the Order ID
5. **Search & Filter** — search bar + category filter pills with smooth scroll on menu page
6. **"Best Seller" & "H-2" Badges** — visually highlight products with tags and lead-time badges
7. **Sold Out UX** — greyed-out card with an overlay and "Sold Out" ribbon; cannot be added to cart
8. **Form Validation UX** — inline red error messages per field, not just a generic alert
9. **Price Formatting** — always display in Indonesian Rupiah format: `Rp 150.000`
10. **Delivery Date Helper Text** — below date picker: *"Pesanan kamu butuh minimal H-[X] sebelum tanggal pengiriman"*

### Backend & Data
11. **Stock Decrement on Order** — `submitOrder` should decrement Stock in Products sheet atomically using `LockService`
12. **Duplicate Phone Guard** — warn (not block) if the same phone number placed an order in the last 24h
13. **Settings-Driven Delivery Fee** — read delivery fee from Settings sheet, include in order total
14. **Order Confirmation Reply** — after admin changes status to `confirmed` or `rejected`, trigger a follow-up WAHA message to the customer with the update

### Admin
15. **CSV Export** — button to export Orders sheet as CSV for the current month
16. **Quick Stats** — cards showing: today's orders, total revenue this week, pending count

---

## 📋 OUTPUT INSTRUCTIONS

1. **First**: Output the Google Sheets column headers in a clear table (already done above — confirm them)
2. **Then output each file in this order**, with the file name as a bold H3 header, followed by a brief description, followed by the full code block:
   - `backend/main.gs`
   - `backend/customer_order.gs`
   - `backend/admin_menu_add.gs`
   - `backend/api_waha.gs`
   - `frontend/customer/style.html`
   - `frontend/customer/index_cart_order.html`
   - `frontend/customer/app_vue.html`
   - `frontend/admin/dashboard.html`
   - `frontend/pwa_manifest.html`
3. **End with**: A "How to Deploy" section — step-by-step instructions to set up GAS project, copy files, configure Sheets, set WAHA URL in Settings, and publish as web app

---

## 🚫 CONSTRAINTS

- No build tools (no npm, webpack, vite) — everything via CDN
- No external databases — Google Sheets only
- All monetary values in IDR
- Frontend language: **Bahasa Indonesia** (friendly, warm tone)
- Admin dashboard language: can be English or mixed
- Do not use `alert()` or `confirm()` — use custom Vue-driven modal/toast components
- GAS `LockService` must wrap any Sheet write operation that modifies stock or appends orders
- All `google.script.run` calls must be wrapped in Promises (never use raw callback pattern in Vue)

---

*Prompt version: 2.0 — RekaRasa PWA · Indonesian Women First · GAS + Vue 3 + WAHA*
