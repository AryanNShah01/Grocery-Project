import { Plus, Minus, AlertTriangle, Package, Loader } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { Product } from '../App';

export function InventoryManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingStock, setUpdatingStock] = useState<string | null>(null);

  const API_BASE = 'http://localhost:5000';

  // ✅ FETCH REAL DATA FROM BACKEND
  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch(`${API_BASE}/products`);
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
      setLoading(false);
    }
    
    fetchProducts();
  }, []);

  const updateStock = async (productId: string, change: number) => {
    setUpdatingStock(productId);
    
    try {
      // Find the product to get current stock
      const product = products.find(p => p.id === productId);
      if (!product) return;

      const newStock = Math.max(0, Number(product.stock) + change);
      
      // ✅ UPDATE DATABASE via backend API - CORRECTED ENDPOINT
      const response = await fetch(`${API_BASE}/products/${productId}/stock`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: newStock })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update stock');
      }

      // Update local state
      setProducts(prev => 
        prev.map(p => 
          p.id === productId 
            ? { ...p, stock: newStock }
            : p
        )
      );

      console.log('✅ Stock updated successfully:', data);
      
    } catch (error) {
      console.error('Error updating stock:', error);
      alert('Failed to update stock. Please try again.');
    } finally {
      setUpdatingStock(null);
    }
  };

  const getDaysUntilExpiry = (expiryDate: string) => {
    return Math.ceil((new Date(expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader className="w-5 h-5 animate-spin" />
          <p>Loading inventory from database...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="mb-2">Inventory Management</h1>
          <p className="text-gray-600">Monitor and manage your product stock levels in real-time</p>
        </div>

        {/* Inventory Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Total Products</span>
              <Package className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{products.length}</div>
            <p className="text-sm text-gray-500 mt-1">Active items</p>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Total Stock</span>
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {products.reduce((sum, p) => sum + Number(p.stock), 0)}
            </div>
            <p className="text-sm text-gray-500 mt-1">Units available</p>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Low Stock</span>
              <AlertTriangle className="w-5 h-5 text-orange-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {products.filter(p => Number(p.stock) < 30).length}
            </div>
            <p className="text-sm text-gray-500 mt-1">Need restocking</p>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Expiring Soon</span>
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {products.filter(p => getDaysUntilExpiry(p.expiryDate) <= 7).length}
            </div>
            <p className="text-sm text-gray-500 mt-1">Within 7 days</p>
          </div>
        </div>

        {/* Inventory Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Product ID</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Product Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Category</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Stock</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Expiry Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {products.map(product => {
                  const daysLeft = getDaysUntilExpiry(product.expiryDate);
                  const isLowStock = Number(product.stock) < 30;
                  const isExpiringSoon = daysLeft <= 7;
                  const isExpired = daysLeft <= 0;
                  
                  return (
                    <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-900 font-mono">{product.id}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                            <Package className="w-5 h-5 text-gray-400" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{product.name}</div>
                            <div className="text-xs text-gray-500">₹{Number(product.price).toFixed(2)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-sm font-medium ${
                          isLowStock ? 'text-orange-600' : 'text-gray-900'
                        }`}>
                          {product.stock} units
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {new Date(product.expiryDate).toLocaleDateString('en-IN')}
                        </div>
                        {isExpiringSoon && !isExpired && (
                          <div className="text-xs text-orange-600 font-medium">
                            {daysLeft} days left
                          </div>
                        )}
                        {isExpired && (
                          <div className="text-xs text-red-600 font-medium">
                            EXPIRED
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          {isExpired && (
                            <span className="inline-flex items-center px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium w-fit">
                              Expired
                            </span>
                          )}
                          {isExpiringSoon && !isExpired && (
                            <span className="inline-flex items-center px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs font-medium w-fit">
                              Expiring Soon
                            </span>
                          )}
                          {isLowStock && (
                            <span className="inline-flex items-center px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-medium w-fit">
                              Low Stock
                            </span>
                          )}
                          {!isExpired && !isExpiringSoon && !isLowStock && (
                            <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium w-fit">
                              Good
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => updateStock(product.id, -10)}
                            disabled={updatingStock === product.id || Number(product.stock) <= 0}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg border border-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            title="Reduce Stock by 10"
                          >
                            {updatingStock === product.id ? (
                              <Loader className="w-4 h-4 animate-spin" />
                            ) : (
                              <Minus className="w-4 h-4" />
                            )}
                          </button>
                          <button 
                            onClick={() => updateStock(product.id, 10)}
                            disabled={updatingStock === product.id}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg border border-green-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            title="Add Stock by 10"
                          >
                            {updatingStock === product.id ? (
                              <Loader className="w-4 h-4 animate-spin" />
                            ) : (
                              <Plus className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {products.length === 0 && (
          <div className="bg-white rounded-lg p-12 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-gray-900 mb-2">No Products Found</h3>
            <p className="text-gray-500">
              Your inventory is empty. Add products to get started.
            </p>
          </div>
        )}

        {/* Last Updated Info */}
        <div className="mt-6 text-center text-sm text-gray-500 flex items-center justify-center gap-2">
          <Package className="w-4 h-4" />
          Last updated: {new Date().toLocaleString('en-IN')}
          • {products.length} products
        </div>
      </div>
    </div>
  );
}