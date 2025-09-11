const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const app = express();
app.use(cors());
app.use(express.json());
const port = process.env.PORT || 3002; // Use 3002 to avoid conflicts

// Load and save products to JSON
async function loadProducts() {
  try {
    const data = await fs.readFile('products.json', 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

async function saveProducts(products) {
  await fs.writeFile('products.json', JSON.stringify(products, null, 2));
}

// Get next available ID
async function getNextId() {
  const products = await loadProducts();
  return products.length ? Math.max(...products.map(p => p.id)) + 1 : 1;
}

// Routes
app.get('/products', async (req, res) => {
  const products = await loadProducts();
  res.json(products);
});

app.post('/products', async (req, res) => {
  const products = await loadProducts();
  const newProduct = { id: await getNextId(), ...req.body };
  products.push(newProduct);
  await saveProducts(products);
  res.json(newProduct);
});

app.put('/products/:id', async (req, res) => {
  const products = await loadProducts();
  const id = parseInt(req.params.id);
  const index = products.findIndex(p => p.id === id);
  if (index !== -1) {
    products[index] = { id, ...req.body };
    await saveProducts(products);
    res.json(products[index]);
  } else {
    res.status(404).json({ error: 'Product not found' });
  }
});

app.delete('/products/:id', async (req, res) => {
  const products = await loadProducts();
  const id = parseInt(req.params.id);
  const filtered = products.filter(p => p.id !== id);
  await saveProducts(filtered);
  res.json({ success: true });
});

app.post('/transactions', async (req, res) => {
  const products = await loadProducts();
  const { productId, amount } = req.body;
  const id = parseInt(productId);
  const index = products.findIndex(p => p.id === id);
  if (index !== -1 && !isNaN(amount)) {
    products[index].quantity += parseInt(amount);
    await saveProducts(products);
    const transactions = await loadTransactions();
    transactions.push({ id: transactions.length + 1, productId: id, amount, date: new Date().toISOString() });
    await saveTransactions(transactions);
    res.json({ success: true });
  } else {
    res.status(400).json({ error: 'Invalid product ID or amount' });
  }
});

async function loadTransactions() {
  try {
    const data = await fs.readFile('transactions.json', 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

async function saveTransactions(transactions) {
  await fs.writeFile('transactions.json', JSON.stringify(transactions, null, 2));
}

app.get('/reports', async (req, res) => {
  const transactions = await loadTransactions();
  res.json(transactions);
});

app.get('/low-stock', async (req, res) => {
  const products = await loadProducts();
  res.json(products.filter(p => p.quantity < 5));
});

app.listen(port, () => console.log(`Brain running on port ${port}`));