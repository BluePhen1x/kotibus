# Kotibus Hoodies - Minimal Shop

This is a small demo hoodie shop (static frontend + minimal Express backend) intended as a starting point.

Features:
- Product listing (from `data/products.json`)
- Client-side cart stored in localStorage
- Mock checkout posting to `/checkout`, which appends to `data/orders.json`

Run locally (Windows, cmd.exe):

1. Install dependencies:

```
cd c:\College\kotibus
npm install
```

2. Start server:

```
npm start
```

Open http://localhost:3000 in your browser.

Notes / next steps:
- Replace mock checkout with a real payment flow (Stripe/PayPal) and a persisted DB.
- Add product images locally, product pages, search, filters, inventory management.
- Add tests and CI.
