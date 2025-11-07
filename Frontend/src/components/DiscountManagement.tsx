import { Plus, Edit2, Trash2, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { Product } from '../App';

interface DiscountOffer {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  discountPercent: number;
  validTill: string;
}

export function DiscountManagement() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ FETCH REAL DATA FROM BACKEND
  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch('http://localhost:5000/products');
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
      setLoading(false);
    }
    
    fetchProducts();
  }, []);

  // Create discount offers from REAL products with discounts
  const discountOffers: DiscountOffer[] = products
    .filter(p => p.discount > 0)
    .map(p => ({
      id: `DO-${p.id}`,
      productId: p.id,
      productName: p.name,
      quantity: p.stock,
      discountPercent: p.discount,
      validTill: p.expiryDate
    }));

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>Loading products from database...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="mb-2">Discount Offer Management</h1>
            <p className="text-gray-600">Manage special offers and promotions for your products</p>
          </div>
          <button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Discount Offer
          </button>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="text-blue-900 mb-1">Auto-Discount System</h3>
            <p className="text-sm text-blue-700">
              Products expiring within 7 days automatically receive discounts (10-50% based on days remaining). 
              You can also manually create additional promotional offers.
            </p>
          </div>
        </div>

        {/* Add Discount Form */}
        {showAddForm && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="mb-4">Create New Discount Offer</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-2 text-gray-700">Product</label>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
                  <option value="">Select a product</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm mb-2 text-gray-700">Discount Percentage</label>
                <input 
                  type="number" 
                  placeholder="e.g., 25"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm mb-2 text-gray-700">Quantity Eligible</label>
                <input 
                  type="number" 
                  placeholder="e.g., 50"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm mb-2 text-gray-700">Valid Until</label>
                <input 
                  type="date" 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                Create Offer
              </button>
              <button 
                onClick={() => setShowAddForm(false)}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Discount Offers Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-sm text-gray-600">Product ID</th>
                  <th className="px-6 py-4 text-left text-sm text-gray-600">Product Name</th>
                  <th className="px-6 py-4 text-left text-sm text-gray-600">Quantity</th>
                  <th className="px-6 py-4 text-left text-sm text-gray-600">Discount</th>
                  <th className="px-6 py-4 text-left text-sm text-gray-600">Valid Till</th>
                  <th className="px-6 py-4 text-left text-sm text-gray-600">Type</th>
                  <th className="px-6 py-4 text-left text-sm text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {discountOffers.map(offer => {
                  const daysLeft = Math.ceil((new Date(offer.validTill).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                  const isAutoDiscount = daysLeft <= 7;
                  
                  return (
                    <tr key={offer.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">{offer.productId}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{offer.productName}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{offer.quantity} units</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">
                          {offer.discountPercent}%
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {new Date(offer.validTill).toLocaleDateString()}
                        {daysLeft <= 3 && (
                          <span className="ml-2 text-orange-600">({daysLeft}d left)</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                          isAutoDiscount 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'bg-purple-100 text-purple-700'
                        }`}>
                          {isAutoDiscount ? 'Auto' : 'Manual'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-red-600 hover:bg-red-50 rounded">
                            <Trash2 className="w-4 h-4" />
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

        {discountOffers.length === 0 && (
          <div className="bg-white rounded-lg p-12 text-center">
            <p className="text-gray-500">No active discount offers. Create your first offer to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}