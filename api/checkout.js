import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const order = req.body;
  
  if (!order || !order.items || order.items.length === 0) {
    return res.status(400).json({ error: 'Cart is empty or invalid order' });
  }

  // Create order object
  const newOrder = {
    id: Date.now(),
    createdAt: new Date().toISOString(),
    customer: order.customer || { name: 'Guest', email: 'guest@kotibus.com' },
    items: order.items
  };

  // For demo, just return success (in production, save to database)
  res.status(200).json({ 
    ok: true, 
    orderId: newOrder.id 
  });
}
