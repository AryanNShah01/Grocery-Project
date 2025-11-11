import { Search, Clock, Star, TrendingDown, Loader } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { Product } from '../App';

interface LandingPageProps {
  onNavigate: (page: string) => void;
  onProductClick: (product: Product) => void;
  addToCart: (product: Product) => void;
  currentUser?: any;
}

export function LandingPage({ onNavigate, onProductClick, addToCart, currentUser }: LandingPageProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [addingToCart, setAddingToCart] = useState<string | null>(null);

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

  // ✅ ADDED: Enhanced add to cart with loading state
  const handleAddToCart = async (product: Product) => {
    if (!currentUser) {
      alert('Please login to add items to cart');
      onNavigate('customerLogin');
      return;
    }

    setAddingToCart(product.id);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      addToCart(product);
      
      // Show success feedback
      const button = document.getElementById(`add-to-cart-${product.id}`);
      if (button) {
        button.classList.add('bg-green-700');
        setTimeout(() => {
          button.classList.remove('bg-green-700');
        }, 300);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setAddingToCart(null);
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
  const expiringProducts = products
    .filter(p => Number(p.discount) > 0)
    .sort((a, b) => Number(b.discount) - Number(a.discount))
    .slice(0, 8);

  const recommendedProducts = products
    .filter(p => Number(p.rating) >= 4.0)
    .slice(0, 4);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader className="w-5 h-5 animate-spin" />
          <p>Loading fresh products...</p>
        </div>
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
            <p className="text-xl mb-8 text-green-50">
              Get automatic discounts on products nearing expiry. Save money while helping reduce food waste.
            </p>
            
            {/* ✅ UPDATED: Working Search Bar */}
            <div className="bg-white rounded-lg p-2 flex items-center shadow-lg max-w-2xl">
              <Search className="w-5 h-5 text-gray-400 ml-2" />
              <input 
                type="text" 
                placeholder="Search for fresh vegetables, fruits, dairy..." 
                className="flex-1 px-4 py-2 outline-none text-gray-900 placeholder-gray-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <button 
                onClick={handleSearch}
                className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
              >
                Search
              </button>
            </div>

            {/* Quick Stats */}
            <div className="flex gap-6 mt-8 text-green-100">
              <div>
                <div className="text-2xl font-bold">{products.length}+</div>
                <div className="text-sm">Fresh Products</div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {products.filter(p => Number(p.discount) > 0).length}+
                </div>
                <div className="text-sm">Discounted Items</div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {products.filter(p => Number(p.rating) >= 4).length}+
                </div>
                <div className="text-sm">Highly Rated</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Carousel */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h2 className="mb-6">Shop by Category</h2>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {categories.map((category) => (
              <button 
                key={category.name}
                onClick={() => onNavigate('products')}
                className="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-gray-50 transition-all duration-200 hover:scale-105"
              >
                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center text-3xl hover:bg-green-100 transition-colors">
                  {category.icon}
                </div>
                <span className="text-sm text-gray-700 font-medium">{category.name}</span>
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
        
        {expiringProducts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {expiringProducts.map((product) => {
                const expiryDate = new Date(product.expiryDate);
                const daysLeft = Math.ceil((expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                const finalPrice = Number(product.price) * (1 - Number(product.discount) / 100);
                
                return (
                  <div key={product.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group">
                    <div className="relative">
                      <img 
                        src={product.image_url || '/placeholder-product.jpg'} 
                        alt={product.name} 
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" 
                      />
                      <div className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm flex items-center gap-1">
                        <TrendingDown className="w-4 h-4" />
                        {Number(product.discount)}% OFF
                      </div>
                      {daysLeft <= 3 && daysLeft > 0 && (
                        <div className="absolute top-2 left-2 bg-orange-500 text-white px-3 py-1 rounded-full text-sm">
                          {daysLeft}d left
                        </div>
                      )}
                      {daysLeft <= 0 && (
                        <div className="absolute top-2 left-2 bg-red-600 text-white px-3 py-1 rounded-full text-sm">
                          Expired
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="mb-1 font-semibold text-gray-900">{product.name}</h3>
                      <div className="flex items-center gap-1 mb-2">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm text-gray-600">
                          {Number(product.rating).toFixed(1)} ({Number(product.reviewCount)})
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-green-600 font-bold text-lg">
                          ₹{finalPrice.toFixed(2)}
                        </span>
                        {Number(product.discount) > 0 && (
                          <span className="text-gray-400 line-through text-sm">
                            ₹{Number(product.price).toFixed(2)}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mb-3">
                        Expires: {expiryDate.toLocaleDateString('en-IN')}
                      </p>
                      <div className="flex gap-2">
                        <button 
                          id={`add-to-cart-${product.id}`}
                          onClick={() => handleAddToCart(product)}
                          disabled={addingToCart === product.id || product.stock === 0}
                          className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {addingToCart === product.id ? (
                            <Loader className="w-4 h-4 animate-spin" />
                          ) : (
                            <span>{product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}</span>
                          )}
                        </button>
                        <button 
                          onClick={() => onProductClick(product)}
                          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          View
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="text-center mt-8">
              <button 
                onClick={() => onNavigate('offers')}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                View All Discounted Products
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg">
            <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No expiring products with discounts at the moment.</p>
            <p className="text-gray-400 mt-2">Check back later for fresh deals!</p>
          </div>
        )}
      </div>

      {/* Recommended Products */}
      <div className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="mb-6">Highly Rated Products</h2>
          
          {recommendedProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {recommendedProducts.map((product) => {
                const finalPrice = Number(product.price) * (1 - Number(product.discount) / 100);
                
                return (
                  <div key={product.id} className="bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group">
                    <img 
                      src={product.image_url || '/placeholder-product.jpg'} 
                      alt={product.name} 
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" 
                    />
                    <div className="p-4">
                      <h3 className="mb-1 font-semibold text-gray-900">{product.name}</h3>
                      <div className="flex items-center gap-1 mb-2">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm text-gray-600">
                          {Number(product.rating).toFixed(1)} ({Number(product.reviewCount)})
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-green-600 font-bold text-lg">
                          ₹{finalPrice.toFixed(2)}
                        </span>
                        {Number(product.discount) > 0 && (
                          <span className="text-gray-400 line-through text-sm">
                            ₹{Number(product.price).toFixed(2)}
                          </span>
                        )}
                      </div>
                      <button 
                        onClick={() => handleAddToCart(product)}
                        disabled={addingToCart === product.id || product.stock === 0}
                        className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {addingToCart === product.id ? (
                          <Loader className="w-4 h-4 animate-spin" />
                        ) : (
                          <span>{product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}</span>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No highly rated products found.</p>
            </div>
          )}
        </div>
      </div>

      {/* Benefits Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="mb-4">Why Choose FreshMart?</h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            We're committed to providing fresh groceries while reducing food waste through smart technology.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 group hover:bg-green-200 transition-colors">
              <TrendingDown className="w-10 h-10 text-green-600 group-hover:scale-110 transition-transform" />
            </div>
            <h3 className="mb-3 text-xl font-semibold">Smart Discounts</h3>
            <p className="text-gray-600 leading-relaxed">
              Automatic price reductions on near-expiry products. Save 20-50% on quality items while helping reduce food waste.
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 group hover:bg-green-200 transition-colors">
              <Clock className="w-10 h-10 text-green-600 group-hover:scale-110 transition-transform" />
            </div>
            <h3 className="mb-3 text-xl font-semibold">Always Fresh</h3>
            <p className="text-gray-600 leading-relaxed">
              Real-time inventory tracking with expiry monitoring ensures you get the freshest products available with complete transparency.
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 group hover:bg-green-200 transition-colors">
              <Star className="w-10 h-10 text-green-600 group-hover:scale-110 transition-transform" />
            </div>
            <h3 className="mb-3 text-xl font-semibold">Quality Assured</h3>
            <p className="text-gray-600 leading-relaxed">
              Verified customer reviews and ratings help you make informed purchasing decisions. Join our community of happy customers.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold mb-4">Ready to Start Saving?</h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Join thousands of smart shoppers who save money while helping reduce food waste. Fresh groceries, great prices, better planet.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <button 
                onClick={() => onNavigate('products')}
                className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
              >
                Shop Now
              </button>
              {!currentUser && (
                <button 
                  onClick={() => onNavigate('customerLogin')}
                  className="px-8 py-3 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors font-semibold"
                >
                  Create Account
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}