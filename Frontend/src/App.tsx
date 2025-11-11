import { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { LandingPage } from "./components/LandingPage";
import { CustomerLogin } from "./components/CustomerLogin";
import { StoreOwnerLogin } from "./components/StoreOwnerLogin";
import { ProductListing } from "./components/ProductListing";
import { ProductDetail } from "./components/ProductDetail";
import { DiscountManagement } from "./components/DiscountManagement";
import { InventoryManagement } from "./components/InventoryManagement";
import { OrdersPage } from "./components/OrdersPage";
import { PaymentPage } from "./components/PaymentPage";
import { ReviewsPage } from "./components/ReviewsPage";
import { WasteLogs } from "./components/WasteLogs";
import { NotificationCenter } from "./components/NotificationCenter";
import { StoreOwnerDashboard } from "./components/StoreOwnerDashboard";

export type UserRole = "customer" | "storeOwner" | null;

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
  image_url: string;
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
  status: "Placed" | "Allocated" | "Delivered";
  date: string;
  customerId: string;
}

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
}

export default function App() {
  const [currentPage, setCurrentPage] = useState("home");
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const API_BASE = "http://localhost:5000";

  // ✅ LOAD USER SESSION ON APP START
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Check if user is logged in from localStorage
        const savedUser = localStorage.getItem("user");
        const savedRole = localStorage.getItem("userRole");

        if (savedUser && savedRole) {
          const user = JSON.parse(savedUser);
          setCurrentUser(user);
          setUserRole(savedRole as UserRole);
        }

        // Load cart from localStorage
        const savedCart = localStorage.getItem("cart");
        if (savedCart) {
          setCart(JSON.parse(savedCart));
        }
      } catch (error) {
        console.error("Error initializing app:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeApp();
  }, []);

  // ✅ SAVE CART TO LOCALSTORAGE WHENEVER IT CHANGES
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // ✅ IMPROVED: Handle logout with proper cleanup
  const handleLogout = () => {
    setUserRole(null);
    setCurrentUser(null);
    setCart([]);
    setCurrentPage("home");

    // Clear localStorage
    localStorage.removeItem("user");
    localStorage.removeItem("userRole");
    localStorage.removeItem("token");
    localStorage.removeItem("cart");
    localStorage.removeItem("storeInfo");
  };

  // ✅ IMPROVED: Handle login with user data
  const handleCustomerLogin = (user: User) => {
    setUserRole("customer");
    setCurrentUser(user);
    setCurrentPage("home");
  };

  const handleStoreOwnerLogin = (user: User) => {
    setUserRole("storeOwner");
    setCurrentUser(user);
    setCurrentPage("home");
  };

  // ✅ IMPROVED: Add to cart with stock validation
  const addToCart = (product: Product) => {
    if (Number(product.stock) === 0) {
      alert("This product is out of stock");
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);

      if (existing) {
        // Check if adding more than available stock
        if (existing.quantity + 1 > Number(product.stock)) {
          alert(`Only ${product.stock} units available in stock`);
          return prev;
        }

        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart((prev) =>
      prev.map((item) => {
        if (item.id === productId) {
          // Check if quantity exceeds available stock
          if (quantity > Number(item.stock)) {
            alert(`Only ${item.stock} units available in stock`);
            return item;
          }
          return { ...item, quantity };
        }
        return item;
      })
    );
  };

  // ✅ IMPROVED: Create order with backend API
  const createOrder = async (orderId: string, paymentStatus: string) => {
    if (cart.length === 0 || !currentUser) return;

    try {
      // Calculate total
      const total = cart.reduce((sum, item) => {
        const itemPrice =
          Number(item.price) * (1 - Number(item.discount) / 100);
        return sum + itemPrice * item.quantity;
      }, 0);

      // Create order in frontend state
      const newOrder: Order = {
        id: orderId,
        items: [...cart],
        total,
        status: "Placed",
        date: new Date().toISOString(),
        customerId: currentUser.id.toString(),
      };

      setOrders((prev) => [...prev, newOrder]);
      setCart([]);
      setCurrentPage("orders");

      console.log("✅ Order created successfully:", newOrder);
    } catch (error) {
      console.error("Error creating order:", error);
      alert("Failed to create order. Please try again.");
    }
  };

  // ✅ IMPROVED: Product click handler
  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setCurrentPage("productDetail");
  };

  // ✅ IMPROVED: Page navigation with better naming
  const navigateTo = (page: string) => {
    setCurrentPage(page);
  };

  // Show loading screen while initializing
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading FreshMart...</p>
        </div>
      </div>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case "home":
        // Store owners see analytics dashboard, others see normal landing page
        if (userRole === "storeOwner") {
          return <StoreOwnerDashboard />;
        } else {
          return (
            <LandingPage
              onNavigate={navigateTo}
              onProductClick={handleProductClick}
              addToCart={addToCart}
              currentUser={currentUser}
            />
          );
        }

      case "customerLogin":
        return (
          <CustomerLogin
            onLogin={handleCustomerLogin}
            onNavigate={navigateTo}
          />
        );

      case "storeOwnerLogin":
        return (
          <StoreOwnerLogin
            onLogin={handleStoreOwnerLogin}
            onNavigate={navigateTo}
          />
        );

      case "products":
        return userRole === "storeOwner" ? (
          <StoreOwnerDashboard />
        ) : (
          <ProductListing
            userRole={userRole}
            onProductClick={handleProductClick}
            addToCart={addToCart}
            showOnlyOffers={false}
            currentUser={currentUser}
          />
        );

      case "offers":
        return userRole === "storeOwner" ? (
          <StoreOwnerDashboard />
        ) : (
          <div>
            {/* Your existing offers page for customers */}
            <div className="bg-gradient-to-r from-orange-100 to-red-50 py-12 border-b border-orange-200">
              <div className="max-w-7xl mx-auto px-4 text-center">
                <h1 className="text-4xl font-bold mb-4 text-gray-900">
                  🔥 Special Offers
                </h1>
                <p className="text-gray-700 text-xl">
                  Limited time discounts on expiring products - Save up to 50%!
                </p>
              </div>
            </div>
            <ProductListing
              userRole={userRole}
              onProductClick={handleProductClick}
              addToCart={addToCart}
              showOnlyOffers={true}
              currentUser={currentUser}
            />
          </div>
        );

      case "productDetail":
        return selectedProduct ? (
          <ProductDetail
            product={selectedProduct}
            onBack={() => navigateTo("products")}
            addToCart={addToCart}
            currentUser={currentUser}
          />
        ) : (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-600 mb-4">Product not found</p>
              <button
                onClick={() => navigateTo("products")}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Back to Products
              </button>
            </div>
          </div>
        );

      case "discountManagement":
        return userRole === "storeOwner" ? (
          <DiscountManagement />
        ) : (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                Access denied. Store owners only.
              </p>
              <button
                onClick={() => navigateTo("storeOwnerLogin")}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Store Owner Login
              </button>
            </div>
          </div>
        );

      case "inventory":
        return userRole === "storeOwner" ? (
          <InventoryManagement />
        ) : (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                Access denied. Store owners only.
              </p>
              <button
                onClick={() => navigateTo("storeOwnerLogin")}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Store Owner Login
              </button>
            </div>
          </div>
        );

      case "orders":
        return <OrdersPage userRole={userRole} currentUser={currentUser} />;

      case "payment":
        return (
          <PaymentPage
            cart={cart}
            onPaymentComplete={createOrder}
            onBack={() => navigateTo("cart")}
            currentUser={currentUser}
          />
        );

      case "analytics":
        return userRole === "storeOwner" ? (
          <StoreOwnerDashboard />
        ) : (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-600">Access denied. Store owners only.</p>
            </div>
          </div>
        );

      case "reviews":
        return <ReviewsPage />;

      case "wasteLogs":
        return userRole === "storeOwner" ? (
          <WasteLogs />
        ) : (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                Access denied. Store owners only.
              </p>
              <button
                onClick={() => navigateTo("storeOwnerLogin")}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Store Owner Login
              </button>
            </div>
          </div>
        );

      case "notifications":
        return (
          <NotificationCenter
            onClose={() => navigateTo("home")}
            currentUser={currentUser}
          />
        );

      case "cart":
        return (
          <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
              <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-gray-900">My Cart</h1>
                {cart.length > 0 && (
                  <button
                    onClick={() => navigateTo("products")}
                    className="px-4 py-2 text-green-600 border border-green-600 rounded-lg hover:bg-green-50"
                  >
                    Continue Shopping
                  </button>
                )}
              </div>

              {cart.length === 0 ? (
                <div className="bg-white rounded-lg p-12 text-center shadow-sm">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-4xl">🛒</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    Your cart is empty
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Add some fresh products to get started!
                  </p>
                  <button
                    onClick={() => navigateTo("products")}
                    className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="space-y-4">
                    {cart.map((item) => {
                      const itemPrice =
                        Number(item.price) * (1 - Number(item.discount) / 100);
                      const totalPrice = itemPrice * item.quantity;

                      return (
                        <div
                          key={item.id}
                          className="bg-white rounded-lg p-6 flex items-center gap-6 shadow-sm hover:shadow-md transition-shadow"
                        >
                          <img
                            src={item.image_url}
                            alt={item.name}
                            className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                            onError={(e) => {
                              e.currentTarget.src =
                                "https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&auto=format&fit=crop";
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 text-lg mb-1">
                              {item.name}
                            </h3>
                            <p className="text-gray-600 mb-2">
                              {item.category}
                            </p>
                            <div className="flex items-center gap-4 text-sm">
                              <span className="text-green-600 font-bold text-lg">
                                ₹{itemPrice.toFixed(2)}
                              </span>
                              {Number(item.discount) > 0 && (
                                <span className="text-gray-400 line-through">
                                  ₹{Number(item.price).toFixed(2)}
                                </span>
                              )}
                              {Number(item.discount) > 0 && (
                                <span className="text-red-500 bg-red-50 px-2 py-1 rounded text-xs font-medium">
                                  Save {Number(item.discount)}%
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-3 bg-gray-50 rounded-lg px-3 py-2">
                              <button
                                onClick={() =>
                                  updateCartQuantity(item.id, item.quantity - 1)
                                }
                                className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-green-600 hover:bg-white rounded transition-colors"
                              >
                                −
                              </button>
                              <span className="w-8 text-center font-semibold text-gray-900">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  updateCartQuantity(item.id, item.quantity + 1)
                                }
                                className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-green-600 hover:bg-white rounded transition-colors"
                              >
                                +
                              </button>
                            </div>

                            <div className="text-right min-w-20">
                              <div className="font-semibold text-gray-900 text-lg">
                                ₹{totalPrice.toFixed(2)}
                              </div>
                            </div>

                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                              title="Remove from cart"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Cart Summary */}
                  <div className="bg-white rounded-lg p-6 shadow-sm">
                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between text-lg">
                        <span className="text-gray-600">Subtotal:</span>
                        <span className="text-gray-900 font-semibold">
                          ₹
                          {cart
                            .reduce((sum, item) => {
                              const itemPrice =
                                Number(item.price) *
                                (1 - Number(item.discount) / 100);
                              return sum + itemPrice * item.quantity;
                            }, 0)
                            .toFixed(2)}
                        </span>
                      </div>

                      <div className="flex justify-between text-lg">
                        <span className="text-gray-600">Delivery:</span>
                        <span className="text-green-600 font-semibold">
                          FREE
                        </span>
                      </div>

                      <div className="border-t pt-3 flex justify-between text-xl font-bold">
                        <span>Total:</span>
                        <span className="text-green-600">
                          ₹
                          {cart
                            .reduce((sum, item) => {
                              const itemPrice =
                                Number(item.price) *
                                (1 - Number(item.discount) / 100);
                              return sum + itemPrice * item.quantity;
                            }, 0)
                            .toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <button
                        onClick={() => navigateTo("products")}
                        className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-colors"
                      >
                        Continue Shopping
                      </button>
                      <button
                        onClick={() => {
                          if (!currentUser) {
                            alert("Please login to proceed with payment");
                            navigateTo("customerLogin");
                            return;
                          }
                          navigateTo("payment");
                        }}
                        className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition-colors"
                      >
                        Proceed to Payment
                      </button>
                    </div>
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
            currentUser={currentUser}
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
        currentUser={currentUser}
      />
      <main className="flex-1">{renderPage()}</main>
      <Footer />
    </div>
  );
}
