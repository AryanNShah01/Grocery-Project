import { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LandingPage } from './components/LandingPage';
import { CustomerLogin } from './components/CustomerLogin';
import { StoreOwnerLogin } from './components/StoreOwnerLogin';
import { ProductListing } from './components/ProductListing';
import { ProductDetail } from './components/ProductDetail';
import { DiscountManagement } from './components/DiscountManagement';
import { InventoryManagement } from './components/InventoryManagement';
import { OrdersPage } from './components/OrdersPage';
import { PaymentPage } from './components/PaymentPage';
import { ReviewsPage } from './components/ReviewsPage';
import { WasteLogs } from './components/WasteLogs';
import { NotificationCenter } from './components/NotificationCenter';

export type UserRole = 'customer' | 'storeOwner' | null;

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  expiryDate: string;
  stock: number;
  discount: number;
  rating: number;
  reviewCount: number;
  image_url: string; // ✅ CHANGED: Use image_url to match database
  description: string;
  storeId: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  status: 'Placed' | 'Allocated' | 'Delivered';
  date: string;
  customerId: string;
}

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  // ✅ IMPROVED: Handle logout with page redirect
  const handleLogout = () => {
    setUserRole(null);
    setCurrentPage('home'); // Always redirect to home after logout
    setCart([]); // Clear cart on logout
  };

  // ✅ IMPROVED: Handle login with role-specific redirect
  const handleLogin = (role: UserRole) => {
    setUserRole(role);
    setCurrentPage('home');
  };

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    setCart(prev => 
      prev.map(item => 
        item.id === productId ? { ...item, quantity } : item
      ).filter(item => item.quantity > 0)
    );
  };

  const createOrder = (paymentStatus: string) => {
    if (cart.length === 0) return;
    
    const total = cart.reduce((sum, item) => {
      const itemPrice = Number(item.price) * (1 - Number(item.discount) / 100);
      return sum + itemPrice * item.quantity;
    }, 0);

    const newOrder: Order = {
      id: `ORD-${Date.now()}`,
      items: [...cart],
      total,
      status: 'Placed',
      date: new Date().toISOString(),
      customerId: 'CUST-001'
    };

    setOrders(prev => [...prev, newOrder]);
    setCart([]);
    setCurrentPage('orders');
  };

  // ✅ IMPROVED: Product click handler
  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setCurrentPage('productDetail');
  };

  // ✅ IMPROVED: Page navigation with better naming
  const navigateTo = (page: string) => {
    setCurrentPage(page);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return (
          <LandingPage 
            onNavigate={navigateTo} 
            onProductClick={handleProductClick} 
            addToCart={addToCart} 
          />
        );

      case 'customerLogin':
        return (
          <CustomerLogin 
            onLogin={() => handleLogin('customer')} 
            onNavigate={navigateTo} 
          />
        );

      case 'storeOwnerLogin':
        return (
          <StoreOwnerLogin 
            onLogin={() => handleLogin('storeOwner')} 
            onNavigate={navigateTo} 
          />
        );

      case 'products':
        return (
          <ProductListing 
            userRole={userRole} 
            onProductClick={handleProductClick} 
            addToCart={addToCart} 
            showOnlyOffers={false} 
          />
        );

      case 'offers':
        return (
          <div>
            {/* ✅ DISTINCT HEADER FOR OFFERS PAGE */}
            <div className="bg-gradient-to-r from-orange-100 to-red-50 py-12 border-b border-orange-200">
              <div className="max-w-7xl mx-auto px-4 text-center">
                <h1 className="text-4xl font-bold mb-4 text-gray-900">🔥 Special Offers</h1> {/* ✅ FIXED: Added fire emoji */}
                <p className="text-gray-700 text-xl"> {/* ✅ FIXED: Changed x1 to xl */}
                  Limited time discounts on expiring products - Save up to 50%!
                </p>
              </div>
            </div>
            <ProductListing 
              userRole={userRole} 
              onProductClick={handleProductClick} 
              addToCart={addToCart} 
              showOnlyOffers={true} 
            />
          </div>
        );

      case 'productDetail':
        return selectedProduct ? (
          <ProductDetail 
            product={selectedProduct} 
            onBack={() => navigateTo('products')} 
            addToCart={addToCart} 
          />
        ) : (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <p>Product not found</p>
          </div>
        );

      case 'discountManagement':
        return userRole === 'storeOwner' ? (
          <DiscountManagement />
        ) : (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <p>Access denied. Store owners only.</p>
          </div>
        );

      case 'inventory':
        return userRole === 'storeOwner' ? (
          <InventoryManagement />
        ) : (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <p>Access denied. Store owners only.</p>
          </div>
        );

      case 'orders':
        return <OrdersPage userRole={userRole} orders={orders} />;

      case 'payment':
        return (
          <PaymentPage 
            cart={cart} 
            onPaymentComplete={createOrder} 
            onBack={() => navigateTo('cart')} 
          />
        );

      case 'reviews':
        return <ReviewsPage />;

      case 'wasteLogs':
        return userRole === 'storeOwner' ? (
          <WasteLogs />
        ) : (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <p>Access denied. Store owners only.</p>
          </div>
        );

      case 'notifications':
        return <NotificationCenter onClose={() => navigateTo('home')} />;

      case 'cart':
        return (
          <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
              <h1 className="mb-8">My Cart</h1>
              {cart.length === 0 ? (
                <div className="bg-white rounded-lg p-12 text-center">
                  <p className="text-gray-500 mb-4">Your cart is empty</p>
                  <button 
                    onClick={() => navigateTo('products')} 
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map(item => {
                    const itemPrice = Number(item.price) * (1 - Number(item.discount) / 100);
                    return (
                      <div key={item.id} className="bg-white rounded-lg p-4 flex items-center gap-4">
                        {/* ✅ FIXED: Use actual product images in cart */}
                        <img 
                          src={item.image_url} 
                          alt={item.name} 
                          className="w-20 h-20 object-cover rounded"
                          onError={(e) => {
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&auto=format&fit=crop';
                          }}
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold">{item.name}</h3>
                          <p className="text-gray-600">
                            ₹{itemPrice.toFixed(2)} 
                            {Number(item.discount) > 0 && (
                              <span className="line-through text-gray-400 ml-2">
                                ₹{Number(item.price).toFixed(2)}
                              </span>
                            )}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => updateCartQuantity(item.id, item.quantity - 1)} 
                            className="px-3 py-1 border rounded hover:bg-gray-50"
                          >
                            -
                          </button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <button 
                            onClick={() => updateCartQuantity(item.id, item.quantity + 1)} 
                            className="px-3 py-1 border rounded hover:bg-gray-50"
                          >
                            +
                          </button>
                        </div>
                        <button 
                          onClick={() => removeFromCart(item.id)} 
                          className="text-red-600 hover:text-red-700 px-3 py-1 border border-red-200 rounded hover:bg-red-50"
                        >
                          Remove
                        </button>
                      </div>
                    );
                  })}
                  <div className="bg-white rounded-lg p-6">
                    <div className="flex justify-between mb-4 text-lg font-semibold">
                      <span>Total:</span>
                      <span className="text-green-600">
                        ₹{cart.reduce((sum, item) => {
                          const itemPrice = Number(item.price) * (1 - Number(item.discount) / 100);
                          return sum + itemPrice * item.quantity;
                        }, 0).toFixed(2)}
                      </span>
                    </div>
                    <button 
                      onClick={() => navigateTo('payment')} 
                      className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
                    >
                      Proceed to Payment
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return (
          <LandingPage 
            onNavigate={navigateTo} 
            onProductClick={handleProductClick} 
            addToCart={addToCart} 
          />
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar 
        onNavigate={navigateTo} 
        userRole={userRole} 
        onLogout={handleLogout}
        cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
      />
      <main className="flex-1">
        {renderPage()}
      </main>
      <Footer />
    </div>
  );
}