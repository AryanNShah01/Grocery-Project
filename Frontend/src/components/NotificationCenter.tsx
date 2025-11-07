import { Bell, Clock, TrendingDown, Package, CheckCircle, X } from 'lucide-react';

interface NotificationCenterProps {
  onClose: () => void;
}

interface Notification {
  id: string;
  type: 'expiry' | 'discount' | 'order' | 'stock';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

export function NotificationCenter({ onClose }: NotificationCenterProps) {
  const mockNotifications: Notification[] = [
    {
      id: 'N001',
      type: 'expiry',
      title: 'Product Expiring Soon',
      message: 'Artisan Fresh Bread will expire in 1 day. Auto-discount of 50% has been applied.',
      time: '5 minutes ago',
      read: false
    },
    {
      id: 'N002',
      type: 'discount',
      title: 'New Discount Applied',
      message: 'Fresh Spinach Bundle now has 40% discount due to approaching expiry date.',
      time: '2 hours ago',
      read: false
    },
    {
      id: 'N003',
      type: 'order',
      title: 'Order Status Updated',
      message: 'Your order #ORD-12345 has been marked as Delivered.',
      time: '1 day ago',
      read: true
    },
    {
      id: 'N004',
      type: 'stock',
      title: 'Low Stock Alert',
      message: 'Berry Medley Pack has only 25 units left in stock.',
      time: '1 day ago',
      read: true
    },
    {
      id: 'N005',
      type: 'discount',
      title: 'Special Offer Alert',
      message: 'Save up to 50% on products expiring this week. Check out the offers section!',
      time: '2 days ago',
      read: true
    }
  ];

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
      default:
        return 'bg-gray-50';
    }
  };

  const unreadCount = mockNotifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="mb-2">Notifications</h1>
            <p className="text-gray-600">
              {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <div className="space-y-3">
          {mockNotifications.map(notification => (
            <div 
              key={notification.id}
              className={`bg-white rounded-lg p-4 hover:shadow-md transition ${
                !notification.read ? 'border-l-4 border-green-600' : ''
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-full ${getBgColor(notification.type)}`}>
                  {getIcon(notification.type)}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className={`${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                      {notification.title}
                    </h3>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-green-600 rounded-full mt-1.5" />
                    )}
                  </div>
                  <p className="text-gray-600 mb-2">{notification.message}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">{notification.time}</span>
                    {!notification.read && (
                      <button className="text-sm text-green-600 hover:text-green-700">
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {mockNotifications.length === 0 && (
          <div className="bg-white rounded-lg p-12 text-center">
            <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-gray-900 mb-2">No Notifications</h3>
            <p className="text-gray-500">
              You're all caught up! We'll notify you about important updates.
            </p>
          </div>
        )}

        {unreadCount > 0 && (
          <div className="mt-6 text-center">
            <button className="px-6 py-2 text-sm text-green-600 hover:text-green-700">
              Mark all as read
            </button>
          </div>
        )}

        {/* Notification Settings */}
        <div className="bg-white rounded-lg p-6 mt-8">
          <h2 className="mb-4">Notification Preferences</h2>
          <div className="space-y-3">
            <label className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-900">Product Expiry Alerts</div>
                <div className="text-xs text-gray-500">Get notified when products are expiring soon</div>
              </div>
              <input type="checkbox" defaultChecked className="w-5 h-5 text-green-600 rounded" />
            </label>
            <label className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-900">Discount Notifications</div>
                <div className="text-xs text-gray-500">Alert me when new discounts are applied</div>
              </div>
              <input type="checkbox" defaultChecked className="w-5 h-5 text-green-600 rounded" />
            </label>
            <label className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-900">Order Updates</div>
                <div className="text-xs text-gray-500">Track order status changes</div>
              </div>
              <input type="checkbox" defaultChecked className="w-5 h-5 text-green-600 rounded" />
            </label>
            <label className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-900">Low Stock Warnings</div>
                <div className="text-xs text-gray-500">Get alerts when inventory is running low</div>
              </div>
              <input type="checkbox" defaultChecked className="w-5 h-5 text-green-600 rounded" />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
