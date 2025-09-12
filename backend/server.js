const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());
app.use(cors());

// In-memory storage
let db = { products: [], transactions: [] };

app.get('/products', (req, res) => {
  res.json(db.products || []);
});

app.post('/products', (req, res) => {
  const newProduct = {
    id: db.products.length + 1,
    name: req.body.name || '',
    description: req.body.description || '',
    category: req.body.category || '',
    price: parseFloat(req.body.price) || 0,
    quantity: parseInt(req.body.quantity) || 0
  };
  db.products.push(newProduct);
  res.json(newProduct);
});

app.put('/products/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const product = db.products.find(p => p.id === id);
  if (product) {
    product.name = req.body.name || product.name;
    product.description = req.body.description || product.description;
    product.category = req.body.category || product.category;
    product.price = parseFloat(req.body.price) || product.price;
    product.quantity = parseInt(req.body.quantity) || product.quantity;
    res.json(product);
  } else {
    res.status(404).json({ error: 'Product not found' });
  }
});

app.delete('/products/:id', (req, res) => {
  const id = parseInt(req.params.id);
  db.products = db.products.filter(p => p.id !== id);
  res.json({ success: true });
});

app.post('/transactions', (req, res) => {
  const productId = parseInt(req.body.productId);
  const amount = parseInt(req.body.amount);
  const product = db.products.find(p => p.id === productId);
  if (product) {
    product.quantity += amount;
    if (product.quantity < 0) product.quantity = 0;
    db.transactions.push({
      id: db.transactions.length + 1,
      productId,
      amount,
      date: new Date().toISOString()
    });
    res.json(product);
  } else {
    res.status(404).json({ error: 'Product not found' });
  }
});

app.get('/low-stock', (req, res) => {
  const low = db.products.filter(p => p.quantity < 5);
  res.json(low);
});

app.get('/reports', (req, res) => {
  res.json(db.transactions || []);
});

app.listen(port, () => {
  console.log(`Brain running on port ${port}`);
});