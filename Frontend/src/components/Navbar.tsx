import { ShoppingCart, User, LogOut, Package, Bell, Store } from 'lucide-react';
import { useState, useEffect } from 'react';

interface NavbarProps {
  onNavigate: (page: string) => void;
  userRole: UserRole;
  onLogout: () => void;
  cartCount: number;
  currentUser?: any;
}

export function Navbar({ onNavigate, userRole, onLogout, cartCount, currentUser }: NavbarProps) {
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    // Simulate notification count
    setNotificationCount(Math.floor(Math.random() * 5));
  }, []);

  const handleLogout = () => {
    onLogout();
    onNavigate('home');
  };

  const getUserDisplayName = () => {
    if (!currentUser) return 'Guest';
    return currentUser.username || currentUser.email?.split('@')[0] || 'User';
  };

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div 
            className="flex items-center cursor-pointer group" 
            onClick={() => onNavigate('home')}
          >
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center mr-3 group-hover:bg-green-700 transition-colors">
              <Store className="w-5 h-5 text-white" />
            </div>
            <span className="text-green-600 text-xl font-bold">FreshMart</span>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center gap-6">
            {/* Home - Show to EVERYONE */}
            <button 
              onClick={() => onNavigate('home')}
              className="text-gray-700 hover:text-green-600 transition-colors font-medium"
            >
              Home
            </button>
            
            {/* Shop All & Special Offers - Show ONLY to customers and guests (NOT store owners) */}
            {userRole !== 'storeOwner' && (
              <>
                <button 
                  onClick={() => onNavigate('products')}
                  className="text-gray-700 hover:text-green-600 transition-colors font-medium"
                >
                  Shop All
                </button>
                <button 
                  onClick={() => onNavigate('offers')}
                  className="text-gray-700 hover:text-green-600 transition-colors font-medium"
                >
                  Special Offers
                </button>
              </>
            )}
            
            {/* Store Owner Links - Show ONLY to store owners */}
            {userRole === 'storeOwner' && (
              <>
                <button 
                  onClick={() => onNavigate('inventory')}
                  className="text-gray-700 hover:text-green-600 transition-colors font-medium"
                >
                  Inventory
                </button>
                <button 
                  onClick={() => onNavigate('discountManagement')}
                  className="text-gray-700 hover:text-green-600 transition-colors font-medium"
                >
                  Discounts
                </button>
                <button 
                  onClick={() => onNavigate('wasteLogs')}
                  className="text-gray-700 hover:text-green-600 transition-colors font-medium"
                >
                  Waste Analytics
                </button>
              </>
            )}

            {/* Customer Links - Show ONLY to customers */}
            {userRole === 'customer' && (
              <>
                <button 
                  onClick={() => onNavigate('orders')}
                  className="flex items-center gap-1 text-gray-700 hover:text-green-600 transition-colors font-medium"
                >
                  <Package className="w-5 h-5" />
                  My Orders
                </button>
                <button 
                  onClick={() => onNavigate('cart')}
                  className="flex items-center gap-1 text-gray-700 hover:text-green-600 transition-colors font-medium relative"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Cart
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center font-semibold animate-pulse">
                      {cartCount > 99 ? '99+' : cartCount}
                    </span>
                  )}
                </button>
              </>
            )}
          </div>

          {/* User Section */}
          <div className="flex items-center gap-4">
            {!userRole ? (
              <div className="flex gap-3">
                <button 
                  onClick={() => onNavigate('customerLogin')}
                  className="px-4 py-2 text-green-600 border border-green-600 rounded-lg hover:bg-green-50 transition-colors font-medium"
                >
                  Customer Login
                </button>
                <button 
                  onClick={() => onNavigate('storeOwnerLogin')}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  Store Login
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                {/* Notifications */}
                {userRole === 'customer' && (
                  <button 
                    onClick={() => onNavigate('notifications')}
                    className="relative p-2 text-gray-600 hover:text-green-600 transition-colors"
                  >
                    <Bell className="w-5 h-5" />
                    {notificationCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center font-semibold">
                        {notificationCount}
                      </span>
                    )}
                  </button>
                )}

                {/* User Info */}
                <div className="flex items-center gap-2 text-gray-700 border-r border-gray-200 pr-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="text-sm">
                    <div className="font-medium capitalize">{getUserDisplayName()}</div>
                    <div className="text-xs text-gray-500 capitalize">{userRole}</div>
                  </div>
                </div>

                {/* Logout */}
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-red-600 border border-gray-300 rounded-lg hover:border-red-600 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm font-medium">Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}