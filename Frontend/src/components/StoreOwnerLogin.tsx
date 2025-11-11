import { useState } from 'react';
import { User, Mail, Lock, Store, MapPin, Loader } from 'lucide-react';

interface StoreOwnerLoginProps {
  onLogin: (user: any) => void;
  onNavigate: (page: string) => void;
}

export function StoreOwnerLogin({ onLogin, onNavigate }: StoreOwnerLoginProps) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    storeName: '',
    storeLocation: ''
  });

  const API_BASE = 'http://localhost:5000';

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const username = `${formData.firstName} ${formData.lastName}`.trim();
      const storeUsername = `${formData.storeName.replace(/\s+/g, '')}_${username.replace(/\s+/g, '')}`;
      
      const response = await fetch(`${API_BASE}/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: storeUsername,
          email: formData.email,
          password: formData.password,
          role: 'store_owner'
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Store registration failed');
      }

      console.log('✅ Store owner registration successful:', data);
      
      // Store additional store info in localStorage
      const storeInfo = {
        storeName: formData.storeName,
        storeLocation: formData.storeLocation,
        ownerName: username
      };
      localStorage.setItem('storeInfo', JSON.stringify(storeInfo));
      
      // Auto-login after successful registration
      await handleLoginAfterRegister(formData.email, formData.password);
      
    } catch (err) {
      console.error('❌ Store registration error:', err);
      setError(err instanceof Error ? err.message : 'Store registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginAfterRegister = async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE}/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      console.log('✅ Store owner login successful:', data);
      
      // Store user data in localStorage
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('token', 'store-owner-logged-in');
      localStorage.setItem('userRole', 'store_owner');
      
      // Call parent onLogin with user data
      onLogin(data.user);
      
    } catch (err) {
      console.error('❌ Auto-login error:', err);
      setError('Registration successful but login failed. Please login manually.');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE}/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Check if user is a store owner
      if (data.user.role !== 'store_owner') {
        throw new Error('This account is not registered as a store owner');
      }

      console.log('✅ Store owner login successful:', data);
      
      // Store user data in localStorage
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('token', 'store-owner-logged-in');
      localStorage.setItem('userRole', 'store_owner');
      
      // Call parent onLogin with user data
      onLogin(data.user);
      
    } catch (err) {
      console.error('❌ Login error:', err);
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    if (isRegistering) {
      handleRegister(e);
    } else {
      handleLogin(e);
    }
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
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegistering && (
              <>
                <div>
                  <label className="block text-sm mb-2 text-gray-700">First Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input 
                      type="text" 
                      name="firstName"
                      placeholder="Jane"
                      value={formData.firstName}
                      onChange={handleInputChange}
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
                      name="lastName"
                      placeholder="Smith"
                      value={formData.lastName}
                      onChange={handleInputChange}
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
                  name="email"
                  placeholder="owner@store.com"
                  value={formData.email}
                  onChange={handleInputChange}
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
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                  minLength={6}
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
                      name="storeName"
                      placeholder="Your Store Name"
                      value={formData.storeName}
                      onChange={handleInputChange}
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
                      name="storeLocation"
                      placeholder="Shop No, Building, Area, City, State, PIN Code"
                      value={formData.storeLocation}
                      onChange={handleInputChange}
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
              disabled={isLoading}
              className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin mr-2" />
                  {isRegistering ? 'Registering Store...' : 'Logging in...'}
                </>
              ) : (
                isRegistering ? 'Register Store' : 'Login'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button 
              onClick={() => {
                setIsRegistering(!isRegistering);
                setError('');
                setFormData({
                  firstName: '',
                  lastName: '',
                  email: '',
                  password: '',
                  storeName: '',
                  storeLocation: ''
                });
              }}
              className="text-green-600 hover:text-green-700"
              disabled={isLoading}
            >
              {isRegistering ? 'Already have an account? Login' : "Don't have a store account? Register"}
            </button>
          </div>

          <div className="mt-4 text-center">
            <button 
              onClick={() => onNavigate('customerLogin')}
              className="text-sm text-gray-600 hover:text-gray-700"
              disabled={isLoading}
            >
              Are you a customer? Click here
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}