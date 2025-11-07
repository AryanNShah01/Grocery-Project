import { Star, TrendingDown, Clock, Filter } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { Product, UserRole } from '../App';

interface ProductListingProps {
  userRole: UserRole;
  onProductClick: (product: Product) => void;
  addToCart: (product: Product) => void;
  showOnlyOffers?: boolean;
}

export function ProductListing({ userRole, onProductClick, addToCart, showOnlyOffers = false }: ProductListingProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<string>('discount');
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

  const categories = ['All', ...new Set(products.map(p => p.category))];

  // Filter products based on showOnlyOffers
  let baseProducts = showOnlyOffers 
    ? products.filter(p => Number(p.discount) > 0) 
    : products;

  let filteredProducts = selectedCategory === 'All' 
    ? baseProducts 
    : baseProducts.filter(p => p.category === selectedCategory);

  // Sort products (FIXED: Convert to numbers for sorting)
  if (sortBy === 'discount') {
    filteredProducts = [...filteredProducts].sort((a, b) => Number(b.discount) - Number(a.discount));
  } else if (sortBy === 'price-low') {
    filteredProducts = [...filteredProducts].sort((a, b) => Number(a.price) - Number(b.price));
  } else if (sortBy === 'price-high') {
    filteredProducts = [...filteredProducts].sort((a, b) => Number(b.price) - Number(a.price));
  } else if (sortBy === 'rating') {
    filteredProducts = [...filteredProducts].sort((a, b) => Number(b.rating) - Number(a.rating));
  }

  const getDaysLeft = (expiryDate: string) => {
    return Math.ceil((new Date(expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  };

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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="mb-2">{showOnlyOffers ? 'Special Offers' : 'Browse Products'}</h1>
            <p className="text-gray-600">
              {showOnlyOffers 
                ? 'Expiring soon products with exclusive discounts' 
                : 'Fresh groceries with smart expiry-based discounts'}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-600" />
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="discount">Highest Discount</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-2 rounded-full whitespace-nowrap transition ${
                selectedCategory === category
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => {
            const daysLeft = getDaysLeft(product.expiryDate);
            const finalPrice = Number(product.price) * (1 - Number(product.discount) / 100);

            return (
              <div key={product.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition overflow-hidden">
                <div className="relative">
                  {/* ✅ RESTORED IMAGES */}
                  <img 
                    src={product.image_url} 
                    alt={product.name} 
                    className="w-full h-48 object-cover"
                  />
                  
                  {Number(product.discount) > 0 && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm flex items-center gap-1">
                      <TrendingDown className="w-4 h-4" />
                      {Number(product.discount)}% OFF
                    </div>
                  )}
                  
                  {daysLeft <= 3 && daysLeft > 0 && (
                    <div className="absolute top-2 left-2 bg-orange-500 text-white px-3 py-1 rounded-full text-sm flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {daysLeft}d left
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="mb-1">{product.name}</h3>
                      <span className="text-sm text-gray-500">{product.category}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 mb-3">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm text-gray-600">{Number(product.rating)}</span>
                    <span className="text-sm text-gray-400">({Number(product.reviewCount)})</span>
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-green-600">₹{finalPrice.toFixed(2)}</span>
                    {Number(product.discount) > 0 && (
                      <span className="text-gray-400 line-through text-sm">₹{Number(product.price).toFixed(2)}</span>
                    )}
                  </div>

                  <div className="text-sm text-gray-500 mb-3">
                    <div>Stock: {Number(product.stock)} units</div>
                    <div>Expires: {new Date(product.expiryDate).toLocaleDateString()}</div>
                  </div>

                  <div className="flex gap-2">
                    {userRole === 'customer' && (
                      <button 
                        onClick={() => addToCart(product)}
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        Add to Cart
                      </button>
                    )}
                    <button 
                      onClick={() => onProductClick(product)}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
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
          <div className="text-center py-12">
            <p className="text-gray-500">No products found in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
}