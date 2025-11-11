import { Trash2, AlertTriangle, TrendingDown, Calendar, Loader, BarChart3 } from 'lucide-react';
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
  const [timeRange, setTimeRange] = useState<'7days' | '30days' | 'all'>('30days');

  const API_BASE = 'http://localhost:5000';

  // ✅ FETCH REAL DATA FROM BACKEND
  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch(`${API_BASE}/products`);
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
          quantityExpired: Math.floor(Number(product.stock) * 0.3), // Assume 30% of stock expired
          estimatedLoss: (Number(product.price) * Math.floor(Number(product.stock) * 0.3)) * (1 - Number(product.discount) / 100),
          loggedDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // Random date in last 30 days
        }));

        // Sort by most recent
        generatedWasteLogs.sort((a, b) => new Date(b.loggedDate).getTime() - new Date(a.loggedDate).getTime());
        
        setWasteLogs(generatedWasteLogs);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
      setLoading(false);
    }
    
    fetchProducts();
  }, []);

  // Filter waste logs by time range
  const filteredWasteLogs = wasteLogs.filter(log => {
    const logDate = new Date(log.loggedDate);
    const now = new Date();
    
    switch (timeRange) {
      case '7days':
        return (now.getTime() - logDate.getTime()) <= 7 * 24 * 60 * 60 * 1000;
      case '30days':
        return (now.getTime() - logDate.getTime()) <= 30 * 24 * 60 * 60 * 1000;
      case 'all':
      default:
        return true;
    }
  });

  const totalWaste = filteredWasteLogs.reduce((sum, log) => sum + log.quantityExpired, 0);
  const totalLoss = filteredWasteLogs.reduce((sum, log) => sum + log.estimatedLoss, 0);

  // Calculate waste by category
  const wasteByCategory = filteredWasteLogs.reduce((acc, log) => {
    acc[log.category] = (acc[log.category] || 0) + log.estimatedLoss;
    return acc;
  }, {} as Record<string, number>);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader className="w-5 h-5 animate-spin" />
          <p>Loading waste analytics from database...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="mb-2">Waste Analytics</h1>
            <p className="text-gray-600">Track expired inventory to optimize stock management</p>
          </div>
          
          <div className="flex gap-2">
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
            >
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="all">All Time</option>
            </select>
          </div>
        </div>

        {/* Waste Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Total Waste Entries</span>
              <Trash2 className="w-5 h-5 text-red-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{filteredWasteLogs.length}</div>
            <p className="text-sm text-gray-500 mt-1">Waste incidents</p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Total Units Wasted</span>
              <TrendingDown className="w-5 h-5 text-orange-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{totalWaste}</div>
            <p className="text-sm text-gray-500 mt-1">Units expired</p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Estimated Loss</span>
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">₹{totalLoss.toFixed(2)}</div>
            <p className="text-sm text-gray-500 mt-1">Revenue impact</p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Avg. Waste/Day</span>
              <BarChart3 className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {timeRange === '7days' ? Math.round(totalWaste / 7) : 
               timeRange === '30days' ? Math.round(totalWaste / 30) : 
               Math.round(totalWaste / 90)}
            </div>
            <p className="text-sm text-gray-500 mt-1">Units per day</p>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-blue-900 mb-1">Automated Waste Tracking</h3>
            <p className="text-sm text-blue-700">
              Products are automatically logged here when they pass their expiry date. This helps you identify patterns and optimize inventory ordering.
            </p>
          </div>
        </div>

        {/* Waste by Category */}
        {Object.keys(wasteByCategory).length > 0 && (
          <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Waste by Category</h3>
            <div className="space-y-3">
              {Object.entries(wasteByCategory)
                .sort(([,a], [,b]) => b - a)
                .map(([category, loss]) => (
                  <div key={category} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">{category}</span>
                    <div className="flex items-center gap-4">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-red-500 h-2 rounded-full transition-all duration-500"
                          style={{ 
                            width: `${(loss / totalLoss) * 100}%`,
                            maxWidth: '100%'
                          }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-red-600 w-20 text-right">
                        ₹{loss.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Waste Logs Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Log ID</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Product</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Category</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Expiry Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Quantity</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Est. Loss</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Logged On</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredWasteLogs.map(log => {
                  const daysAgo = Math.ceil((new Date().getTime() - new Date(log.loggedDate).getTime()) / (1000 * 60 * 60 * 24));
                  
                  return (
                    <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-mono text-gray-900">{log.id}</td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{log.productName}</div>
                          <div className="text-xs text-gray-500 font-mono">{log.productId}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {log.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {new Date(log.expiryDate).toLocaleDateString('en-IN')}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          {log.quantityExpired} units
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-red-600">
                        ₹{log.estimatedLoss.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {new Date(log.loggedDate).toLocaleDateString('en-IN')}
                          <span className="text-xs text-gray-500">({daysAgo}d ago)</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {filteredWasteLogs.length === 0 && (
          <div className="bg-white rounded-lg p-12 text-center shadow-sm">
            <Trash2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-gray-900 mb-2 text-xl font-semibold">No Waste Logs</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              {timeRange === '7days' ? 'No waste recorded in the last 7 days.' :
               timeRange === '30days' ? 'No waste recorded in the last 30 days.' :
               'No waste logs found in your inventory.'}
            </p>
            <p className="text-gray-400 mt-2 text-sm">
              Great inventory management! Keep monitoring expiry dates to maintain this record.
            </p>
          </div>
        )}

        {/* Insights Section */}
        {filteredWasteLogs.length > 0 && (
          <div className="bg-white rounded-lg p-6 mt-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Waste Reduction Insights</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="text-green-900 font-semibold mb-2 flex items-center gap-2">
                  <TrendingDown className="w-4 h-4" />
                  Optimize Discounts
                </h4>
                <p className="text-sm text-green-700">
                  {Object.keys(wasteByCategory).length > 0 ? 
                    `Most waste occurs in the ${Object.entries(wasteByCategory)[0][0]} category. Consider increasing discount percentages earlier for these items.` :
                    'Review discount strategies for frequently wasted product categories.'
                  }
                </p>
              </div>
              
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="text-blue-900 font-semibold mb-2 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Inventory Planning
                </h4>
                <p className="text-sm text-blue-700">
                  {totalWaste > 50 ? 
                    'High waste volume detected. Review your ordering patterns and consider reducing stock levels for fast-expiring items.' :
                    'Monitor ordering quantities for products with short shelf lives to minimize waste.'
                  }
                </p>
              </div>
            </div>
            
            {/* Action Recommendations */}
            <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <h4 className="text-orange-900 font-semibold mb-2">Recommended Actions</h4>
              <ul className="text-sm text-orange-700 space-y-1">
                <li>• Set up automatic discount triggers for products 3 days before expiry</li>
                <li>• Review supplier lead times for frequently wasted items</li>
                <li>• Consider implementing batch tracking for better expiry management</li>
                <li>• Train staff on proper stock rotation (FIFO) procedures</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}