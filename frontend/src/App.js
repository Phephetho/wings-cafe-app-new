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
      if (!form.name || !form.description || !form.category || isNaN(form.price) || isNaN(form.quantity)) {
        setError('Fill all fields with valid numbers');
        return;
      }
      const url = form.id ? `${BACKEND_URL}/products/${form.id}` : `${BACKEND_URL}/products`;
      const method = form.id ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (!res.ok) throw new Error('Add/Update failed');
      fetchProducts();
      setForm({ id: '', name: '', description: '', category: '', price: '', quantity: '' });
      setError('');
    } catch (err) {
      setError('Error adding/updating product');
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
      if (!transactionForm.productId || isNaN(transactionForm.amount)) {
        setError('Fill valid product ID and amount');
        return;
      }
      const res = await fetch(`${BACKEND_URL}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transactionForm)
      });
      if (!res.ok) throw new Error('Transaction failed');
      fetchProducts();
      fetchReports();
      setTransactionForm({ productId: '', amount: '' });
      setError('');
    } catch (err) {
      setError('Error recording transaction');
    }
  };

  return (
    <div className="app">
      <h1>Wings Cafe App</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <section>
        <h2>Dashboard</h2>
        <p>Products: {products.length}</p>
        <p>Low Stock: {lowStock.length}</p>
        <p>Transactions: {transactions.length}</p>
        <p>Sales/Customer: Use transactions</p>
      </section>

      <section>
        <h2>Products (Inventory)</h2>
        <input name="name" placeholder="Name" value={form.name} onChange={handleFormChange} />
        <input name="description" placeholder="Desc" value={form.description} onChange={handleFormChange} />
        <input name="category" placeholder="Cat" value={form.category} onChange={handleFormChange} />
        <input name="price" placeholder="Price" value={form.price} onChange={handleFormChange} />
        <input name="quantity" placeholder="Qty" value={form.quantity} onChange={handleFormChange} />
        <button onClick={handleAddOrUpdate}>{form.id ? 'Update' : 'Add'}</button>

        <table>
          <thead><tr><th>ID</th><th>Name</th><th>Desc</th><th>Cat</th><th>Price</th><th>Qty</th><th>Actions</th></tr></thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id}>
                <td>{p.id}</td><td>{p.name}</td><td>{p.description}</td><td>{p.category}</td><td>{p.price}</td><td>{p.quantity}</td>
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
        <input name="productId" placeholder="Product ID" value={transactionForm.productId} onChange={handleTransactionChange} />
        <input name="amount" placeholder="Amount (+ add, - sell)" value={transactionForm.amount} onChange={handleTransactionChange} />
        <button onClick={handleTransaction}>Record</button>
      </section>

      <section>
        <h2>Reporting</h2>
        <ul>
          {transactions.map(t => <li key={t.id}>Product {t.productId}: {t.amount} on {t.date}</li>)}
        </ul>
      </section>

      <section>
        <h2>Low Stock</h2>
        <ul>
          {lowStock.map(p => <li key={p.id}>{p.name}: {p.quantity}</li>)}
        </ul>
      </section>
    </div>
  );
}

export default App;