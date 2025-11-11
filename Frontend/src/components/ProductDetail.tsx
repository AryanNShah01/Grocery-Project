import { useState, useEffect } from "react";
import {
  Star,
  Clock,
  TrendingDown,
  ShoppingCart,
  ArrowLeft,
  ThumbsUp,
  Loader,
  MessageCircle,
} from "lucide-react";
import type { Product } from "../App";

interface ProductDetailProps {
  product: Product;
  onBack: () => void;
  addToCart: (product: Product) => void;
  currentUser?: any;
}

export function ProductDetail({
  product,
  onBack,
  addToCart,
  currentUser,
}: ProductDetailProps) {
  const daysLeft = Math.ceil(
    (new Date(product.expiryDate).getTime() - new Date().getTime()) /
      (1000 * 60 * 60 * 24)
  );
  const finalPrice =
    Number(product.price) * (1 - Number(product.discount) / 100);

  // ✅ BACKEND DATA STATES
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingReview, setAddingReview] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 5,
    comment: ""
  });

  const API_BASE = 'http://localhost:5000';

  // ✅ FETCH DB DATA
  useEffect(() => {
    async function fetchData() {
      try {
        const [relRes, revRes] = await Promise.all([
          fetch(`${API_BASE}/products/related/${product.category}`),
          fetch(`${API_BASE}/reviews/${product.id}`)
        ]);

        const relData = await relRes.json();
        const revData = await revRes.json();

        setRelatedProducts(relData);
        setReviews(revData);
      } catch (err) {
        console.error("API Error:", err);
      }
      setLoading(false);
    }

    fetchData();
  }, [product]);

  // ✅ ADD REVIEW FUNCTION
  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      alert('Please login to add a review');
      return;
    }

    setAddingReview(true);
    try {
      const response = await fetch(`${API_BASE}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product.id,
          author: currentUser.username || currentUser.email,
          rating: newReview.rating,
          comment: newReview.comment
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add review');
      }

      // Refresh reviews
      const revRes = await fetch(`${API_BASE}/reviews/${product.id}`);
      const revData = await revRes.json();
      setReviews(revData);
      
      // Reset form
      setNewReview({ rating: 5, comment: "" });
      setShowReviewForm(false);
      
      console.log('✅ Review added successfully:', data);
      
    } catch (err) {
      console.error('❌ Review submission error:', err);
      alert(err instanceof Error ? err.message : 'Failed to add review');
    } finally {
      setAddingReview(false);
    }
  };

  // ✅ ADD TO CART WITH ENHANCED FEEDBACK
  const handleAddToCart = () => {
    addToCart(product);
    // Show visual feedback
    const button = document.getElementById('add-to-cart-btn');
    if (button) {
      button.classList.add('bg-green-700');
      setTimeout(() => {
        button.classList.remove('bg-green-700');
      }, 300);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* BACK BUTTON */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 mb-6 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Products
        </button>

        {/* MAIN PRODUCT SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-lg overflow-hidden relative">
            <img
              src={product.image_url || '/placeholder-product.jpg'}
              alt={product.name}
              className="w-full h-96 object-cover"
            />

            {Number(product.discount) > 0 && (
              <div className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-full flex gap-2 items-center">
                <TrendingDown className="w-4 h-4" />
                {Number(product.discount)}% OFF
              </div>
            )}

            {daysLeft <= 7 && daysLeft > 0 && (
              <div className="absolute top-4 left-4 bg-orange-500 text-white px-4 py-2 rounded-full flex gap-2 items-center">
                <Clock className="w-4 h-4" />
                Expires in {daysLeft} days
              </div>
            )}

            {daysLeft <= 0 && (
              <div className="absolute top-4 left-4 bg-red-600 text-white px-4 py-2 rounded-full flex gap-2 items-center">
                <Clock className="w-4 h-4" />
                Expired
              </div>
            )}
          </div>

          <div className="bg-white p-8 rounded-lg">
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
              {product.category}
            </span>

            <h1 className="mt-2 text-2xl font-bold">{product.name}</h1>

            <div className="flex items-center mt-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${
                    i < Math.floor(Number(product.rating))
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
              <span className="ml-2 text-gray-600">
                ({Number(product.reviewCount)} reviews)
              </span>
            </div>

            <div className="flex gap-3 mt-4 items-center">
              <span className="text-green-600 text-xl font-bold">
                ₹{finalPrice.toFixed(2)}
              </span>
              {Number(product.discount) > 0 && (
                <>
                  <span className="line-through text-gray-400">
                    ₹{Number(product.price).toFixed(2)}
                  </span>
                  <span className="text-red-500 text-sm">
                    Save ₹{(Number(product.price) - finalPrice).toFixed(2)}
                  </span>
                </>
              )}
            </div>

            {/* Stock Information */}
            {product.stock !== undefined && (
              <div className="mt-4">
                <span className={`text-sm ${
                  product.stock > 10 ? 'text-green-600' : 
                  product.stock > 0 ? 'text-orange-600' : 'text-red-600'
                }`}>
                  {product.stock > 10 ? 'In Stock' : 
                   product.stock > 0 ? `Only ${product.stock} left` : 'Out of Stock'}
                </span>
              </div>
            )}

            <button
              id="add-to-cart-btn"
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="w-full mt-6 py-3 bg-green-600 text-white rounded-lg flex justify-center gap-2 items-center hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingCart className="w-5 h-5" /> 
              {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>

            {/* Product Description */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="font-semibold mb-2">Product Details</h3>
              <p className="text-gray-600 text-sm">
                Fresh {product.name.toLowerCase()} from our premium collection. 
                {daysLeft > 0 ? ` Best before ${new Date(product.expiryDate).toLocaleDateString('en-IN')}.` : ' This product has expired.'}
              </p>
            </div>
          </div>
        </div>

        {/* ✅ REVIEWS SECTION */}
        <div className="bg-white p-6 rounded-lg mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Customer Reviews</h2>
            <button
              onClick={() => setShowReviewForm(!showReviewForm)}
              disabled={!currentUser}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <MessageCircle className="w-4 h-4" />
              Add Review
            </button>
          </div>

          {/* ADD REVIEW FORM */}
          {showReviewForm && (
            <form onSubmit={handleAddReview} className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Your Rating</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewReview(prev => ({ ...prev, rating: star }))}
                      className="text-2xl focus:outline-none"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= newReview.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Your Review</label>
                <textarea
                  value={newReview.comment}
                  onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                  placeholder="Share your experience with this product..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={addingReview}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50 flex items-center gap-2"
                >
                  {addingReview && <Loader className="w-4 h-4 animate-spin" />}
                  Submit Review
                </button>
                <button
                  type="button"
                  onClick={() => setShowReviewForm(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {loading && <p className="text-gray-500">Loading reviews...</p>}
          {!loading && reviews.length === 0 && (
            <p className="text-gray-500 text-center py-8">No reviews yet. Be the first to review!</p>
          )}

          {reviews.map((review) => (
            <div key={review.id} className="border-b border-gray-200 pb-4 mb-4 last:border-b-0 last:mb-0">
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-semibold">{review.author}</span>
                  <div className="flex mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Number(review.rating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <span className="text-sm text-gray-500">
                  {new Date(review.date).toLocaleDateString('en-IN')}
                </span>
              </div>

              <p className="text-gray-700 mt-2">{review.comment}</p>
            </div>
          ))}
        </div>

        {/* ✅ RELATED PRODUCTS */}
        <div>
          <h2 className="text-xl font-bold mb-4">Related Products</h2>

          {loading && <p className="text-gray-500">Loading related products...</p>}
          {!loading && relatedProducts.length === 0 && (
            <p className="text-gray-500">No related products found.</p>
          )}

          <div className="grid md:grid-cols-3 gap-6">
            {relatedProducts.map((p) => (
              <div key={p.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="h-40 w-full bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center rounded-t-lg">
                  <span className="text-green-800 font-semibold text-center px-2">{p.name}</span>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold">{p.name}</h3>
                  <div className="flex gap-2 mt-2 items-center">
                    <span className="text-green-600 font-bold">
                      ₹{(Number(p.price) * (1 - Number(p.discount) / 100)).toFixed(2)}
                    </span>
                    {Number(p.discount) > 0 && (
                      <span className="text-gray-400 line-through text-sm">
                        ₹{Number(p.price).toFixed(2)}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => addToCart(p)}
                    className="mt-3 w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}