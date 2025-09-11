const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const app = express();
app.use(cors());
app.use(express.json());
const port = process.env.PORT || 3001;

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

// Routes
app.get('/products', async (req, res) => {
  const products = await loadProducts();
  res.json(products);
});
app.post('/products', async (req, res) => {
  const products = await loadProducts();
  products.push(req.body);
  await saveProducts(products);
  res.json(req.body);
});
// Add other routes (update, delete, transactions, reports) as in your app
app.listen(port, () => console.log(`Server running on port ${port}`));