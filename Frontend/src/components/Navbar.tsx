import { ShoppingCart, User, LogOut, Package } from 'lucide-react';

interface NavbarProps {
  onNavigate: (page: string) => void;
  userRole: UserRole;
  onLogout: () => void;
  cartCount: number;
}

export function Navbar({ onNavigate, userRole, onLogout, cartCount }: NavbarProps) {
  const handleLogout = () => {
    onLogout();
    onNavigate('home');
  };

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div 
            className="flex items-center cursor-pointer" 
            onClick={() => onNavigate('home')}
          >
            <span className="text-green-600 text-xl font-bold">FreshMart</span>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center gap-6">
            <button 
              onClick={() => onNavigate('home')}
              className="text-gray-700 hover:text-green-600"
            >
              Home
            </button>
            <button 
              onClick={() => onNavigate('products')}
              className="text-gray-700 hover:text-green-600"
            >
              Shop All
            </button>
            <button 
              onClick={() => onNavigate('offers')}
              className="text-gray-700 hover:text-green-600"
            >
              Special Offers
            </button>
            
            {userRole === 'storeOwner' && (
              <>
                <button 
                  onClick={() => onNavigate('inventory')}
                  className="text-gray-700 hover:text-green-600"
                >
                  Inventory
                </button>
                <button 
                  onClick={() => onNavigate('discountManagement')}
                  className="text-gray-700 hover:text-green-600"
                >
                  Discounts
                </button>
                <button 
                  onClick={() => onNavigate('wasteLogs')}
                  className="text-gray-700 hover:text-green-600"
                >
                  Waste Logs
                </button>
              </>
            )}

            {userRole === 'customer' && (
              <>
                <button 
                  onClick={() => onNavigate('orders')}
                  className="flex items-center gap-1 text-gray-700 hover:text-green-600"
                >
                  <Package className="w-5 h-5" />
                  My Orders
                </button>
                <button 
                  onClick={() => onNavigate('cart')}
                  className="flex items-center gap-1 text-gray-700 hover:text-green-600 relative"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Cart
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                      {cartCount}
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
                  className="px-4 py-2 text-green-600 border border-green-600 rounded-lg hover:bg-green-50"
                >
                  Customer Login
                </button>
                <button 
                  onClick={() => onNavigate('storeOwnerLogin')}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Store Login
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-gray-700">
                  <User className="w-4 h-4" />
                  <span className="capitalize">{userRole}</span>
                </div>
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-red-600 border border-gray-300 rounded-lg hover:border-red-600"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}