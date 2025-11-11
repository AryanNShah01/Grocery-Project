import { Package, Clock, CheckCircle, Truck, Loader, ExternalLink } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { UserRole } from '../App';

interface OrderItem {
  product_id: string;
  quantity: number;
  price: number;
  discount: number;
  name: string;
  image_url: string;
}

interface Order {
  id: number;
  user_id: number;
  total_amount: number; // This should be number but might come as string
  status: string;
  order_date: string;
  product_id?: string;
  quantity?: number;
  price?: number;
  discount?: number;
  name?: string;
  image_url?: string;
  items?: OrderItem[];
}

interface OrdersPageProps {
  userRole: UserRole;
  currentUser?: any;
}

export function OrdersPage({ userRole, currentUser }: OrdersPageProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_BASE = 'http://localhost:5000';

  // ✅ FETCH REAL ORDERS FROM BACKEND
  useEffect(() => {
    async function fetchOrders() {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE}/orders/user/${currentUser.id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch orders');
        }

        // Transform the data to match our frontend structure
        const transformedOrders = transformOrderData(data);
        setOrders(transformedOrders);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError(err instanceof Error ? err.message : 'Failed to load orders');
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, [currentUser]);

  // Transform backend order data to frontend format
  const transformOrderData = (backendOrders: any[]): Order[] => {
    const orderMap = new Map();

    backendOrders.forEach(item => {
      if (!orderMap.has(item.id)) {
        orderMap.set(item.id, {
          id: item.id,
          user_id: item.user_id,
          // ✅ FIX: Convert total_amount to number
          total_amount: Number(item.total_amount) || 0,
          status: item.status,
          order_date: item.order_date,
          items: []
        });
      }

      if (item.product_id) {
        orderMap.get(item.id).items.push({
          product_id: item.product_id,
          quantity: item.quantity,
          // ✅ FIX: Convert price to number
          price: Number(item.price) || 0,
          // ✅ FIX: Convert discount to number
          discount: Number(item.discount) || 0,
          name: item.name,
          image_url: item.image_url
        });
      }
    });

    return Array.from(orderMap.values());
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <Clock className="w-5 h-5 text-orange-600" />;
      case 'paid':
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'shipped':
        return <Truck className="w-5 h-5 text-blue-600" />;
      default:
        return <Package className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-orange-100 text-orange-700';
      case 'paid':
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'shipped':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'Pending Payment';
      case 'paid':
        return 'Payment Received';
      case 'completed':
        return 'Delivered';
      case 'shipped':
        return 'Shipped';
      default:
        return status;
    }
  };

  // ✅ FIX: Safe number formatting function
  const formatCurrency = (amount: any): string => {
    const num = Number(amount);
    if (isNaN(num)) return '₹0.00';
    return `₹${num.toFixed(2)}`;
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

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-gray-900 mb-2">Login Required</h2>
          <p className="text-gray-600">Please log in to view your order history.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader className="w-5 h-5 animate-spin" />
          <p>Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-gray-900 mb-2">Error Loading Orders</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="mb-2">My Orders</h1>
          <p className="text-gray-600">Track your order status and history</p>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center shadow-sm">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-gray-900 mb-2 text-xl font-semibold">No Orders Yet</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              You haven't placed any orders yet. Start shopping to discover amazing deals on fresh groceries!
            </p>
            <button 
              onClick={() => window.location.href = '/#products'}
              className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                {/* Order Header */}
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(order.status)}
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">
                        Order #: <span className="font-mono font-medium">{order.id}</span>
                      </p>
                      <p className="text-sm text-gray-500">
                        Placed on {new Date(order.order_date).toLocaleDateString('en-IN', { 
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {/* ✅ FIX: Use safe formatting function */}
                    <p className="text-xl font-bold text-green-600">{formatCurrency(order.total_amount)}</p>
                    <p className="text-sm text-gray-600">
                      {order.items?.reduce((sum, item) => sum + item.quantity, 0) || 1} items
                    </p>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-6">
                  <div className="space-y-4">
                    {order.items && order.items.length > 0 ? (
                      order.items.map((item, index) => {
                        // ✅ FIX: Convert to numbers for calculation
                        const itemPrice = Number(item.price) * (1 - Number(item.discount) / 100);
                        return (
                          <div key={`${item.product_id}-${index}`} className="flex items-center gap-4 pb-4 border-b border-gray-100 last:border-b-0 last:pb-0">
                            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              {item.image_url ? (
                                <img 
                                  src={item.image_url} 
                                  alt={item.name}
                                  className="w-16 h-16 object-cover rounded-lg"
                                  onError={(e) => {
                                    e.currentTarget.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&auto=format&fit=crop';
                                  }}
                                />
                              ) : (
                                <Package className="w-8 h-8 text-gray-400" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-gray-900 truncate">{item.name}</h4>
                              <p className="text-sm text-gray-600 mt-1">
                                {formatCurrency(itemPrice)} × {item.quantity}
                                {Number(item.discount) > 0 && (
                                  <span className="line-through text-gray-400 ml-2">
                                    {formatCurrency(item.price)}
                                  </span>
                                )}
                              </p>
                              {Number(item.discount) > 0 && (
                                <p className="text-xs text-green-600 mt-1">
                                  Saved {Number(item.discount)}% on this item
                                </p>
                              )}
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="font-semibold text-gray-900">
                                {/* ✅ FIX: Safe calculation */}
                                {formatCurrency(itemPrice * item.quantity)}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      // Fallback for orders without items array
                      <div className="flex items-center gap-4 py-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Package className="w-8 h-8 text-gray-400" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">Order Items</h4>
                          <p className="text-sm text-gray-600">Product details unavailable</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">{formatCurrency(order.total_amount)}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Order Actions */}
                  <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-500">
                      Need help with this order?
                    </div>
                    <div className="flex gap-3">
                      <button className="flex items-center gap-2 px-4 py-2 text-sm text-green-600 hover:text-green-700 font-medium">
                        <ExternalLink className="w-4 h-4" />
                        Track Order
                      </button>
                      <button className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                        Reorder
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Orders Summary */}
        {orders.length > 0 && (
          <div className="mt-8 bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Orders Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-gray-900">{orders.length}</div>
                <div className="text-sm text-gray-600">Total Orders</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {/* ✅ FIX: Safe total calculation */}
                  {formatCurrency(orders.reduce((sum, order) => sum + Number(order.total_amount), 0))}
                </div>
                <div className="text-sm text-gray-600">Total Spent</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {orders.filter(o => o.status.toLowerCase() === 'completed').length}
                </div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  {orders.filter(o => o.status.toLowerCase() === 'pending').length}
                </div>
                <div className="text-sm text-gray-600">Pending</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}