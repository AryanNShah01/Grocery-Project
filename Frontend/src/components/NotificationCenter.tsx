import { Bell, Clock, TrendingDown, Package, CheckCircle, X, Loader, Settings } from 'lucide-react';
import { useState, useEffect } from 'react';

interface NotificationCenterProps {
  onClose: () => void;
  currentUser?: any;
}

interface Notification {
  id: string;
  type: 'expiry' | 'discount' | 'order' | 'stock' | 'system';
  title: string;
  message: string;
  time: string;
  read: boolean;
  actionUrl?: string;
}

export function NotificationCenter({ onClose, currentUser }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  // Simulate fetching notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockNotifications: Notification[] = [
        {
          id: 'N001',
          type: 'expiry',
          title: 'Product Expiring Soon',
          message: 'Fresh Milk will expire in 2 days. Auto-discount of 30% has been applied.',
          time: '5 minutes ago',
          read: false,
          actionUrl: '/products'
        },
        {
          id: 'N002',
          type: 'discount',
          title: 'New Discount Applied',
          message: 'Organic Bananas now have 40% discount due to approaching expiry date.',
          time: '2 hours ago',
          read: false,
          actionUrl: '/offers'
        },
        {
          id: 'N003',
          type: 'order',
          title: 'Order Status Updated',
          message: 'Your order #ORD-78910 has been successfully delivered.',
          time: '1 day ago',
          read: true
        },
        {
          id: 'N004',
          type: 'stock',
          title: 'Low Stock Alert',
          message: 'Greek Yogurt has only 15 units left in stock. Consider restocking soon.',
          time: '1 day ago',
          read: true
        },
        {
          id: 'N005',
          type: 'discount',
          title: 'Special Offer Alert',
          message: 'Save up to 50% on bakery products expiring this week. Limited stock available!',
          time: '2 days ago',
          read: true
        },
        {
          id: 'N006',
          type: 'system',
          title: 'Welcome to FreshMart!',
          message: 'Thank you for joining FreshMart. Start exploring fresh deals and save money on quality products.',
          time: '3 days ago',
          read: true
        }
      ];

      setNotifications(mockNotifications);
      setLoading(false);
    };

    fetchNotifications();
  }, []);

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'expiry':
        return <Clock className="w-5 h-5 text-orange-600" />;
      case 'discount':
        return <TrendingDown className="w-5 h-5 text-red-600" />;
      case 'order':
        return <Package className="w-5 h-5 text-blue-600" />;
      case 'stock':
        return <Bell className="w-5 h-5 text-purple-600" />;
      case 'system':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const getBgColor = (type: Notification['type']) => {
    switch (type) {
      case 'expiry':
        return 'bg-orange-50';
      case 'discount':
        return 'bg-red-50';
      case 'order':
        return 'bg-blue-50';
      case 'stock':
        return 'bg-purple-50';
      case 'system':
        return 'bg-green-50';
      default:
        return 'bg-gray-50';
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAllAsRead = async () => {
    setMarkingAll(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
    setMarkingAll(false);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader className="w-5 h-5 animate-spin" />
          <p>Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Bell className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
              <p className="text-gray-600">
                {unreadCount > 0 
                  ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
                  : 'All caught up!'
                }
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                disabled={markingAll}
                className="flex items-center gap-2 px-4 py-2 text-sm text-green-600 hover:text-green-700 font-medium disabled:opacity-50"
              >
                {markingAll ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
                Mark all as read
              </button>
            )}
            
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {notifications.map(notification => (
            <div 
              key={notification.id}
              className={`bg-white rounded-lg p-4 hover:shadow-md transition-all duration-200 border ${
                !notification.read ? 'border-l-4 border-green-600 shadow-sm' : 'border-gray-200'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-full ${getBgColor(notification.type)} flex-shrink-0`}>
                  {getIcon(notification.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className={`font-semibold ${
                      !notification.read ? 'text-gray-900' : 'text-gray-700'
                    }`}>
                      {notification.title}
                    </h3>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0 ml-2" />
                    )}
                  </div>
                  
                  <p className="text-gray-600 mb-2 leading-relaxed">{notification.message}</p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">{notification.time}</span>
                    
                    <div className="flex items-center gap-2">
                      {!notification.read && (
                        <button 
                          onClick={() => markAsRead(notification.id)}
                          className="text-sm text-green-600 hover:text-green-700 font-medium"
                        >
                          Mark as read
                        </button>
                      )}
                      
                      {notification.actionUrl && (
                        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                          View details
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {notifications.length === 0 && (
          <div className="bg-white rounded-lg p-12 text-center">
            <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-gray-900 mb-2 text-xl font-semibold">No Notifications</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              You're all caught up! We'll notify you about important updates, new discounts, and order status changes.
            </p>
          </div>
        )}

        {/* Notification Settings */}
        <div className="bg-white rounded-lg p-6 mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Notification Preferences</h2>
            <Settings className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            <label className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
              <div>
                <div className="text-sm font-medium text-gray-900">Product Expiry Alerts</div>
                <div className="text-xs text-gray-500">Get notified when products are expiring soon</div>
              </div>
              <input 
                type="checkbox" 
                defaultChecked 
                className="w-4 h-4 text-green-600 rounded focus:ring-green-500 border-gray-300" 
              />
            </label>
            
            <label className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
              <div>
                <div className="text-sm font-medium text-gray-900">Discount Notifications</div>
                <div className="text-xs text-gray-500">Alert me when new discounts are applied</div>
              </div>
              <input 
                type="checkbox" 
                defaultChecked 
                className="w-4 h-4 text-green-600 rounded focus:ring-green-500 border-gray-300" 
              />
            </label>
            
            <label className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
              <div>
                <div className="text-sm font-medium text-gray-900">Order Updates</div>
                <div className="text-xs text-gray-500">Track order status changes and delivery updates</div>
              </div>
              <input 
                type="checkbox" 
                defaultChecked 
                className="w-4 h-4 text-green-600 rounded focus:ring-green-500 border-gray-300" 
              />
            </label>
            
            <label className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
              <div>
                <div className="text-sm font-medium text-gray-900">Low Stock Warnings</div>
                <div className="text-xs text-gray-500">Get alerts when your favorite products are running low</div>
              </div>
              <input 
                type="checkbox" 
                defaultChecked 
                className="w-4 h-4 text-green-600 rounded focus:ring-green-500 border-gray-300" 
              />
            </label>
            
            <label className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
              <div>
                <div className="text-sm font-medium text-gray-900">Promotional Offers</div>
                <div className="text-xs text-gray-500">Receive special offers and seasonal promotions</div>
              </div>
              <input 
                type="checkbox" 
                defaultChecked 
                className="w-4 h-4 text-green-600 rounded focus:ring-green-500 border-gray-300" 
              />
            </label>
          </div>
        </div>

        {/* Help Section */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            Need help with notifications? <a href="#" className="text-green-600 hover:text-green-700 font-medium">Contact support</a>
          </p>
        </div>
      </div>
    </div>
  );
}