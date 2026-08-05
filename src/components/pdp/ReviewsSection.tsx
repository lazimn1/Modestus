"use client";

import { motion } from "framer-motion";
import { Star, Loader2, AlertCircle } from "lucide-react";
import { type Review } from "@/app/actions/reviews";
import { useState, useTransition, FormEvent } from "react";
import { useAuth } from "@/context/AuthContext";
import { submitProductReview } from "@/app/actions/reviews";
import Link from "next/link";

interface ReviewsSectionProps {
  productId: string;
  initialReviews: Review[];
  productTitle: string;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-3.5 h-3.5 ${
            star <= rating ? "fill-[#2a2621] text-[#2a2621]" : "fill-transparent text-[#dad2c2]"
          }`}
        />
      ))}
    </div>
  );
}

function RatingBar({ stars, count, total }: { stars: number; count: number; total: number }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex items-center gap-2 sm:gap-2.5">
      <span className="text-[10px] sm:text-xs text-[#78716c] w-4 shrink-0 font-medium">{stars}</span>
      <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-[#78716c]/50 text-[#78716c]/50 shrink-0" />
      <div className="flex-1 h-1 sm:h-1.5 bg-[#e7e1d4] rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-[#2a2621] rounded-full"
          initial={{ width: 0 }}
          whileInView={{ width: `${pct}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 * (5 - stars) }}
        />
      </div>
      <span className="text-[9px] sm:text-[10px] text-[#78716c] w-4 text-right shrink-0 font-medium">{count}</span>
    </div>
  );
}

