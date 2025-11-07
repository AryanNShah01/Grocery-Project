import { useState, useEffect } from "react";
import {
  Star,
  Clock,
  TrendingDown,
  ShoppingCart,
  ArrowLeft,
  ThumbsUp,
} from "lucide-react";
import type { Product } from "../App";

interface ProductDetailProps {
  product: Product;
  onBack: () => void;
  addToCart: (product: Product) => void;
}

export function ProductDetail({
  product,
  onBack,
  addToCart,
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

  // ✅ FETCH DB DATA
  useEffect(() => {
    async function fetchData() {
      try {
        const relRes = await fetch(
          `http://localhost:5000/products/related/${product.category}`
        );
        const relData = await relRes.json();

        const revRes = await fetch(
          `http://localhost:5000/reviews/${product.id}`
        );
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* BACK BUTTON */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Products
        </button>

        {/* MAIN PRODUCT SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-lg overflow-hidden relative">
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-96 object-cover"
            />

            {Number(product.discount) > 0 && (
              <div className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-full flex gap-2">
                <TrendingDown className="w-5 h-5" />
                {Number(product.discount)}% OFF
              </div>
            )}

            {daysLeft <= 7 && daysLeft > 0 && (
              <div className="absolute top-4 left-4 bg-orange-500 text-white px-4 py-2 rounded-full flex gap-2">
                <Clock className="w-5 h-5" />
                Expires in {daysLeft} days
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
                  className={
                    i < Math.floor(Number(product.rating))
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }
                />
              ))}
              <span className="ml-2 text-gray-600">
                ({Number(product.reviewCount)} reviews)
              </span>
            </div>

            <div className="flex gap-3 mt-4">
              <span className="text-green-600 text-xl font-bold">
                ₹{finalPrice.toFixed(2)}
              </span>
              {Number(product.discount) > 0 && (
                <>
                  <span className="line-through text-gray-400">
                    ₹{Number(product.price).toFixed(2)}
                  </span>
                  <span className="text-red-500">
                    Save ₹{(Number(product.price) - finalPrice).toFixed(2)}
                  </span>
                </>
              )}
            </div>

            <button
              onClick={() => addToCart(product)}
              className="w-full mt-6 py-3 bg-green-600 text-white rounded-lg flex justify-center gap-2"
            >
              <ShoppingCart className="w-5 h-5" /> Add to Cart
            </button>
          </div>
        </div>

        {/* ✅ REVIEWS FROM DB */}
        <div className="bg-white p-6 rounded-lg mb-8">
          <h2 className="text-xl font-bold mb-4">Customer Reviews</h2>

          {loading && <p>Loading reviews...</p>}
          {!loading && reviews.length === 0 && <p>No reviews yet.</p>}

          {reviews.map((review) => (
            <div key={review.id} className="border-b pb-4 mb-4">
              <div className="flex justify-between">
                <span className="font-semibold">{review.author}</span>
                <span className="text-sm text-gray-500">
                  {new Date(review.date).toLocaleDateString()}
                </span>
              </div>

              <div className="flex mt-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={
                      i < Number(review.rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }
                  />
                ))}
              </div>

              <p className="text-gray-700 mt-2">{review.comment}</p>
            </div>
          ))}
        </div>

        {/* ✅ RELATED PRODUCTS FROM DB */}
        <div>
          <h2 className="text-xl font-bold mb-4">Related Expiring Products</h2>

          {loading && <p>Loading products...</p>}
          {!loading && relatedProducts.length === 0 && (
            <p>No related products found.</p>
          )}

          <div className="grid md:grid-cols-3 gap-6">
            {relatedProducts.map((p) => (
              <div key={p.id} className="bg-white rounded-lg">
                {/* Removed image since no images in database */}
                <div className="h-40 w-full bg-blue-100 flex items-center justify-center rounded-t-lg">
                  <span className="text-blue-600 font-semibold">{p.name}</span>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold">{p.name}</h3>
                  <div className="flex gap-2 mt-2">
                    <span className="text-green-600">
                      ₹
                      {(
                        Number(p.price) *
                        (1 - Number(p.discount) / 100)
                      ).toFixed(2)}
                    </span>
                    <span className="text-gray-400 line-through text-sm">
                      ₹{Number(p.price).toFixed(2)}
                    </span>
                  </div>
                  <button
                    onClick={() => addToCart(p)}
                    className="mt-3 w-full bg-green-600 text-white py-2 rounded"
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
