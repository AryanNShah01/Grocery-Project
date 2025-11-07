import { Package, Clock, CheckCircle, Truck } from 'lucide-react';
import type { Order, UserRole } from '../App';

interface OrdersPageProps {
  userRole: UserRole;
  orders: Order[];
}

export function OrdersPage({ userRole, orders }: OrdersPageProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Placed':
        return <Package className="w-5 h-5 text-blue-600" />;
      case 'Allocated':
        return <Clock className="w-5 h-5 text-orange-600" />;
      case 'Delivered':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      default:
        return <Truck className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Placed':
        return 'bg-blue-100 text-blue-700';
      case 'Allocated':
        return 'bg-orange-100 text-orange-700';
      case 'Delivered':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (userRole !== 'customer') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-gray-900 mb-2">Access Required</h2>
          <p className="text-gray-600">Please log in as a customer to view your orders.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="mb-2">My Orders</h1>
          <p className="text-gray-600">Track your order status and history</p>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-gray-900 mb-2">No Orders Yet</h3>
            <p className="text-gray-500 mb-6">You haven't placed any orders yet.</p>
            <button 
              onClick={() => window.location.href = '/products'}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow-sm border">
                {/* Order Header */}
                <div className="px-6 py-4 border-b flex justify-between items-center">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {getStatusIcon(order.status)}
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Order #: {order.id} • Placed on {new Date(order.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-green-600">₹{order.total.toFixed(2)}</p>
                    <p className="text-sm text-gray-600">{order.items.reduce((sum, item) => sum + item.quantity, 0)} items</p>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-6">
                  <div className="space-y-4">
                    {order.items.map((item) => {
                      const itemPrice = Number(item.price) * (1 - Number(item.discount) / 100);
                      return (
                        <div key={item.id} className="flex items-center gap-4">
                          {/* ✅ FIXED: Use image_url with error handling */}
                          <img 
                            src={item.image_url} 
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded"
                            onError={(e) => {
                              e.currentTarget.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&auto=format&fit=crop';
                            }}
                          />
                          <div className="flex-1">
                            <h4 className="font-medium">{item.name}</h4>
                            <p className="text-sm text-gray-600">
                              ₹{itemPrice.toFixed(2)} × {item.quantity}
                              {Number(item.discount) > 0 && (
                                <span className="line-through text-gray-400 ml-2">
                                  ₹{Number(item.price).toFixed(2)}
                                </span>
                              )}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">
                              ₹{(itemPrice * item.quantity).toFixed(2)}
                            </p>
                            {Number(item.discount) > 0 && (
                              <p className="text-sm text-green-600">
                                Saved {Number(item.discount)}%
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}