"use client";

import { useState } from "react";
import { motion, Variants } from "framer-motion";
import { Mail, Phone, MapPin, Send, CheckCircle2 } from "lucide-react";
import { useSiteContent } from "@/lib/useSiteContent";

export default function ContactUs() {
  const content = useSiteContent<{
    heading?: string;
    subheading?: string;
    email?: string;
    phone?: string;
    address?: string;
  }>("contact_page");

  const [formState, setFormState] = useState({
    name: "",
    email: "",
    subject: "Client Concierge Inquiry",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      setFormState({ name: "", email: "", subject: "Client Concierge Inquiry", message: "" });
    }, 1200);
  };

  const fadeUp: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
  };

  return (
    <div className="w-full bg-pureblack text-purewhite min-h-screen pt-24 md:pt-32 pb-24 px-6 md:px-12 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="text-center max-w-3xl mx-auto mb-16 md:mb-24"
        >
          <span className="text-purewhite/50 text-xs font-bold tracking-[0.25em] uppercase block mb-4">
            Private Concierge
          </span>
          <h1 className="font-montserrat text-4xl sm:text-5xl md:text-6xl font-black uppercase tracking-tighter mb-6">
            {content.heading || "CONNECT WITH MODESTUS"}
          </h1>
          <p className="text-purewhite/70 text-sm md:text-base leading-relaxed">
            {content.subheading ||
              "Whether you require personalized styling advice, custom sizing guidance, or bespoke inquiries, our private client team is dedicated to assisting you."}
          </p>
        </motion.div>

        {/* Grid Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Contact Information & Pillars */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="lg:col-span-5 space-y-10 border-l border-purewhite/20 pl-6 md:pl-8"
          >
            <div>
              <span className="text-purewhite/40 text-[10px] font-mono tracking-widest uppercase block mb-2">
                Direct Inquiries
              </span>
              <div className="flex items-center gap-4 text-purewhite mt-3">
                <div className="w-10 h-10 rounded-full border border-purewhite/20 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4 text-purewhite/80" />
                </div>
                <div>
                  <p className="text-xs text-purewhite/50 uppercase tracking-wider">Client Services</p>
                  <p className="text-sm md:text-base font-semibold tracking-wide">
                    {content.email || "concierge@modestus.com"}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-4 text-purewhite">
                <div className="w-10 h-10 rounded-full border border-purewhite/20 flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4 text-purewhite/80" />
                </div>
                <div>
                  <p className="text-xs text-purewhite/50 uppercase tracking-wider">Private Styling & Sizing</p>
                  <p className="text-sm md:text-base font-semibold tracking-wide">
                    {content.phone || "+1 (800) 555-MODEST"}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-4 text-purewhite">
                <div className="w-10 h-10 rounded-full border border-purewhite/20 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4 text-purewhite/80" />
                </div>
                <div>
                  <p className="text-xs text-purewhite/50 uppercase tracking-wider">Flagship Design Studio</p>
                  <p className="text-sm md:text-base font-semibold tracking-wide">
                    {content.address || "Avenue Montaigne, Paris • Dubai Design District"}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-purewhite/10">
              <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-purewhite/50 mb-3">
                Bespoke Consultations
              </h4>
              <p className="text-purewhite/60 text-xs md:text-sm leading-relaxed">
                For made-to-order silhouettes and custom sizing modifications, please specify your requirements in the message form. A dedicated atelier specialist will respond within 24 hours.
              </p>
            </div>
          </motion.div>

          {/* Interactive Contact Form */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="lg:col-span-7 bg-[#121212] border border-purewhite/15 p-8 md:p-12 rounded-2xl shadow-2xl relative"
          >
            {submitted ? (
              <div className="py-16 text-center space-y-6 animate-in fade-in zoom-in-95 duration-500">
                <div className="w-16 h-16 bg-emerald-950/50 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="font-montserrat text-2xl md:text-3xl font-black uppercase tracking-tight">
                  Inquiry Received
                </h3>
                <p className="text-purewhite/70 text-sm md:text-base max-w-md mx-auto leading-relaxed">
                  Thank you for reaching out to Modestus. Your private concierge request has been dispatched to our atelier. We will connect with you shortly.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-4 px-8 py-3 bg-purewhite text-pureblack text-xs font-bold uppercase tracking-[0.2em] rounded-full hover:bg-purewhite/90 transition-all"
                >
                  Send Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-purewhite/60 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Layla Al-Mansoor"
                      value={formState.name}
                      onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                      className="w-full px-4 py-3.5 bg-pureblack border border-purewhite/20 rounded-xl text-sm text-purewhite placeholder-purewhite/30 focus:outline-none focus:border-purewhite transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-purewhite/60 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. layla@example.com"
                      value={formState.email}
                      onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                      className="w-full px-4 py-3.5 bg-pureblack border border-purewhite/20 rounded-xl text-sm text-purewhite placeholder-purewhite/30 focus:outline-none focus:border-purewhite transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-purewhite/60 mb-2">
                    Inquiry Category
                  </label>
                  <select
                    value={formState.subject}
                    onChange={(e) => setFormState({ ...formState, subject: e.target.value })}
                    className="w-full px-4 py-3.5 bg-pureblack border border-purewhite/20 rounded-xl text-sm text-purewhite focus:outline-none focus:border-purewhite transition-colors"
                  >
                    <option value="Client Concierge Inquiry">Client Concierge Inquiry</option>
                    <option value="Bespoke Tailoring & Custom Sizing">Bespoke Tailoring & Custom Sizing</option>
                    <option value="Order Tracking & Logistics">Order Tracking & Logistics</option>
                    <option value="Press, Media & Collaborations">Press, Media & Collaborations</option>
                    <option value="General Question">General Question</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-purewhite/60 mb-2">
                    Your Message *
                  </label>
                  <textarea
                    required
                    rows={5}
                    placeholder="Provide details regarding your inquiry, silhouette preferences, or custom measurements..."
                    value={formState.message}
                    onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                    className="w-full px-4 py-3.5 bg-pureblack border border-purewhite/20 rounded-xl text-sm text-purewhite placeholder-purewhite/30 focus:outline-none focus:border-purewhite transition-colors resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 bg-purewhite text-pureblack font-bold text-xs uppercase tracking-[0.25em] rounded-xl hover:bg-purewhite/90 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {submitting ? (
                    "Sending Dispatch..."
                  ) : (
                    <>
                      <span>Submit Inquiry</span>
                      <Send className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
