import React, { useEffect, useState, ChangeEvent } from "react";
import { useParams ,useNavigate} from "react-router-dom";
import { Star, Camera, Loader2, X } from "lucide-react";
import { API_URL, BASE_URL } from "@/data";
import { useUserStore } from "@/store/userStore";
import Header from "../Header/Header";
import { toast } from "react-toastify";
import { ArrowLeft } from "lucide-react"


// Interfaces
interface Product {
  _id: string;
  name: string;
  images: string[];
}

interface Variant {
  _id: string;
  productId: Product;
  thumbnail: string;
  originalPrice: number;
  discountPrice: number;
}

interface Review {
  _id?: string;
  rating: number;
  comment: string;
  images: string[];
}

interface OrderData {
  _id: string;
  variant: Variant;
  review?: Review;
}

const ReviewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const Userid = useUserStore((state) => state.user?._id);
  const navigate = useNavigate();

  // Form state
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [reviewDescription, setReviewDescription] = useState("");
  const [reviewImages, setReviewImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);

  // Fetch order and prefill review if exists
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}order/get-order/${id}`, {
  credentials: "include",
});
        if (!res.ok) throw new Error("Failed to fetch order");
        const data = await res.json();
        setOrder(data.order);

        if (data.order.review) {
          setRating(data.order.review.rating);
          setReviewDescription(data.order.review.comment);
          setExistingImages(data.order.review.images || []);
        }
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchOrder();
  }, [id]);

  // Handle new images
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setReviewImages((prev) => [...prev, ...Array.from(files)]);
  };

  const removeNewImage = (index: number) =>
    setReviewImages((prev) => prev.filter((_, i) => i !== index));

  const removeExistingImage = (img: string) =>
    setExistingImages((prev) => prev.filter((i) => i !== img));

  // Submit review
  const handleSubmit = async () => {
    if (!Userid) {
      toast.error("You must be logged in to submit a review.");
      return;
    }
    if (!rating || !reviewDescription.trim()) {
      toast.error("Please provide rating and review comment.");
      return;
    }

     const maxSizeKB = 100;
      const oversized = reviewImages.find(file => file.size / 1024 > maxSizeKB);
      if (oversized) {
        toast.error(`File "${oversized.name}" is too large. Max size is ${maxSizeKB} KB.`);
        return; // Stop submission
      }

    const formData = new FormData();
    formData.append("rating", String(rating));
    formData.append("comment", reviewDescription);
    formData.append("existingImages", JSON.stringify(existingImages));

    reviewImages.forEach((file) => formData.append("images", file));

    try {
      let url = "";
      let method = "";

      if (order?.review?._id) {
        // Updating existing review
        url = `${API_URL}review/updateReview/${order.review._id}`;
        method = "PUT";
      } else {
        // Creating new review
        url = `${API_URL}review/addReview`;
        method = "POST";

        // Add identifiers
        formData.append("user", Userid);
        formData.append("productId", order!.variant.productId._id);
        formData.append("orderId", order!._id);
      }

      const res = await fetch(url, { method, body: formData, credentials: "include" });
      const data = await res.json();

      if (!data.success) throw new Error(data.message || "Failed");

      // Update order.review and existingImages for real-time display
      setOrder((prev) => ({
        ...prev!,
        review: data.review,
      }));
      setExistingImages(data.review.images || []);
      setReviewImages([]);
      setHover(0);

      toast.success(order?.review?._id ? "Review updated!" : "Review submitted!");
        navigate(-1);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Something went wrong!");
    }
  };


  if (loading)
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin text-[#1C647C]" size={48} />
      </div>
    );

  if (error || !order)
    return <div className="p-10 text-center">Order not found or an error occurred.</div>;

  return (
    <div>
      <Header />
    
    <div className=" mx-auto  p-4 bg-gray-50  font-sans">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-4 border-b border-gray-200 mb-4">
        <div className="flex items-center gap-4 cursor-pointer" onClick={() => navigate(-1)}>
          <ArrowLeft size={24} className="text-gray-700 hover:text-gray-900" />
          <span className="text-xl font-bold text-gray-800">
            {order.review ? "Update Review" : "Write a Review"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 truncate max-w-[150px]">
            {order.variant.productId.name}
          </span>
          <img
            src={`${BASE_URL}/images/${order.variant.thumbnail}`}
            alt={order.variant.productId.name}
            className="w-10 h-10 object-cover border rounded"
          />
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        {/* Left Sidebar */}
        <div className="w-full md:w-1/4 bg-white p-6 border border-gray-200 h-fit">
          <h2 className="text-lg font-semibold mb-6">Tips for a helpful review</h2>
          <hr className="mb-6" />
          <div className="space-y-8 text-sm text-gray-500">
            <section>
              <h3 className="font-medium text-gray-800 mb-2">Have you used this product?</h3>
              <p>Share your honest experience. Highlight positives and negatives.</p>
            </section>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex-1 bg-white border border-gray-200 flex flex-col">
          <div className="p-6">
            {/* Rating */}
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Rate this product</h2>
            <div className="flex gap-2 mb-8">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHover(star)}
                  onMouseLeave={() => setHover(0)}
                >
                  <Star
                    size={28}
                    className={`${
                      (hover || rating) >= star
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    } transition-colors`}
                  />
                </button>
              ))}
            </div>

            <hr className="mb-6" />

            {/* Comment */}
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Your Review</h2>
            <div className="border border-gray-200 rounded">
              <div className="p-4">
                <textarea
                  placeholder="Write your review..."
                  value={reviewDescription}
                  onChange={(e) => setReviewDescription(e.target.value)}
                  className="w-full text-sm outline-none resize-none h-15 text-gray-700"
                />
              </div>
            </div>

            {/* All Images in one container */}
            {(existingImages.length > 0 || reviewImages.length > 0) && (
              <div className="flex gap-2 mt-4 flex-wrap">
                {/* Existing images */}
                {existingImages.map((img) => (
                  <div key={img} className="relative">
                    <img
                      src={`${BASE_URL}/images/${img}`}
                      alt="Review"
                      className="w-20 h-20 object-cover border rounded"
                    />
                    <button
                      onClick={() => removeExistingImage(img)}
                      className="absolute top-0 right-0 bg-black bg-opacity-50 text-white p-1 rounded-full"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}

                {/* New images */}
                {reviewImages.map((file, idx) => (
                  <div key={idx} className="relative">
                    <img
                      src={URL.createObjectURL(file)}
                      alt="New Review"
                      className="w-20 h-20 object-cover border rounded"
                    />
                    <button
                      onClick={() => removeNewImage(idx)}
                      className="absolute top-0 right-0 bg-black bg-opacity-50 text-white p-1 rounded-full"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6">
              <label className="p-4 border border-gray-200 bg-gray-50 rounded cursor-pointer inline-flex items-center gap-2 hover:bg-gray-100">
                <Camera size={24} className="text-gray-400" />
                <span className="text-sm text-gray-600">Add Images</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
              <p className="text-gray-500 text-sm mt-2">
                Optional. Upload JPG or PNG images up to 100KB each.
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-auto p-6 border-t border-gray-100 flex justify-end">
              <button
                onClick={handleSubmit}
                disabled={rating === 0}
                className={`${
                  rating === 0
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-[#1C647C] hover:bg-orange-700 cursor-pointer"
                } text-white font-bold py-3 px-16 rounded shadow transition-all uppercase`}
              >
                {order.review ? "Update Review" : "Submit Review"}
              </button>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default ReviewPage;
