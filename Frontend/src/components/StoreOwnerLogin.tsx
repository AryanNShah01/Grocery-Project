import { useState } from 'react';
import { User, Mail, Lock, Store, MapPin } from 'lucide-react';

interface StoreOwnerLoginProps {
  onLogin: () => void;
  onNavigate: (page: string) => void;
}

export function StoreOwnerLogin({ onLogin, onNavigate }: StoreOwnerLoginProps) {
  const [isRegistering, setIsRegistering] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="mb-2">{isRegistering ? 'Register Your Store' : 'Store Owner Login'}</h1>
          <p className="text-gray-600">
            {isRegistering ? 'Start selling on FreshMart today' : 'Manage your inventory and sales'}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegistering && (
              <>
                <div>
                  <label className="block text-sm mb-2 text-gray-700">First Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input 
                      type="text" 
                      placeholder="Jane"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm mb-2 text-gray-700">Last Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input 
                      type="text" 
                      placeholder="Smith"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm mb-2 text-gray-700">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  type="email" 
                  placeholder="owner@store.com"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm mb-2 text-gray-700">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  type="password" 
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
            </div>

            {isRegistering && (
              <>
                <div>
                  <label className="block text-sm mb-2 text-gray-700">Store Name</label>
                  <div className="relative">
                    <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input 
                      type="text" 
                      placeholder="Your Store Name"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm mb-2 text-gray-700">Store Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <textarea 
                      placeholder="Shop No, Building, Area, City, State, PIN Code"
                      rows={3}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                      required
                    />
                  </div>
                </div>
              </>
            )}

            <button 
              type="submit"
              className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              {isRegistering ? 'Register Store' : 'Login'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button 
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-green-600 hover:text-green-700"
            >
              {isRegistering ? 'Already have an account? Login' : "Don't have a store account? Register"}
            </button>
          </div>

          <div className="mt-4 text-center">
            <button 
              onClick={() => onNavigate('customerLogin')}
              className="text-sm text-gray-600 hover:text-gray-700"
            >
              Are you a customer? Click here
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
