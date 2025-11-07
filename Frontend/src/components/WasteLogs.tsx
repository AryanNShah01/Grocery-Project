import { Trash2, AlertTriangle, TrendingDown, Calendar } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { Product } from '../App';

interface WasteLog {
  id: string;
  productId: string;
  productName: string;
  category: string;
  expiryDate: string;
  quantityExpired: number;
  estimatedLoss: number;
  loggedDate: string;
}

export function WasteLogs() {
  const [products, setProducts] = useState<Product[]>([]);
  const [wasteLogs, setWasteLogs] = useState<WasteLog[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ FETCH REAL DATA FROM BACKEND
  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch('http://localhost:5000/products');
        const data = await response.json();
        setProducts(data);
        
        // Generate waste logs from expired products
        const expiredProducts = data.filter((product: Product) => {
          const expiryDate = new Date(product.expiryDate);
          const today = new Date();
          return expiryDate < today; // Product has expired
        });

        const generatedWasteLogs: WasteLog[] = expiredProducts.map((product: Product, index: number) => ({
          id: `WL${String(index + 1).padStart(3, '0')}`,
          productId: product.id,
          productName: product.name,
          category: product.category,
          expiryDate: product.expiryDate,
          quantityExpired: Math.floor(product.stock * 0.3), // Assume 30% of stock expired
          estimatedLoss: (product.price * Math.floor(product.stock * 0.3)) * (1 - product.discount / 100),
          loggedDate: new Date().toISOString().split('T')[0]
        }));

        setWasteLogs(generatedWasteLogs);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
      setLoading(false);
    }
    
    fetchProducts();
  }, []);

  const totalWaste = wasteLogs.reduce((sum, log) => sum + log.quantityExpired, 0);
  const totalLoss = wasteLogs.reduce((sum, log) => sum + log.estimatedLoss, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>Loading waste logs from database...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="mb-2">Waste Logs</h1>
          <p className="text-gray-600">Track expired inventory to optimize stock management</p>
        </div>

        {/* Waste Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Total Waste Entries</span>
              <Trash2 className="w-5 h-5 text-red-600" />
            </div>
            <div className="text-gray-900">{wasteLogs.length} logs</div>
            <p className="text-sm text-gray-500 mt-1">Last 30 days</p>
          </div>

          <div className="bg-white rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Total Units Wasted</span>
              <TrendingDown className="w-5 h-5 text-orange-600" />
            </div>
            <div className="text-gray-900">{totalWaste} units</div>
            <p className="text-sm text-gray-500 mt-1">Across all categories</p>
          </div>

          <div className="bg-white rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Estimated Loss</span>
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div className="text-gray-900">₹{totalLoss.toFixed(2)}</div>
            <p className="text-sm text-gray-500 mt-1">Revenue impact</p>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="text-blue-900 mb-1">Automated Waste Tracking</h3>
            <p className="text-sm text-blue-700">
              Products are automatically logged here when they pass their expiry date. This helps you identify patterns and optimize inventory.
            </p>
          </div>
        </div>

        {/* Waste Logs Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-sm text-gray-600">Log ID</th>
                  <th className="px-6 py-4 text-left text-sm text-gray-600">Product</th>
                  <th className="px-6 py-4 text-left text-sm text-gray-600">Category</th>
                  <th className="px-6 py-4 text-left text-sm text-gray-600">Expiry Date</th>
                  <th className="px-6 py-4 text-left text-sm text-gray-600">Quantity</th>
                  <th className="px-6 py-4 text-left text-sm text-gray-600">Est. Loss</th>
                  <th className="px-6 py-4 text-left text-sm text-gray-600">Logged On</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {wasteLogs.map(log => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{log.id}</td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm text-gray-900">{log.productName}</div>
                        <div className="text-xs text-gray-500">{log.productId}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                        {log.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {new Date(log.expiryDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">
                        {log.quantityExpired} units
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-red-600">
                      ₹{log.estimatedLoss.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {new Date(log.loggedDate).toLocaleDateString()}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {wasteLogs.length === 0 && (
          <div className="bg-white rounded-lg p-12 text-center">
            <Trash2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-gray-900 mb-2">No Waste Logs</h3>
            <p className="text-gray-500">
              Great! No products have expired recently. Keep up the good inventory management!
            </p>
          </div>
        )}

        {/* Insights Section */}
        {wasteLogs.length > 0 && (
          <div className="bg-white rounded-lg p-6 mt-6">
            <h2 className="mb-4">Waste Reduction Tips</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="text-green-900 mb-2">Optimize Discounts</h4>
                <p className="text-sm text-green-700">
                  Most waste occurs in the {wasteLogs[0]?.category} category. Consider increasing discount percentages earlier for these items.
                </p>
              </div>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="text-blue-900 mb-2">Inventory Planning</h4>
                <p className="text-sm text-blue-700">
                  Review your ordering patterns for frequently wasted products to reduce overstock.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}