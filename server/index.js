const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Serve static frontend
app.use(express.static(path.join(__dirname, '..', 'public')));
// Serve data folder for products
app.use('/data', express.static(path.join(__dirname, '..', 'data')));

const ORDERS_FILE = path.join(__dirname, '..', 'data', 'orders.json');

app.post('/checkout', (req, res) => {
  const order = req.body;
  if (!order || !order.items || order.items.length === 0) {
    return res.status(400).json({ error: 'Cart is empty or invalid order' });
  }

  // Read existing orders
  let orders = [];
  try {
    if (fs.existsSync(ORDERS_FILE)) {
      const raw = fs.readFileSync(ORDERS_FILE, 'utf8');
      orders = JSON.parse(raw || '[]');
    }
  } catch (err) {
    console.error('Failed to read orders file', err);
  }

  order.id = Date.now();
  order.createdAt = new Date().toISOString();
  orders.push(order);

  try {
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
  } catch (err) {
    console.error('Failed to write orders file', err);
    return res.status(500).json({ error: 'Failed to save order' });
  }

  res.json({ ok: true, orderId: order.id });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
