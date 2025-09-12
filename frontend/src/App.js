import React, { useState, useEffect, useCallback } from 'react';
import './App.css';

function App() {
  const [products, setProducts] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [form, setForm] = useState({ id: '', name: '', description: '', category: '', price: '', quantity: '' });
  const [transactionForm, setTransactionForm] = useState({ productId: '', amount: '' });
  const [error, setError] = useState('');
  const BACKEND_URL = 'http://localhost:3001';

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/products`);
      if (!res.ok) throw new Error('Fetch failed');
      setProducts(await res.json());
    } catch (err) {
      setError('Error fetching products');
    }
  }, [BACKEND_URL]);

  const fetchLowStock = useCallback(async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/low-stock`);
      if (!res.ok) throw new Error('Fetch failed');
      setLowStock(await res.json());
    } catch (err) {
      setError('Error fetching low stock');
    }
  }, [BACKEND_URL]);

  const fetchReports = useCallback(async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/reports`);
      if (!res.ok) throw new Error('Fetch failed');
      setTransactions(await res.json());
    } catch (err) {
      setError('Error fetching reports');
    }
  }, [BACKEND_URL]);

  useEffect(() => {
    fetchProducts();
    fetchLowStock();
    fetchReports();
  }, [fetchProducts, fetchLowStock, fetchReports]);

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddOrUpdate = async () => {
    try {
      if (!form.name || !form.description || !form.category || isNaN(parseFloat(form.price)) || isNaN(parseInt(form.quantity))) {
        setError('Fill all fields with valid numbers');
        return;
      }
      const url = form.id ? `${BACKEND_URL}/products/${form.id}` : `${BACKEND_URL}/products`;
      const method = form.id ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          category: form.category,
          price: parseFloat(form.price),
          quantity: parseInt(form.quantity)
        })
      });
      if (!res.ok) throw new Error('Action failed');
      fetchProducts();
      setForm({ id: '', name: '', description: '', category: '', price: '', quantity: '' });
      setError('');
    } catch (err) {
      setError('Error in add/update');
    }
  };

  const handleEdit = (p) => {
    setForm(p);
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${BACKEND_URL}/products/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      fetchProducts();
    } catch (err) {
      setError('Error deleting product');
    }
  };

  const handleTransactionChange = (e) => {
    setTransactionForm({ ...transactionForm, [e.target.name]: e.target.value });
  };

  const handleTransaction = async () => {
    try {
      if (!transactionForm.productId || isNaN(parseInt(transactionForm.amount))) {
        setError('Enter a valid Product ID and amount');
        return;
      }
      const res = await fetch(`${BACKEND_URL}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: parseInt(transactionForm.productId),
          amount: parseInt(transactionForm.amount)
        })
      });
      if (!res.ok) throw new Error('Transaction failed');
      fetchProducts();
      fetchReports();
      setTransactionForm({ productId: '', amount: '' });
      setError('');
    } catch (err) {
      setError('Error in transaction');
    }
  };

  // Helper to get product name by ID
  const getProductName = (productId) => {
    const product = products.find(p => p.id === parseInt(productId));
    return product ? product.name : `Unknown (ID: ${productId})`;
  };

  return (
    <div className="app">
      <h1>Wings Cafe App</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <section>
        <h2>Dashboard</h2>
        <div>
          <p>Products: {products.length}</p>
          <p>Low Stock: {lowStock.length}</p>
          <p>Transactions: {transactions.length}</p>
          <p>Sales/Customer: Use transactions</p>
        </div>
      </section>

      <section>
        <h2>Products (Inventory)</h2>
        <input name="name" placeholder="Name" value={form.name} onChange={handleFormChange} />
        <input name="description" placeholder="Description" value={form.description} onChange={handleFormChange} />
        <input name="category" placeholder="Category" value={form.category} onChange={handleFormChange} />
        <input name="price" placeholder="Price" value={form.price} onChange={handleFormChange} />
        <input name="quantity" placeholder="Quantity" value={form.quantity} onChange={handleFormChange} />
        <button onClick={handleAddOrUpdate}>{form.id ? 'Update Product' : 'Add Product'}</button>

        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Description</th>
              <th>Category</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.name}</td>
                <td>{p.description}</td>
                <td>{p.category}</td>
                <td>{p.price}</td>
                <td>{p.quantity}</td>
                <td>
                  <button onClick={() => handleEdit(p)}>Edit</button>
                  <button onClick={() => handleDelete(p.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h2>Transactions (Sales/Inventory)</h2>
        <input
          type="number"
          name="productId"
          placeholder="Product ID"
          value={transactionForm.productId}
          onChange={handleTransactionChange}
          min="1"
        />
        <input
          name="amount"
          placeholder="Amount (+ add, - sell)"
          value={transactionForm.amount}
          onChange={handleTransactionChange}
        />
        <button onClick={handleTransaction}>Record Transaction</button>
      </section>

      <section>
        <h2>Reporting</h2>
        <ul>
          {transactions.map(t => (
            <li key={t.id}>{getProductName(t.productId)}: {t.amount} on {t.date}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2>Low Stock</h2>
        <ul>
          {lowStock.map(p => (
            <li key={p.id}>{p.name}: {p.quantity}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default App;