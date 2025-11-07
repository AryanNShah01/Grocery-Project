import { Search, Clock, Star, TrendingDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { Product } from '../App';

interface LandingPageProps {
  onNavigate: (page: string) => void;
  onProductClick: (product: Product) => void;
  addToCart: (product: Product) => void;
}

export function LandingPage({ onNavigate, onProductClick, addToCart }: LandingPageProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(''); // ✅ ADDED: Search state

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

  // ✅ ADDED: Search functionality
  const handleSearch = () => {
    if (searchQuery.trim()) {
      // Navigate to products page with search query
      onNavigate('products');
      // You can pass the search query to products page or filter there
      // For now, it will just navigate to products page
    }
  };

  // ✅ ADDED: Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Define categories locally since we removed mockData
  const categories = [
    { name: 'Fruits', icon: '🍎' },
    { name: 'Vegetables', icon: '🥬' },
    { name: 'Dairy', icon: '🥛' },
    { name: 'Bakery', icon: '🍞' },
    { name: 'Snacks', icon: '🍿' },
    { name: 'Beverages', icon: '🥤' }
  ];

  // FIXED: Convert to numbers for filtering and sorting
  const expiringProducts = products.filter(p => Number(p.discount) > 0).sort((a, b) => Number(b.discount) - Number(a.discount));
  const recommendedProducts = products.filter(p => Number(p.rating) >= 4.5).slice(0, 4);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>Loading products from database...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-green-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-3xl">
            <h1 className="mb-4">Fresh Groceries, Smart Savings</h1>
            <p className="text-xl mb-8 text-green-50">Get automatic discounts on products nearing expiry. Save money, reduce waste.</p>
            
            {/* ✅ UPDATED: Working Search Bar */}
            <div className="bg-white rounded-lg p-2 flex items-center shadow-lg">
              <Search className="w-5 h-5 text-gray-400 ml-2" />
              <input 
                type="text" 
                placeholder="Search for fresh vegetables, fruits, dairy..." 
                className="flex-1 px-4 py-2 outline-none text-gray-900"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <button 
                onClick={handleSearch}
                className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Search
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Rest of your LandingPage component remains the same */}
      {/* Category Carousel */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h2 className="mb-6">Shop by Category</h2>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {categories.map((category) => (
              <button 
                key={category.name}
                onClick={() => onNavigate('products')}
                className="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-gray-50 transition"
              >
                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center text-3xl">
                  {category.icon}
                </div>
                <span className="text-sm text-gray-700">{category.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Expiring Soon - Discounted Offers */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center gap-2 mb-6">
          <Clock className="w-6 h-6 text-red-500" />
          <h2>Expiring Soon — Save Up to 50%!</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {expiringProducts.slice(0, 4).map((product) => {
            const expiryDate = new Date(product.expiryDate);
            const daysLeft = Math.ceil((expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
            
            return (
              <div key={product.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition overflow-hidden">
                <div className="relative">
                  <img 
                    src={product.image_url} 
                    alt={product.name} 
                    className="w-full h-48 object-cover" 
                  />
                  <div className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm flex items-center gap-1">
                    <TrendingDown className="w-4 h-4" />
                    {Number(product.discount)}% OFF
                  </div>
                  {daysLeft <= 3 && (
                    <div className="absolute top-2 left-2 bg-orange-500 text-white px-3 py-1 rounded-full text-sm">
                      {daysLeft}d left
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="mb-1">{product.name}</h3>
                  <div className="flex items-center gap-1 mb-2">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm text-gray-600">{Number(product.rating)} ({Number(product.reviewCount)})</span>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-green-600">₹{(Number(product.price) * (1 - Number(product.discount) / 100)).toFixed(2)}</span>
                    <span className="text-gray-400 line-through text-sm">₹{Number(product.price).toFixed(2)}</span>
                  </div>
                  <p className="text-sm text-gray-500 mb-3">Expires: {expiryDate.toLocaleDateString()}</p>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => addToCart(product)}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Add to Cart
                    </button>
                    <button 
                      onClick={() => onProductClick(product)}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      View
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {expiringProducts.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No expiring products with discounts found.</p>
          </div>
        )}
        <div className="text-center mt-8">
          <button onClick={() => onNavigate('products')} className="px-6 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
            View All Offers
          </button>
        </div>
      </div>

      {/* Recommended Products */}
      <div className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="mb-6">Highly Rated Products</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {recommendedProducts.map((product) => (
              <div key={product.id} className="bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition overflow-hidden">
                <img 
                  src={product.image_url} 
                  alt={product.name} 
                  className="w-full h-48 object-cover" 
                />
                <div className="p-4">
                  <h3 className="mb-1">{product.name}</h3>
                  <div className="flex items-center gap-1 mb-2">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm text-gray-600">{Number(product.rating)} ({Number(product.reviewCount)})</span>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-green-600">₹{Number(product.discount) > 0 ? (Number(product.price) * (1 - Number(product.discount) / 100)).toFixed(2) : Number(product.price).toFixed(2)}</span>
                    {Number(product.discount) > 0 && <span className="text-gray-400 line-through text-sm">₹{Number(product.price).toFixed(2)}</span>}
                  </div>
                  <button 
                    onClick={() => addToCart(product)}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
          {recommendedProducts.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No highly rated products found.</p>
            </div>
          )}
        </div>
      </div>

      {/* Benefits Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingDown className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="mb-2">Smart Discounts</h3>
            <p className="text-gray-600">Automatic price reductions on near-expiry products. Save money while reducing waste.</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="mb-2">Always Fresh</h3>
            <p className="text-gray-600">Real-time inventory tracking ensures you get the freshest products available.</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="mb-2">Quality Assured</h3>
            <p className="text-gray-600">Verified reviews and ratings help you make informed purchasing decisions.</p>
          </div>
        </div>
      </div>
    </div>
  );
}