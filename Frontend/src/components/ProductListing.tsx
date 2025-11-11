import { Star, TrendingDown, Clock, Filter, Loader, Search } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { Product, UserRole } from '../App';

interface ProductListingProps {
  userRole: UserRole;
  onProductClick: (product: Product) => void;
  addToCart: (product: Product) => void;
  showOnlyOffers?: boolean;
  currentUser?: any;
}

export function ProductListing({ userRole, onProductClick, addToCart, showOnlyOffers = false, currentUser }: ProductListingProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<string>('discount');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
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

  const categories = ['All', ...new Set(products.map(p => p.category))];

  // Enhanced add to cart with user check
  const handleAddToCart = async (product: Product) => {
    if (!currentUser && userRole !== 'customer') {
      alert('Please login as a customer to add items to cart');
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

  // Filter products based on showOnlyOffers and search
  let baseProducts = showOnlyOffers 
    ? products.filter(p => Number(p.discount) > 0) 
    : products;

  // Apply search filter
  if (searchTerm) {
    baseProducts = baseProducts.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  let filteredProducts = selectedCategory === 'All' 
    ? baseProducts 
    : baseProducts.filter(p => p.category === selectedCategory);

  // Sort products
  if (sortBy === 'discount') {
    filteredProducts = [...filteredProducts].sort((a, b) => Number(b.discount) - Number(a.discount));
  } else if (sortBy === 'price-low') {
    filteredProducts = [...filteredProducts].sort((a, b) => Number(a.price) - Number(b.price));
  } else if (sortBy === 'price-high') {
    filteredProducts = [...filteredProducts].sort((a, b) => Number(b.price) - Number(a.price));
  } else if (sortBy === 'rating') {
    filteredProducts = [...filteredProducts].sort((a, b) => Number(b.rating) - Number(a.rating));
  } else if (sortBy === 'expiry') {
    filteredProducts = [...filteredProducts].sort((a, b) => 
      new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()
    );
  }

  const getDaysLeft = (expiryDate: string) => {
    return Math.ceil((new Date(expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader className="w-5 h-5 animate-spin" />
          <p>Loading products from database...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="mb-2">{showOnlyOffers ? 'Special Offers' : 'Browse Products'}</h1>
            <p className="text-gray-600">
              {showOnlyOffers 
                ? 'Expiring soon products with exclusive discounts' 
                : 'Fresh groceries with smart expiry-based discounts'}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            {/* Search Bar */}
            <div className="relative flex-1 sm:flex-initial">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 w-full sm:w-64"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-600" />
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
              >
                <option value="discount">Highest Discount</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="expiry">Expiry: Soonest</option>
              </select>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-thin">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-2 rounded-full whitespace-nowrap transition-all duration-200 ${
                selectedCategory === category
                  ? 'bg-green-600 text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Results Info */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-600">
            Showing {filteredProducts.length} of {products.length} products
            {searchTerm && ` for "${searchTerm}"`}
            {selectedCategory !== 'All' && ` in ${selectedCategory}`}
          </p>
          {showOnlyOffers && (
            <div className="flex items-center gap-2 text-orange-600">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">Limited Time Offers</span>
            </div>
          )}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => {
            const daysLeft = getDaysLeft(product.expiryDate);
            const finalPrice = Number(product.price) * (1 - Number(product.discount) / 100);
            const isExpired = daysLeft <= 0;

            return (
              <div key={product.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group">
                <div className="relative">
                  <img 
                    src={product.image_url || '/placeholder-product.jpg'} 
                    alt={product.name} 
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  {Number(product.discount) > 0 && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm flex items-center gap-1 shadow-lg">
                      <TrendingDown className="w-4 h-4" />
                      {Number(product.discount)}% OFF
                    </div>
                  )}
                  
                  {daysLeft <= 3 && daysLeft > 0 && (
                    <div className="absolute top-2 left-2 bg-orange-500 text-white px-3 py-1 rounded-full text-sm flex items-center gap-1 shadow-lg">
                      <Clock className="w-4 h-4" />
                      {daysLeft}d left
                    </div>
                  )}
                  
                  {isExpired && (
                    <div className="absolute top-2 left-2 bg-red-600 text-white px-3 py-1 rounded-full text-sm flex items-center gap-1 shadow-lg">
                      <Clock className="w-4 h-4" />
                      Expired
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{product.name}</h3>
                      <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {product.category}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 mb-3">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm text-gray-600">
                      {Number(product.rating).toFixed(1)}
                    </span>
                    <span className="text-sm text-gray-400">
                      ({Number(product.reviewCount)})
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-green-600 font-bold text-lg">
                      ₹{finalPrice.toFixed(2)}
                    </span>
                    {Number(product.discount) > 0 && (
                      <span className="text-gray-400 line-through text-sm">
                        ₹{Number(product.price).toFixed(2)}
                      </span>
                    )}
                  </div>

                  <div className="text-sm text-gray-500 mb-3 space-y-1">
                    <div className="flex justify-between">
                      <span>Stock:</span>
                      <span className={Number(product.stock) < 10 ? 'text-orange-600 font-medium' : 'text-gray-700'}>
                        {product.stock} units
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Expires:</span>
                      <span className={isExpired ? 'text-red-600 font-medium' : daysLeft <= 3 ? 'text-orange-600' : 'text-gray-700'}>
                        {new Date(product.expiryDate).toLocaleDateString('en-IN')}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {userRole === 'customer' && (
                      <button 
                        id={`add-to-cart-${product.id}`}
                        onClick={() => handleAddToCart(product)}
                        disabled={addingToCart === product.id || isExpired || Number(product.stock) === 0}
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {addingToCart === product.id ? (
                          <Loader className="w-4 h-4 animate-spin" />
                        ) : (
                          <span>
                            {isExpired ? 'Expired' : 
                             Number(product.stock) === 0 ? 'Out of Stock' : 'Add to Cart'}
                          </span>
                        )}
                      </button>
                    )}
                    <button 
                      onClick={() => onProductClick(product)}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      {userRole === 'customer' ? 'Details' : 'View'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-gray-900 mb-2 text-lg font-semibold">No Products Found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm ? `No products found for "${searchTerm}"` : 'No products match your filters'}
            </p>
            {(searchTerm || selectedCategory !== 'All') && (
              <button 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('All');
                }}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}

        {/* Quick Stats Footer */}
        {filteredProducts.length > 0 && (
          <div className="mt-8 text-center text-sm text-gray-500">
            <div className="flex flex-wrap justify-center gap-6">
              <span>🔄 Real-time inventory</span>
              <span>⭐ Customer reviews</span>
              <span>💰 Smart discounts</span>
              <span>📱 Easy ordering</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}