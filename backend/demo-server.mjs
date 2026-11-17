import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 8080;
const UPLOADS_DIR = path.join(__dirname, 'uploads');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// In-memory demo data with realistic hostel snacks
let nextProductId = 5;
let nextOrderId = 101;

let products = [
  { id: 1, name: 'Masala Crunch Chips', sku: 'CHI-001', category: 'Chips', price: 25.00, costPrice: 15.00, stockQuantity: 24, reorderLevel: 5, imageUrl: null },
  { id: 2, name: 'Dark Chocolate Cookie', sku: 'BIS-001', category: 'Biscuits', price: 35.00, costPrice: 20.00, stockQuantity: 4, reorderLevel: 6, imageUrl: null },
  { id: 3, name: 'Cold Brew Coffee', sku: 'BEV-001', category: 'Beverages', price: 60.00, costPrice: 38.00, stockQuantity: 18, reorderLevel: 5, imageUrl: null },
  { id: 4, name: 'Roasted Spiced Peanuts', sku: 'NAM-001', category: 'Namkeen', price: 30.00, costPrice: 16.00, stockQuantity: 2, reorderLevel: 4, imageUrl: null }
];

let orders = [
  {
    id: 100,
    customerName: 'Asha Kumar',
    phoneNumber: '9876543210',
    roomNumber: 'Room 304, Block B',
    deliveryNote: 'Knock twice please',
    paymentMethod: 'QR_PAYMENT',
    paymentStatus: 'PAYMENT_VERIFIED',
    status: 'DELIVERED',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    items: [
      { id: 1, productId: 1, quantity: 2, unitPrice: 25.00, unitCost: 15.00, product: products[0] }
    ]
  }
];

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

function sendJson(res, statusCode, data) {
  setCors(res);
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', reject);
  });
}