export default function ReviewsSection({
  productId,
  initialReviews,
}: ReviewsSectionProps) {
  const { customer } = useAuth();
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [formRating, setFormRating] = useState(5);
  const [formText, setFormText] = useState("");

  const reviewCount = reviews.length;
  const rating = reviewCount > 0 
    ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviewCount).toFixed(1) 
    : "0.0";

  // Approximate distribution for the bar chart based on actual reviews
  const dist = [
    { stars: 5, count: reviews.filter(r => r.rating === 5).length },
    { stars: 4, count: reviews.filter(r => r.rating === 4).length },
    { stars: 3, count: reviews.filter(r => r.rating === 3).length },
    { stars: 2, count: reviews.filter(r => r.rating === 2).length },
    { stars: 1, count: reviews.filter(r => r.rating === 1).length },
  ];

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!customer) return;

    setError("");
    startTransition(async () => {
      const authorName = `${customer.firstName || "Customer"} ${customer.lastName || ""}`.trim();
      const result = await submitProductReview(productId, formRating, formText, authorName);
      
      if (result.error) {
        setError(result.error);
      } else if (result.success && result.reviews) {
        setReviews(result.reviews);
        setIsFormOpen(false);
        setFormText("");
        setFormRating(5);
      }
    });
  };

  return (
    <section id="reviews" className="w-full bg-[#faf7f2] py-12 md:py-24 px-4 sm:px-6 md:px-12 border-t border-[#e7e1d4]">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          className="mb-8 md:mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-[#78716c] mb-1 sm:mb-2">
            Customer Reviews
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl text-[#2a2621] font-normal tracking-tight">
            What Customers Say
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-[280px_1fr] lg:grid-cols-[320px_1fr] gap-8 md:gap-12 lg:gap-16">
          {/* Rating Summary */}
          <motion.div
            className="flex flex-col gap-5 sm:gap-6"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex flex-col items-start gap-1.5">
              <span className="font-serif text-5xl sm:text-6xl text-[#2a2621] leading-none tracking-tighter">
                {rating}
              </span>
              <div className="flex gap-0.5 mt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 sm:w-5 sm:h-5 ${
                      star <= Math.round(parseFloat(rating))
                        ? "fill-[#2a2621] text-[#2a2621]"
                        : "fill-transparent text-[#dad2c2]"
                    }`}
                  />
                ))}
              </div>
              <p className="text-[10px] sm:text-xs text-[#78716c] font-medium mt-1">Based on {reviewCount} reviews</p>
            </div>

            {/* Rating Bars */}
            <div className="flex flex-col gap-2.5">
              {dist.map(({ stars, count }) => (
                <RatingBar key={stars} stars={stars} count={count} total={reviewCount} />
              ))}
            </div>

            {/* Write Review CTA */}
            {!isFormOpen && (
              <button 
                onClick={() => setIsFormOpen(true)}
                className="mt-2 w-full py-3 sm:py-3.5 rounded-full border border-[#2a2621] text-[#2a2621] text-[10px] font-bold uppercase tracking-widest hover:bg-[#2a2621] hover:text-[#faf7f2] transition-colors"
              >
                Write a Review
              </button>
            )}

            {isFormOpen && !customer && (
              <div className="mt-2 p-5 border border-[#e7e1d4] rounded-2xl bg-white text-center">
                <p className="text-sm text-[#78716c] mb-4">You must be signed in to write a review.</p>
                <div className="flex gap-3 justify-center">
                  <button onClick={() => setIsFormOpen(false)} className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-[#78716c] hover:text-[#2a2621]">Cancel</button>
                  <Link href="/login" className="px-4 py-2 bg-[#2a2621] text-[#faf7f2] text-xs font-bold uppercase tracking-widest rounded-full">Sign In</Link>
                </div>
              </div>
            )}

            {isFormOpen && customer && (
              <form onSubmit={handleSubmit} className="mt-2 p-5 sm:p-6 border border-[#2a2621]/20 rounded-2xl bg-white">
                <h3 className="font-bold text-[#2a2621] mb-4">Leave a Review</h3>
                
                <div className="mb-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-[#78716c] mb-2">Rating</p>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFormRating(star)}
                        className="focus:outline-none"
                      >
                        <Star className={`w-6 h-6 ${star <= formRating ? "fill-[#2a2621] text-[#2a2621]" : "fill-transparent text-[#dad2c2]"}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-[#78716c] mb-2">Review</p>
                  <textarea
                    required
                    value={formText}
                    onChange={(e) => setFormText(e.target.value)}
                    placeholder="What did you think about this product?"
                    className="w-full min-h-[100px] p-3 text-sm bg-[#faf7f2] border border-[#e7e1d4] rounded-xl focus:outline-none focus:border-[#2a2621]"
                  />
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 text-red-600 text-xs rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {error}
                  </div>
                )}

                <div className="flex gap-3">
                  <button type="button" onClick={() => setIsFormOpen(false)} className="flex-1 py-3 rounded-full border border-[#dad2c2] text-[#78716c] text-[10px] font-bold uppercase tracking-widest hover:border-[#2a2621] hover:text-[#2a2621]">
                    Cancel
                  </button>
                  <button type="submit" disabled={isPending} className="flex-1 py-3 rounded-full bg-[#2a2621] text-[#faf7f2] text-[10px] font-bold uppercase tracking-widest hover:bg-[#1a1714] disabled:opacity-50 flex items-center justify-center gap-2">
                    {isPending && <Loader2 className="w-3 h-3 animate-spin" />}
                    Submit
                  </button>
                </div>
              </form>
            )}
          </motion.div>

          {/* Review Cards */}
          <div className="flex flex-col gap-4 sm:gap-5">
            {reviews.map((review, i) => (
              <motion.div
                key={review.id}
                className="bg-[#fcfaf7] rounded-xl sm:rounded-2xl p-5 sm:p-7 border border-[#e7e1d4] shadow-[0_4px_20px_rgba(0,0,0,0.02)]"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.55, delay: i * 0.1, ease: [0.25, 0.1, 0.25, 1] }}
              >
                <div className="flex items-start justify-between mb-4 gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm shrink-0 ${review.avatarColor}`}
                    >
                      {review.initials}
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-[#2a2621] leading-tight">{review.author}</p>
                      <p className="text-[9px] sm:text-[10px] text-[#78716c] mt-0.5">{review.location}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <StarRating rating={review.rating} />
                    <p className="text-[9px] sm:text-[10px] text-[#78716c] font-medium">{review.date}</p>
                  </div>
                </div>

                <div className="w-full h-px bg-[#e7e1d4] mb-4" />

                <p className="text-xs sm:text-sm text-[#2a2621] leading-relaxed italic opacity-90">
                  &ldquo;{review.text}&rdquo;
                </p>

                {/* Verified badge */}
                <div className="flex items-center gap-1.5 mt-4 sm:mt-5">
                  <div className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-emerald-600 flex items-center justify-center">
                    <svg viewBox="0 0 12 12" fill="none" className="w-2 h-2">
                      <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <span className="text-[8px] sm:text-[9px] text-[#78716c] font-bold uppercase tracking-widest">
                    Verified Purchase
                  </span>
                </div>
              </motion.div>
            ))}

            {reviews.length === 0 && (
              <div className="text-center py-12 border border-[#e7e1d4] rounded-2xl bg-white">
                <p className="text-[#78716c] text-sm">No reviews yet. Be the first to review!</p>
              </div>
            )}

            {/* Load More (Disabled for now as we load all) */}
            {reviewCount > reviews.length && (
              <motion.button
                className="w-full py-3.5 sm:py-4 rounded-full border border-[#dad2c2] text-[#78716c] text-[9px] sm:text-[10px] font-bold uppercase tracking-widest hover:border-[#2a2621] hover:text-[#2a2621] transition-colors"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
              >
                Load {reviewCount - reviews.length} More Reviews
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
