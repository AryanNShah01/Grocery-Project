import { Star, ThumbsUp, MessageSquare } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { Product } from '../App';

interface Review {
  id: number;
  productId: string;
  productName: string;
  author: string;
  rating: number;
  date: string;
  comment: string;
  helpful: number;
}

export function ReviewsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');
  const [loading, setLoading] = useState(true);

  // ✅ FETCH REAL PRODUCTS FROM BACKEND
  useEffect(() => {
    async function fetchData() {
      try {
        const productsResponse = await fetch('http://localhost:5000/products');
        const productsData = await productsResponse.json();
        setProducts(productsData);
        
        if (productsData.length > 0) {
          setSelectedProduct(productsData[0].id);
        }

        // Fetch reviews for all products
        const reviewsPromises = productsData.map((product: Product) => 
          fetch(`http://localhost:5000/reviews/${product.id}`).then(res => res.json())
        );
        
        const reviewsResults = await Promise.all(reviewsPromises);
        const allReviews = reviewsResults.flat();
        
        // Add product names to reviews
        const reviewsWithProductNames = allReviews.map((review: any) => ({
          ...review,
          productName: productsData.find((p: Product) => p.id === review.product_id)?.name || 'Unknown Product'
        }));
        
        setReviews(reviewsWithProductNames);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
      setLoading(false);
    }
    
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!review.trim()) return;

    try {
      // ✅ SUBMIT REVIEW TO BACKEND
      const response = await fetch(`http://localhost:5000/reviews/${selectedProduct}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author: 'Current User', // You can replace this with actual user data
          rating: rating,
          comment: review
        })
      });

      if (response.ok) {
        // Refresh reviews
        const reviewsResponse = await fetch(`http://localhost:5000/reviews/${selectedProduct}`);
        const newReviews = await reviewsResponse.json();
        
        // Update reviews state with new review
        const product = products.find(p => p.id === selectedProduct);
        const reviewsWithProductNames = newReviews.map((rev: any) => ({
          ...rev,
          productName: product?.name || 'Unknown Product'
        }));
        
        setReviews(prev => [...prev, ...reviewsWithProductNames]);
        setReview('');
        setRating(5);
        alert('Review submitted successfully!');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>Loading reviews from database...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="mb-2">Product Reviews</h1>
          <p className="text-gray-600">Share your experience and help others make informed decisions</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Write Review Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg p-6 sticky top-24">
              <h2 className="mb-4">Write a Review</h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm mb-2 text-gray-700">Select Product</label>
                  <select 
                    value={selectedProduct}
                    onChange={(e) => setSelectedProduct(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    {products.map(product => (
                      <option key={product.id} value={product.id}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm mb-2 text-gray-700">Your Rating</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="focus:outline-none"
                      >
                        <Star 
                          className={`w-8 h-8 transition ${
                            star <= rating 
                              ? 'fill-yellow-400 text-yellow-400' 
                              : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm mb-2 text-gray-700">Your Review</label>
                  <textarea
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    placeholder="Share your thoughts about this product..."
                    rows={5}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                    required
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-5 h-5" />
                  Submit Review
                </button>
              </form>
            </div>
          </div>

          {/* Reviews List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2>Customer Reviews</h2>
                <span className="text-sm text-gray-600">{reviews.length} reviews</span>
              </div>

              <div className="space-y-6">
                {reviews.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No reviews yet. Be the first to review!</p>
                  </div>
                ) : (
                  reviews.map(review => (
                    <div key={review.id} className="border-b pb-6 last:border-b-0">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-gray-900">{review.author}</span>
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star 
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < review.rating 
                                      ? 'fill-yellow-400 text-yellow-400' 
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-gray-500">{new Date(review.date).toLocaleDateString()}</p>
                        </div>
                      </div>

                      <div className="mb-2">
                        <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm mb-2">
                          {review.productName}
                        </span>
                      </div>

                      <p className="text-gray-700 mb-3">{review.comment}</p>

                      <div className="flex items-center gap-4">
                        <button className="flex items-center gap-1 text-gray-500 hover:text-green-600">
                          <ThumbsUp className="w-4 h-4" />
                          <span className="text-sm">Helpful ({review.helpful || 0})</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Average Rating Summary */}
            <div className="bg-white rounded-lg p-6 mt-6">
              <h3 className="mb-4">Rating Distribution</h3>
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map(stars => {
                  const count = reviews.filter(r => Math.floor(r.rating) === stars).length;
                  const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                  
                  return (
                    <div key={stars} className="flex items-center gap-3">
                      <div className="flex items-center gap-1 w-20">
                        <span className="text-sm text-gray-600">{stars}</span>
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      </div>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-yellow-400 h-2 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600 w-12 text-right">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}