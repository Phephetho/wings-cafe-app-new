const express = require('express');
const fs = require('fs');
const cors = require('cors');
const app = express();
const port = 3001;

app.use(express.json());
app.use(cors());

const dbFile = 'inventory.json';

if (!fs.existsSync(dbFile)) {
  fs.writeFileSync(dbFile, JSON.stringify({ products: [], transactions: [] }));
}

function readDB() {
  return JSON.parse(fs.readFileSync(dbFile));
}

function writeDB(data) {
  fs.writeFileSync(dbFile, JSON.stringify(data, null, 2));
}

app.get('/products', (req, res) => {
  res.json(readDB().products);
});

app.post('/products', (req, res) => {
  const db = readDB();
  const newProduct = {
    id: db.products.length + 1,
    name: req.body.name,
    description: req.body.description,
    category: req.body.category,
    price: req.body.price,
    quantity: req.body.quantity
  };
  db.products.push(newProduct);
  writeDB(db);
  res.json(newProduct);
});

app.put('/products/:id', (req, res) => {
  const db = readDB();
  const id = parseInt(req.params.id);
  const product = db.products.find(p => p.id === id);
  if (product) {
    product.name = req.body.name || product.name;
    product.description = req.body.description || product.description;
    product.category = req.body.category || product.category;
    product.price = req.body.price || product.price;
    product.quantity = req.body.quantity || product.quantity;
    writeDB(db);
    res.json(product);
  } else {
    res.status(404).send('Not found');
  }
});

app.delete('/products/:id', (req, res) => {
  const db = readDB();
  const id = parseInt(req.params.id);
  db.products = db.products.filter(p => p.id !== id);
  writeDB(db);
  res.send('Deleted');
});

app.post('/transactions', (req, res) => {
  const db = readDB();
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
    writeDB(db);
    res.json(product);
  } else {
    res.status(404).send('Not found');
  }
});

app.get('/low-stock', (req, res) => {
  const db = readDB();
  res.json(db.products.filter(p => p.quantity < 5));
});

app.get('/reports', (req, res) => {
  const db = readDB();
  res.json(db.transactions);
});

app.listen(port, () => {
  console.log(`Brain running on port ${port}`);
});