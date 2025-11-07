import { CreditCard, Smartphone, Wallet, ArrowLeft, Shield } from 'lucide-react';
import { useState } from 'react';
import type { CartItem } from '../App';

interface PaymentPageProps {
  cart: CartItem[];
  onPaymentComplete: (paymentStatus: string) => void;
  onBack: () => void;
}

export function PaymentPage({ cart, onPaymentComplete, onBack }: PaymentPageProps) {
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'cod'>('upi');

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = cart.reduce((sum, item) => sum + (item.price * item.discount / 100) * item.quantity, 0);
  const total = subtotal - discount;

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    onPaymentComplete('Completed');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Cart
        </button>

        <h1 className="mb-8">Payment</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg p-6 mb-6">
              <h2 className="mb-6">Select Payment Method</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <button
                  onClick={() => setPaymentMethod('card')}
                  className={`p-4 border-2 rounded-lg flex flex-col items-center gap-2 transition ${
                    paymentMethod === 'card' 
                      ? 'border-green-600 bg-green-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <CreditCard className={`w-8 h-8 ${paymentMethod === 'card' ? 'text-green-600' : 'text-gray-600'}`} />
                  <span className={`text-sm ${paymentMethod === 'card' ? 'text-green-600' : 'text-gray-700'}`}>
                    Card
                  </span>
                </button>

                <button
                  onClick={() => setPaymentMethod('upi')}
                  className={`p-4 border-2 rounded-lg flex flex-col items-center gap-2 transition ${
                    paymentMethod === 'upi' 
                      ? 'border-green-600 bg-green-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Smartphone className={`w-8 h-8 ${paymentMethod === 'upi' ? 'text-green-600' : 'text-gray-600'}`} />
                  <span className={`text-sm ${paymentMethod === 'upi' ? 'text-green-600' : 'text-gray-700'}`}>
                    UPI
                  </span>
                </button>

                <button
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-4 border-2 rounded-lg flex flex-col items-center gap-2 transition ${
                    paymentMethod === 'cod' 
                      ? 'border-green-600 bg-green-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Wallet className={`w-8 h-8 ${paymentMethod === 'cod' ? 'text-green-600' : 'text-gray-600'}`} />
                  <span className={`text-sm ${paymentMethod === 'cod' ? 'text-green-600' : 'text-gray-700'}`}>
                    Cash on Delivery
                  </span>
                </button>
              </div>

              <form onSubmit={handlePayment}>
                {paymentMethod === 'card' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm mb-2 text-gray-700">Card Number</label>
                      <input 
                        type="text" 
                        placeholder="1234 5678 9012 3456"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm mb-2 text-gray-700">Expiry Date</label>
                        <input 
                          type="text" 
                          placeholder="MM/YY"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm mb-2 text-gray-700">CVV</label>
                        <input 
                          type="text" 
                          placeholder="123"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm mb-2 text-gray-700">Cardholder Name</label>
                      <input 
                        type="text" 
                        placeholder="John Doe"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        required
                      />
                    </div>
                  </div>
                )}

                {paymentMethod === 'upi' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm mb-2 text-gray-700">UPI ID</label>
                      <input 
                        type="text" 
                        placeholder="yourname@paytm / @phonepe / @gpay"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        required
                      />
                    </div>
                    <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                      <h4 className="text-sm text-blue-900 mb-2">Popular UPI Apps</h4>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1 bg-white border border-blue-300 rounded text-sm">PhonePe</span>
                        <span className="px-3 py-1 bg-white border border-blue-300 rounded text-sm">Google Pay</span>
                        <span className="px-3 py-1 bg-white border border-blue-300 rounded text-sm">Paytm</span>
                        <span className="px-3 py-1 bg-white border border-blue-300 rounded text-sm">BHIM</span>
                      </div>
                      <p className="text-sm text-blue-700 mt-3">
                        You will receive a payment request on your UPI app. Please approve it to complete the transaction.
                      </p>
                    </div>
                  </div>
                )}

                {paymentMethod === 'cod' && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">
                      Pay ₹{total.toFixed(2)} in cash when your order is delivered.
                    </p>
                    <p className="text-sm text-gray-600">
                      Please keep the exact amount ready for a smooth delivery.
                    </p>
                  </div>
                )}

                <button 
                  type="submit"
                  className="w-full mt-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
                >
                  <Shield className="w-5 h-5" />
                  {paymentMethod === 'cod' ? 'Place Order' : `Pay ₹${total.toFixed(2)}`}
                </button>
              </form>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
              <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="text-blue-900 mb-1">Secure Payment</h4>
                <p className="text-sm text-blue-700">
                  Your payment information is encrypted and secure. We never store your card details.
                </p>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg p-6 sticky top-24">
              <h3 className="mb-4">Order Summary</h3>
              
              <div className="space-y-3 mb-4">
                {cart.map(item => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-600">{item.name} × {item.quantity}</span>
                    <span className="text-gray-900">
                      ₹{(item.price * (1 - item.discount / 100) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-900">₹{subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Discount</span>
                    <span className="text-green-600">-₹{discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Delivery</span>
                  <span className="text-green-600">Free</span>
                </div>
                <div className="border-t pt-2 flex justify-between">
                  <span className="text-gray-900">Total</span>
                  <span className="text-green-600">₹{total.toFixed(2)}</span>
                </div>
              </div>

              {discount > 0 && (
                <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm text-green-700">
                    You saved ₹{discount.toFixed(2)} with smart discounts!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