function calculateProfit(period) {
  const now = new Date();
  let start = new Date(now.getFullYear(), now.getMonth(), 1);
  if (period === 'week') {
    start = new Date(now.getTime() - 6 * 24 * 3600 * 1000);
  } else if (period === 'all') {
    start = new Date(2000, 0, 1);
  }

  const delivered = orders.filter(o => o.status === 'DELIVERED' && new Date(o.createdAt) >= start);

  let totalRevenue = 0;
  let totalCost = 0;
  const byDay = {};
  const byCategory = {};

  for (const order of delivered) {
    const dateStr = new Date(order.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
    if (!byDay[dateStr]) byDay[dateStr] = { revenue: 0, profit: 0 };

    for (const item of (order.items || [])) {
      const rev = (item.unitPrice || 0) * item.quantity;
      const cost = (item.unitCost || item.unitPrice * 0.72) * item.quantity;
      const profit = rev - cost;

      totalRevenue += rev;
      totalCost += cost;
      byDay[dateStr].revenue += rev;
      byDay[dateStr].profit += profit;

      const cat = item.product?.category || 'Snacks';
      byCategory[cat] = (byCategory[cat] || 0) + rev;
    }
  }

  const profit = totalRevenue - totalCost;
  const margin = totalRevenue > 0 ? Math.round((profit / totalRevenue) * 100 * 10) / 10 : 0;

  const revenueByDay = Object.entries(byDay).map(([label, d]) => ({
    label,
    revenue: d.revenue,
    profit: d.profit
  }));

  const categorySales = Object.entries(byCategory)
    .sort((a, b) => b[1] - a[1])
    .map(([cat, rev]) => ({
      category: cat,
      revenue: rev,
      share: totalRevenue > 0 ? Math.round((rev / totalRevenue) * 100 * 10) / 10 : 0
    }));

  return {
    revenue: totalRevenue,
    cost: totalCost,
    profit,
    profitMargin: margin,
    deliveredOrders: delivered.length,
    revenueByDay,
    categorySales
  };
}

const server = http.createServer(async (req, res) => {
  setCors(res);
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const reqUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = reqUrl.pathname;

  // Serve static uploads
  if (pathname.startsWith('/uploads/')) {
    const filename = path.basename(pathname);
    const filepath = path.join(UPLOADS_DIR, filename);
    if (fs.existsSync(filepath)) {
      res.writeHead(200, { 'Content-Type': 'image/png' });
      fs.createReadStream(filepath).pipe(res);
      return;
    }
    res.writeHead(404);
    res.end();
    return;
  }

  try {
    // 1. Auth Login
    if (pathname === '/api/auth/login' && req.method === 'POST') {
      const { adminId, password } = await parseBody(req);
      if (adminId === 'admin' && password === 'snackstock123') {
        return sendJson(res, 200, { role: 'ADMIN', adminId: 'admin' });
      }
      return sendJson(res, 401, { message: 'Incorrect admin ID or password' });
    }

    // 2. Products List & Search
    if (pathname === '/api/products' && req.method === 'GET') {
      const q = reqUrl.searchParams.get('q')?.toLowerCase() || '';
      const lowStock = reqUrl.searchParams.get('lowStock') === 'true';
      let result = products;
      if (q) {
        result = result.filter(p => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q));
      }
      if (lowStock) {
        result = result.filter(p => p.stockQuantity <= p.reorderLevel);
      }
      return sendJson(res, 200, result);
    }

    // 3. Create Product
    if (pathname === '/api/products' && req.method === 'POST') {
      const body = await parseBody(req);
      const newProduct = {
        id: nextProductId++,
        name: body.name,
        sku: body.sku,
        category: body.category || 'Chips',
        price: Number(body.price),
        costPrice: Number(body.costPrice),
        stockQuantity: Number(body.stockQuantity),
        reorderLevel: Number(body.reorderLevel),
        imageUrl: body.imageUrl || null
      };
      products.push(newProduct);
      return sendJson(res, 201, newProduct);
    }

    // 4. Single Product (GET, PUT, DELETE)
    const productMatch = pathname.match(/^\/api\/products\/(\d+)$/);
    if (productMatch) {
      const id = parseInt(productMatch[1], 10);
      const index = products.findIndex(p => p.id === id);

      if (req.method === 'GET') {
        if (index === -1) return sendJson(res, 404, { message: 'Product not found' });
        return sendJson(res, 200, products[index]);
      }
      if (req.method === 'PUT') {
        if (index === -1) return sendJson(res, 404, { message: 'Product not found' });
        const body = await parseBody(req);
        products[index] = { ...products[index], ...body, id };
        return sendJson(res, 200, products[index]);
      }
      if (req.method === 'DELETE') {
        if (index !== -1) products.splice(index, 1);
        setCors(res);
        res.writeHead(204);
        res.end();
        return;
      }
    }

    // 5. Orders List
    if (pathname === '/api/orders' && req.method === 'GET') {
      const status = reqUrl.searchParams.get('status');
      let result = orders;
      if (status) {
        result = result.filter(o => o.status === status);
      }
      return sendJson(res, 200, result);
    }

    // 6. Create Order
    if (pathname === '/api/orders' && req.method === 'POST') {
      const body = await parseBody(req);
      const orderItems = [];

      for (const item of (body.items || [])) {
        const product = products.find(p => p.id === item.productId);
        if (!product) return sendJson(res, 400, { message: 'Product not found: ' + item.productId });
        if (product.stockQuantity < item.quantity) {
          return sendJson(res, 400, { message: 'Insufficient stock for ' + product.name });
        }
        orderItems.push({
          id: Date.now() + Math.random(),
          productId: product.id,
          quantity: item.quantity,
          unitPrice: product.price,
          unitCost: product.costPrice,
          product
        });
      }

      const newOrder = {
        id: nextOrderId++,
        customerName: body.customerName,
        phoneNumber: body.phoneNumber,
        roomNumber: body.roomNumber,
        deliveryNote: body.deliveryNote || '',
        paymentMethod: body.paymentMethod,
        paymentStatus: body.paymentMethod === 'QR_PAYMENT' ? 'PAYMENT_SUBMITTED' : 'CASH_PENDING',
        status: 'PENDING',
        createdAt: new Date().toISOString(),
        items: orderItems
      };
      orders.unshift(newOrder);
      return sendJson(res, 201, newOrder);
    }

    // 7. Order Status Update
    const orderStatusMatch = pathname.match(/^\/api\/orders\/(\d+)\/status$/);
    if (orderStatusMatch && req.method === 'PATCH') {
      const id = parseInt(orderStatusMatch[1], 10);
      const order = orders.find(o => o.id === id);
      if (!order) return sendJson(res, 404, { message: 'Order not found' });

      const { status } = await parseBody(req);
      if (status === 'CONFIRMED') {
        if (order.paymentStatus !== 'PAYMENT_VERIFIED' && order.paymentStatus !== 'CASH_COLLECTED') {
          return sendJson(res, 400, { message: 'Verify QR payment or collect cash before confirming this order' });
        }
        // Deduct stock
        for (const item of order.items) {
          const product = products.find(p => p.id === item.productId);
          if (product) product.stockQuantity -= item.quantity;
        }
      } else if (status === 'CANCELLED' && order.status !== 'PENDING') {
        // Restore stock
        for (const item of order.items) {
          const product = products.find(p => p.id === item.productId);
          if (product) product.stockQuantity += item.quantity;
        }
      }

      order.status = status;
      return sendJson(res, 200, order);
    }

    // 8. Order Payment Update
    const orderPaymentMatch = pathname.match(/^\/api\/orders\/(\d+)\/payment$/);
    if (orderPaymentMatch && req.method === 'PATCH') {
      const id = parseInt(orderPaymentMatch[1], 10);
      const order = orders.find(o => o.id === id);
      if (!order) return sendJson(res, 404, { message: 'Order not found' });

      const { paymentStatus } = await parseBody(req);
      order.paymentStatus = paymentStatus;
      return sendJson(res, 200, order);
    }

    // 9. Single Order GET / DELETE
    const singleOrderMatch = pathname.match(/^\/api\/orders\/(\d+)$/);
    if (singleOrderMatch) {
      const id = parseInt(singleOrderMatch[1], 10);
      const index = orders.findIndex(o => o.id === id);

      if (req.method === 'GET') {
        if (index === -1) return sendJson(res, 404, { message: 'Order not found' });
        return sendJson(res, 200, orders[index]);
      }
      if (req.method === 'DELETE') {
        if (index !== -1) orders.splice(index, 1);
        setCors(res);
        res.writeHead(204);
        res.end();
        return;
      }
    }

    // 10. Reports
    if (pathname === '/api/reports/low-stock' && req.method === 'GET') {
      const low = products.filter(p => p.stockQuantity <= p.reorderLevel);
      return sendJson(res, 200, low);
    }

    if (pathname === '/api/reports/profit' && req.method === 'GET') {
      const period = reqUrl.searchParams.get('period') || 'month';
      return sendJson(res, 200, calculateProfit(period));
    }

    // 11. Image upload mock
    if (pathname === '/api/uploads/product-image' && req.method === 'POST') {
      return sendJson(res, 201, { imageUrl: null });
    }

    sendJson(res, 404, { message: 'Not found: ' + pathname });
  } catch (err) {
    sendJson(res, 500, { message: err.message });
  }
});

server.listen(PORT, () => {
  console.log(`SnackStock API server running on http://localhost:${PORT}/api`);
});

