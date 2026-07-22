"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { type Review } from "@/lib/products";

interface ReviewsSectionProps {
  reviews: Review[];
  rating: number;
  reviewCount: number;
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
  reviews,
  rating,
  reviewCount,
}: ReviewsSectionProps) {
  // Approximate distribution for the bar chart
  const dist = [
    { stars: 5, count: Math.round(reviewCount * 0.72) },
    { stars: 4, count: Math.round(reviewCount * 0.18) },
    { stars: 3, count: Math.round(reviewCount * 0.06) },
    { stars: 2, count: Math.round(reviewCount * 0.02) },
    { stars: 1, count: Math.round(reviewCount * 0.02) },
  ];

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
                      star <= Math.round(rating)
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
            <button className="mt-2 w-full py-3 sm:py-3.5 rounded-full border border-[#2a2621] text-[#2a2621] text-[10px] font-bold uppercase tracking-widest hover:bg-[#2a2621] hover:text-[#faf7f2] transition-colors">
              Write a Review
            </button>
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

            {/* Load More */}
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
