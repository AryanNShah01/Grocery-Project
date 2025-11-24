import React, { useState, useEffect } from "react";
import {
  BarChart3,
  PieChart,
  TrendingUp,
  ShoppingCart,
  Package,
  DollarSign,
  AlertTriangle,
  Plus,
  Download,
  Star,
  Clock,
  TrendingDown,
  Upload,
} from "lucide-react";

interface AnalyticsData {
  sales: {
    labels: string[];
    data: number[];
  };
  categories: {
    labels: string[];
    data: number[];
  };
  revenue: {
    current: number;
    previous: number;
    growth: number;
  };
  inventory: {
    total: number;
    lowStock: number;
    expiring: number;
  };
  topProducts: Array<{
    id: string;
    name: string;
    sales: number;
    revenue: number;
    stock: number;
  }>;
}

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  discount: number;
  expiryDate: string;
  rating: number;
  image_url: string;
}

interface NewProductData {
  name: string;
  category: string;
  price: number;
  stock: number;
  discount: number;
  expiryDate: string;
  description: string;
  image_url: string;
}

export function StoreOwnerDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("30d");
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProduct, setNewProduct] = useState<NewProductData>({
    name: "",
    category: "Vegetables",
    price: 0,
    stock: 0,
    discount: 0,
    expiryDate: "",
    description: "",
    image_url: "",
  });
  const [addingProduct, setAddingProduct] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const API_BASE = "http://localhost:5000/api";

  useEffect(() => {
    fetchDashboardData();
    fetchProducts();
  }, [timeRange]);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch(
        `${API_BASE}/analytics?timeRange=${timeRange}`
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch analytics: ${response.status}`);
      }
      
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      setAnalytics(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_BASE}/products`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.status}`);
      }
      
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
    }
  };

  const calculateDiscount = (expiryDate: string): number => {
    if (!expiryDate) return 0;
    const today = new Date();
    const expiry = new Date(expiryDate);
    const timeDiff = expiry.getTime() - today.getTime();
    const daysUntilExpiry = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    if (daysUntilExpiry <= 3) return 30;
    else if (daysUntilExpiry <= 7) return 20;
    else if (daysUntilExpiry <= 14) return 10;
    return 0;
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
  e.preventDefault();
  setAddingProduct(true);

  try {
    const calculatedDiscount = calculateDiscount(newProduct.expiryDate);
    
    const productData = {
      name: newProduct.name,
      category: newProduct.category,
      price: newProduct.price,
      stock: newProduct.stock,
      discount: calculatedDiscount,
      expiryDate: newProduct.expiryDate,
      description: newProduct.description
    };

    console.log("📤 Sending product data:", productData);

    const response = await fetch(`${API_BASE}/products`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(productData),
    });

    console.log("📥 Response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const addedProduct = await response.json();
    console.log("✅ Product added successfully:", addedProduct);
    
    // Update products list
    setProducts((prev) => [...prev, addedProduct]);
    
    // Reset form and close modal
    setShowAddProduct(false);
    setNewProduct({
      name: "",
      category: "Vegetables",
      price: 0,
      stock: 0,
      discount: 0,
      expiryDate: "",
      description: "",
      image_url: "",
    });
    setImageFile(null);

    // Refresh data
    await fetchDashboardData();
    await fetchProducts();
    
    alert("✅ Product added successfully!");

  } catch (error) {
    console.error("❌ Error adding product:", error);
    alert(`Failed to add product: ${error.message}`);
  } finally {
    setAddingProduct(false);
  }
};

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    
    const updatedProduct = {
      ...newProduct,
      [name]:
        name === "price" || name === "stock" || name === "discount"
          ? Number(value)
          : value,
    };

    if (name === "expiryDate" && value) {
      updatedProduct.discount = calculateDiscount(value);
    }

    setNewProduct(updatedProduct);
  };

  const exportReport = async () => {
    try {
      const response = await fetch(`${API_BASE}/reports/export`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ timeRange }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `store-report-${timeRange}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        const reportData = {
          analytics,
          products,
          generatedAt: new Date().toISOString(),
        };
        const blob = new Blob([JSON.stringify(reportData, null, 2)], {
          type: "application/json",
        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `store-report-${timeRange}.json`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Error exporting report:", error);
      alert("Failed to export report. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading real store data...</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Failed to Load Data</h2>
          <p className="text-gray-600 mb-4">Could not connect to the analytics server.</p>
          <button
            onClick={fetchDashboardData}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6">
      {/* Header */}
      <div className="bg-white rounded-lg mb-8 border border-gray-200 shadow-sm">
        <div className="flex justify-between items-center py-6 px-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Store Analytics
            </h1>
            <p className="text-gray-600 mt-2">
              Real-time insights from your grocery database
            </p>
            <p className="text-sm text-green-600 mt-1">
              ✅ Connected to live database
            </p>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="bg-white border border-gray-300 text-gray-900 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
            <button
              onClick={exportReport}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export Report
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Revenue Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 hover:border-blue-500 transition-colors shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              ₹{analytics?.revenue.current.toLocaleString()}
            </h3>
            <p className="text-gray-600 text-sm">Total Revenue</p>
            <div className="flex items-center gap-1 mt-2">
              <span className="text-green-600 text-sm font-medium">
                +{analytics?.revenue.growth}%
              </span>
              <span className="text-gray-500 text-sm">vs last period</span>
            </div>
          </div>

          {/* Orders Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 hover:border-green-500 transition-colors shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <ShoppingCart className="w-6 h-6 text-green-600" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {analytics?.inventory.total}
            </h3>
            <p className="text-gray-600 text-sm">Total Products</p>
            <div className="flex items-center gap-1 mt-2">
              <span className="text-green-600 text-sm font-medium">+12%</span>
              <span className="text-gray-500 text-sm">vs last month</span>
            </div>
          </div>

          {/* Low Stock Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 hover:border-orange-500 transition-colors shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Package className="w-6 h-6 text-orange-600" />
              </div>
              <AlertTriangle className="w-5 h-5 text-orange-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {analytics?.inventory.lowStock}
            </h3>
            <p className="text-gray-600 text-sm">Low Stock Items</p>
            <div className="flex items-center gap-1 mt-2">
              <span className="text-orange-600 text-sm font-medium">
                Attention needed
              </span>
            </div>
          </div>

          {/* Expiring Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 hover:border-red-500 transition-colors shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-red-100 rounded-lg">
                <Clock className="w-6 h-6 text-red-600" />
              </div>
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {analytics?.inventory.expiring}
            </h3>
            <p className="text-gray-600 text-sm">Expiring Soon</p>
            <div className="flex items-center gap-1 mt-2">
              <span className="text-red-600 text-sm font-medium">
                Urgent action
              </span>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sales Chart */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Sales Performance
                </h3>
                <p className="text-gray-600 text-sm mt-1">
                  Revenue trends over time
                </p>
              </div>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                <span className="text-green-600 text-sm font-medium">
                  +{analytics?.revenue?.growth}%
                </span>
              </div>
            </div>

            {/* Proper Bar Chart Layout */}
            <div className="mt-8 p-4">
              <div className="flex items-end justify-between h-48">
                {analytics?.sales?.data && analytics.sales.data.length > 0 ? (
                  analytics.sales.data.map((value, index) => {
                    const numericValue = Number(value) || 0;
                    const maxValue = Math.max(
                      ...analytics.sales.data.map((v) => Number(v) || 0)
                    );

                    // Calculate bar height (80% of container for max value)
                    const barHeight =
                      maxValue > 0 ? (numericValue / maxValue) * 80 : 2;

                    return (
                      <div
                        key={index}
                        className="flex flex-col items-center justify-end flex-1 mx-1 h-full"
                      >
                        {/* Value above bar */}
                        <div className="text-xs font-medium text-gray-700 mb-2">
                          ₹{numericValue}
                        </div>

                        {/* The Bar - grows from bottom */}
                        <div
                          className="w-10 bg-gradient-to-t from-red-500 to-red-800 rounded-t-lg transition-all hover:from-red-800 hover:to-red-1000 shadow-sm"
                          style={{
                            height: `${barHeight}%`,
                            minHeight: "4px",
                          }}
                        ></div>

                        {/* Day label below bar - ALL DAYS AT BOTTOM */}
                        <div className="text-xs font-medium text-gray-600 mt-2">
                          {analytics.sales.labels?.[index]}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex items-center justify-center w-full h-full">
                    <p className="text-gray-500">No sales data available</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Categories Chart */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Sales by Category
                </h3>
                <p className="text-gray-600 text-sm mt-1">
                  Revenue distribution
                </p>
              </div>
              <PieChart className="w-5 h-5 text-purple-600" />
            </div>

            <div className="h-64">
              <div className="space-y-3">
                {analytics?.categories?.data &&
                analytics.categories.data.length > 0 ? (
                  analytics.categories.data.map((value, index) => {
                    const colors = [
                      "#10B981",
                      "#3B82F6",
                      "#F59E0B",
                      "#EF4444",
                      "#8B5CF6",
                    ];

                    return (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                      >
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: colors[index] }}
                        ></div>
                        <span className="font-medium text-gray-900 flex-1">
                          {analytics.categories.labels?.[index] ||
                            `Category ${index + 1}`}
                        </span>
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className="h-2 rounded-full transition-all duration-1000"
                            style={{
                              width: `${value}%`,
                              backgroundColor: colors[index],
                            }}
                          ></div>
                        </div>
                        <span className="font-bold text-gray-900 w-8 text-right">
                          {value}%
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500">No category data available</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top Products */}
          <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Top Performing Products
              </h3>
              <Star className="w-5 h-5 text-yellow-500" />
            </div>
            <div className="space-y-4">
              {analytics?.topProducts.map((product, index) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {product.name}
                      </h4>
                      <p className="text-gray-600 text-sm">
                        {product.sales} units sold
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      ₹{product.revenue.toLocaleString()}
                    </p>
                    <p className="text-gray-600 text-sm">
                      {product.stock} in stock
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Quick Actions
            </h3>
            <div className="space-y-3">
              <button
                onClick={() => setShowAddProduct(true)}
                className="w-full flex items-center gap-3 p-4 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition-colors border border-gray-300"
              >
                <Plus className="w-5 h-5" />
                <span className="font-medium">Add New Product</span>
              </button>
              <button className="w-full flex items-center gap-3 p-4 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition-colors border border-gray-300">
                <TrendingDown className="w-5 h-5" />
                <span className="font-medium">Manage Discounts</span>
              </button>
              <button className="w-full flex items-center gap-3 p-4 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition-colors border border-gray-300">
                <Package className="w-5 h-5" />
                <span className="font-medium">Update Inventory</span>
              </button>
              <button
                onClick={exportReport}
                className="w-full flex items-center gap-3 p-4 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition-colors border border-gray-300"
              >
                <Download className="w-5 h-5" />
                <span className="font-medium">Generate Report</span>
              </button>
            </div>

            {/* Recent Activity */}
            <div className="mt-8">
              <h4 className="font-semibold text-gray-900 mb-4">
                Recent Activity
              </h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-900">
                    Order #1 placed - ₹278.25
                  </span>
                  <span className="text-gray-500 ml-auto">Recently</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-900">3 new products added</span>
                  <span className="text-gray-500 ml-auto">2 days ago</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span className="text-gray-900">
                    Low stock alert: 2 items
                  </span>
                  <span className="text-gray-500 ml-auto">Today</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Product Modal */}
      {showAddProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md border border-gray-200 shadow-lg">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Add New Product
            </h3>
            <form onSubmit={handleAddProduct}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={newProduct.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 bg-white border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    name="category"
                    value={newProduct.category}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-white border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Vegetables">Vegetables</option>
                    <option value="Fruits">Fruits</option>
                    <option value="Dairy">Dairy</option>
                    <option value="Bakery">Bakery</option>
                    <option value="Grains">Grains</option>
                    <option value="Snacks">Snacks</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price (₹)
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={newProduct.price}
                      onChange={handleInputChange}
                      required
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 bg-white border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Stock
                    </label>
                    <input
                      type="number"
                      name="stock"
                      value={newProduct.stock}
                      onChange={handleInputChange}
                      required
                      min="0"
                      className="w-full px-3 py-2 bg-white border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Expiry Date
                    </label>
                    <input
                      type="date"
                      name="expiryDate"
                      value={newProduct.expiryDate}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 bg-white border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Auto Discount
                    </label>
                    <input
                      type="text"
                      value={`${newProduct.discount}%`}
                      disabled
                      className="w-full px-3 py-2 bg-gray-100 border border-gray-300 text-gray-900 rounded-lg cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Based on expiry date
                    </p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Image
                  </label>
                  <div className="flex items-center gap-3">
                    <label className="flex-1 flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 text-gray-900 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <Upload className="w-4 h-4" />
                      <span>{imageFile ? imageFile.name : "Choose image..."}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={newProduct.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 bg-white border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddProduct(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={addingProduct}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {addingProduct ? "Adding..." : "Add Product"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}