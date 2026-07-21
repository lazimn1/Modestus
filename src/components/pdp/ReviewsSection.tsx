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
            star <= rating ? "fill-pureblack text-pureblack" : "fill-transparent text-pureblack/20"
          }`}
        />
      ))}
    </div>
  );
}

function RatingBar({ stars, count, total }: { stars: number; count: number; total: number }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex items-center gap-2.5">
      <span className="text-xs text-pureblack/50 w-4 shrink-0">{stars}</span>
      <Star className="w-3 h-3 fill-pureblack/30 text-pureblack/30 shrink-0" />
      <div className="flex-1 h-1.5 bg-pureblack/10 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-pureblack rounded-full"
          initial={{ width: 0 }}
          whileInView={{ width: `${pct}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 * (5 - stars) }}
        />
      </div>
      <span className="text-[10px] text-pureblack/40 w-4 text-right shrink-0">{count}</span>
    </div>
  );
}

export default function ReviewsSection({
  reviews,
  rating,
  reviewCount,
  productTitle,
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
    <section id="reviews" className="w-full bg-lightgray py-16 md:py-24 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-pureblack/40 mb-2">
            Customer Reviews
          </p>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-pureblack">
            What Customers Say
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-[280px_1fr] gap-12">
          {/* Rating Summary */}
          <motion.div
            className="flex flex-col gap-5"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex flex-col items-start gap-1">
              <span className="text-6xl font-display font-black text-pureblack leading-none">
                {rating}
              </span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-5 h-5 ${
                      star <= Math.round(rating)
                        ? "fill-pureblack text-pureblack"
                        : "fill-transparent text-pureblack/20"
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-pureblack/40">Based on {reviewCount} reviews</p>
            </div>

            {/* Rating Bars */}
            <div className="flex flex-col gap-2">
              {dist.map(({ stars, count }) => (
                <RatingBar key={stars} stars={stars} count={count} total={reviewCount} />
              ))}
            </div>

            {/* Write Review CTA */}
            <button className="mt-2 w-full py-3 border border-pureblack text-pureblack text-[10px] font-bold uppercase tracking-[0.15em] hover:bg-pureblack hover:text-purewhite transition-all duration-300">
              Write a Review
            </button>
          </motion.div>

          {/* Review Cards */}
          <div className="flex flex-col gap-5">
            {reviews.map((review, i) => (
              <motion.div
                key={review.id}
                className="bg-purewhite rounded-xl p-6 md:p-7 border border-pureblack/5 shadow-sm"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.55, delay: i * 0.1, ease: [0.25, 0.1, 0.25, 1] }}
              >
                <div className="flex items-start justify-between mb-4 gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${review.avatarColor}`}
                    >
                      {review.initials}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-pureblack leading-tight">{review.author}</p>
                      <p className="text-[10px] text-pureblack/40 mt-0.5">{review.location}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <StarRating rating={review.rating} />
                    <p className="text-[10px] text-pureblack/30">{review.date}</p>
                  </div>
                </div>

                <div className="w-full h-px bg-pureblack/8 mb-4" />

                <p className="text-sm text-pureblack/70 leading-relaxed italic">
                  &ldquo;{review.text}&rdquo;
                </p>

                {/* Verified badge */}
                <div className="flex items-center gap-1.5 mt-4">
                  <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 flex items-center justify-center">
                    <svg viewBox="0 0 12 12" fill="none" className="w-2 h-2">
                      <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <span className="text-[9px] text-pureblack/40 font-medium uppercase tracking-wide">
                    Verified Purchase
                  </span>
                </div>
              </motion.div>
            ))}

            {/* Load More */}
            {reviewCount > reviews.length && (
              <motion.button
                className="w-full py-3.5 border border-pureblack/20 text-pureblack/50 text-[10px] font-bold uppercase tracking-[0.15em] hover:border-pureblack hover:text-pureblack transition-all duration-300"
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
