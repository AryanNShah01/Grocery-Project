import { useState } from 'react';
import { User, Mail, Lock, Phone, MapPin } from 'lucide-react';

interface CustomerLoginProps {
  onLogin: () => void;
  onNavigate: (page: string) => void;
}

export function CustomerLogin({ onLogin, onNavigate }: CustomerLoginProps) {
  const [isRegistering, setIsRegistering] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="mb-2">{isRegistering ? 'Create Account' : 'Customer Login'}</h1>
          <p className="text-gray-600">
            {isRegistering ? 'Join FreshMart for smart grocery shopping' : 'Welcome back to FreshMart'}
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
                      placeholder="John"
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
                      placeholder="Doe"
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
                  placeholder="you@example.com"
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
                  <label className="block text-sm mb-2 text-gray-700">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input 
                      type="tel" 
                      placeholder="+91 98765 43210"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm mb-2 text-gray-700">Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <textarea 
                      placeholder="House No, Street, Area, City, State, PIN Code"
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
              {isRegistering ? 'Create Account' : 'Login'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button 
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-green-600 hover:text-green-700"
            >
              {isRegistering ? 'Already have an account? Login' : "Don't have an account? Register"}
            </button>
          </div>

          <div className="mt-4 text-center">
            <button 
              onClick={() => onNavigate('storeOwnerLogin')}
              className="text-sm text-gray-600 hover:text-gray-700"
            >
              Are you a store owner? Click here
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
