/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Package, 
  Plus, 
  Trash2, 
  Edit2, 
  RefreshCw, 
  Database, 
  Activity,
  ChevronRight,
  Save,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  stock: number;
}

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category: "",
    stock: ""
  });
  const [lastResponse, setLastResponse] = useState<any>(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/products");
      const data = await response.json();
      setProducts(data);
      setLastResponse({ status: response.status, data });
      setError(null);
    } catch (err) {
      setError("Failed to fetch products");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingProduct ? "PUT" : "POST";
    const url = editingProduct ? `/api/products/${editingProduct.id}` : "/api/products";
    
    const payload = {
      name: formData.name,
      price: parseFloat(formData.price),
      category: formData.category,
      stock: parseInt(formData.stock)
    };

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      setLastResponse({ status: response.status, data });

      if (response.ok) {
        fetchProducts();
        closeForm();
      } else {
        setError(data.message || "Operation failed");
      }
    } catch (err) {
      setError("Network error");
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    
    try {
      const response = await fetch(`/api/products/${id}`, { method: "DELETE" });
      const data = await response.json();
      setLastResponse({ status: response.status, data });
      
      if (response.ok) {
        fetchProducts();
      } else {
        setError(data.message || "Delete failed");
      }
    } catch (err) {
      setError("Network error");
      console.error(err);
    }
  };

  const openForm = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        price: product.price.toString(),
        category: product.category,
        stock: product.stock.toString()
      });
    } else {
      setEditingProduct(null);
      setFormData({ name: "", price: "", category: "", stock: "" });
    }
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingProduct(null);
    setFormData({ name: "", price: "", category: "", stock: "" });
  };

  return (
    <div className="min-h-screen bg-[#E4E3E0] text-[#141414] font-sans selection:bg-[#141414] selection:text-[#E4E3E0]">
      {/* Header */}
      <header className="border-b border-[#141414] p-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Database className="w-6 h-6" />
          <h1 className="text-xl font-bold tracking-tight uppercase">Store_API_v1.0</h1>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 opacity-50">
            <Activity className="w-4 h-4" />
            <span className="text-[10px] font-mono uppercase tracking-widest">System_Online</span>
          </div>
          <button 
            onClick={fetchProducts}
            className="p-2 hover:bg-[#141414] hover:text-[#E4E3E0] transition-colors rounded-full"
            title="Refresh Data"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-[1fr_400px] min-h-[calc(100vh-80px)]">
        {/* Left Column: Product Grid */}
        <section className="border-r border-[#141414] p-6">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="font-serif italic text-xs uppercase opacity-50 tracking-widest mb-1">Inventory_Manifest</h2>
              <p className="font-mono text-2xl font-bold">{products.length} Active_Items</p>
            </div>
            <button 
              onClick={() => openForm()}
              className="flex items-center gap-2 bg-[#141414] text-[#E4E3E0] px-4 py-2 text-xs font-bold uppercase tracking-widest hover:opacity-80 transition-opacity"
            >
              <Plus className="w-4 h-4" />
              Add_New_Product
            </button>
          </div>

          {/* Table Header */}
          <div className="grid grid-cols-[40px_1.5fr_1fr_1fr_100px] p-4 border-b border-[#141414] font-serif italic text-[11px] uppercase opacity-50 tracking-widest">
            <span>ID</span>
            <span>Product_Name</span>
            <span>Category</span>
            <span>Price/Stock</span>
            <span className="text-right">Actions</span>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-[#141414]/10">
            {products.map((product) => (
              <motion.div 
                layout
                key={product.id}
                className="grid grid-cols-[40px_1.5fr_1fr_1fr_100px] p-4 hover:bg-[#141414] hover:text-[#E4E3E0] transition-all group cursor-default items-center"
              >
                <span className="font-mono text-xs opacity-50 group-hover:opacity-100">{product.id.toString().padStart(2, '0')}</span>
                <span className="font-bold tracking-tight">{product.name}</span>
                <span className="text-xs opacity-70 group-hover:opacity-100">{product.category}</span>
                <div className="font-mono text-xs">
                  <span className="font-bold">${product.price.toFixed(2)}</span>
                  <span className="mx-2 opacity-30">|</span>
                  <span className={product.stock < 10 ? "text-red-500 group-hover:text-red-400" : ""}>
                    {product.stock} units
                  </span>
                </div>
                <div className="flex justify-end gap-2">
                  <button 
                    onClick={() => openForm(product)}
                    className="p-1.5 hover:bg-[#E4E3E0] hover:text-[#141414] rounded transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={() => handleDelete(product.id)}
                    className="p-1.5 hover:bg-red-500 hover:text-white rounded transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            ))}
            {products.length === 0 && !loading && (
              <div className="p-12 text-center opacity-30 font-serif italic">
                No products found in database.
              </div>
            )}
          </div>
        </section>

        {/* Right Column: Console & Form */}
        <aside className="bg-[#141414]/5 flex flex-col">
          {/* Response Console */}
          <div className="flex-1 p-6 overflow-hidden flex flex-col">
            <h2 className="font-serif italic text-xs uppercase opacity-50 tracking-widest mb-4">API_Response_Console</h2>
            <div className="flex-1 bg-[#141414] text-[#E4E3E0] p-4 font-mono text-[10px] overflow-auto rounded border border-[#141414]">
              {lastResponse ? (
                <pre className="whitespace-pre-wrap">
                  <span className="text-green-400 font-bold">HTTP {lastResponse.status}</span>
                  {"\n\n"}
                  {JSON.stringify(lastResponse.data, null, 2)}
                </pre>
              ) : (
                <div className="opacity-30 italic">Awaiting API request...</div>
              )}
            </div>
          </div>

          {/* Error Display */}
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="bg-red-500 text-white p-4 text-xs font-bold uppercase tracking-widest flex justify-between items-center"
              >
                <span>Error: {error}</span>
                <button onClick={() => setError(null)}><X className="w-4 h-4" /></button>
              </motion.div>
            )}
          </AnimatePresence>
        </aside>
      </main>

      {/* Modal Form */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeForm}
              className="absolute inset-0 bg-[#141414]/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative bg-[#E4E3E0] border border-[#141414] w-full max-w-md p-8 shadow-2xl"
            >
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h3 className="font-serif italic text-xs uppercase opacity-50 tracking-widest mb-1">
                    {editingProduct ? "Update_Existing_Record" : "Create_New_Record"}
                  </h3>
                  <p className="text-xl font-bold uppercase tracking-tight">
                    {editingProduct ? `Edit: ${editingProduct.name}` : "New_Product"}
                  </p>
                </div>
                <button onClick={closeForm} className="p-2 hover:bg-[#141414] hover:text-[#E4E3E0] transition-colors rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-mono uppercase tracking-widest opacity-50">Product_Name</label>
                  <input 
                    required
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g. Wireless Mouse"
                    className="w-full bg-transparent border-b border-[#141414] py-2 focus:outline-none focus:border-b-2 font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono uppercase tracking-widest opacity-50">Price_USD</label>
                    <input 
                      required
                      type="number"
                      step="0.01"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      placeholder="0.00"
                      className="w-full bg-transparent border-b border-[#141414] py-2 focus:outline-none focus:border-b-2 font-mono font-bold"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono uppercase tracking-widest opacity-50">Stock_Count</label>
                    <input 
                      required
                      type="number"
                      name="stock"
                      value={formData.stock}
                      onChange={handleInputChange}
                      placeholder="0"
                      className="w-full bg-transparent border-b border-[#141414] py-2 focus:outline-none focus:border-b-2 font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-mono uppercase tracking-widest opacity-50">Category</label>
                  <select 
                    required
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full bg-transparent border-b border-[#141414] py-2 focus:outline-none focus:border-b-2 font-bold"
                  >
                    <option value="">Select Category</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Home & Kitchen">Home & Kitchen</option>
                    <option value="Books">Books</option>
                    <option value="Clothing">Clothing</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-[#141414] text-[#E4E3E0] py-4 font-bold uppercase tracking-[0.2em] hover:opacity-90 transition-opacity flex items-center justify-center gap-3"
                >
                  <Save className="w-4 h-4" />
                  {editingProduct ? "Update_Record" : "Commit_To_Database"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
