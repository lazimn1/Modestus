"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, Send, X, RefreshCw, Bot, Loader2, ArrowRight, ChevronLeft } from "lucide-react";
import { motion, useMotionValue, animate, PanInfo } from "framer-motion";

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
}

const SUGGESTIONS = [
  "👗 Recommend an outfit for an evening event",
  "✨ What are your most luxurious abayas?",
  "📏 Tell me about your sizing and fabrics",
  "📦 What is your VIP shipping policy?",
];

const BTN_SIZE = 56;
const EDGE_MARGIN = 20; // Increased for a neater gap from screen edges
const TOP_MARGIN = 80;  // Prevent overlapping the navbar at the top
const DEFAULT_Y_RATIO = 0.75;

export default function AiStylistWidget() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: "welcome", sender: "ai", text: "Welcome to M Chat. How may I assist you today?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const msgIdRef = useRef(100);
  const lastActionTime = useRef(0);

  const [mounted, setMounted] = useState(false);

  // Framer motion values for GPU-accelerated dragging
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const [isOnLeft, setIsOnLeft] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [dragLimits, setDragLimits] = useState({ left: 0, right: 0 });

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      let initialX = window.innerWidth - BTN_SIZE - EDGE_MARGIN;
      // Fixed Y position pinned to bottom-right corner
      let initialY = window.innerHeight - BTN_SIZE - EDGE_MARGIN;
      
      const saved = sessionStorage.getItem("mchat_pos_v4");
      if (saved) {
        try {
          const p = JSON.parse(saved);
          initialY = Math.max(TOP_MARGIN, Math.min(p.y, window.innerHeight - BTN_SIZE - EDGE_MARGIN));
        } catch {}
      }
      x.set(initialX);
      y.set(initialY);
      setDragLimits({ left: initialX, right: window.innerWidth });
    }
  }, [x, y]);

  // Sync side state for panel positioning
  useEffect(() => {
    return x.on("change", (latest) => {
      if (typeof window !== "undefined") {
        setIsOnLeft(latest < window.innerWidth / 2);
      }
    });
  }, [x]);

  const handleDragStart = () => {
    setIsOpen(false);
    setIsDragging(true);
  };

  const handleDragEnd = (event: any, info: PanInfo) => {
    setIsDragging(false);
    lastActionTime.current = Date.now();
    
    const currentX = x.get();
    const currentY = y.get();

    // Check if dragged completely into the right edge to hide
    const centerX = currentX + BTN_SIZE / 2;
    // If they drag it more than halfway off the screen to the right
    if (centerX > window.innerWidth - 15) {
      setIsHidden(true);
      return; 
    }

    // Always snap back to the right edge (horizontal only)
    const snapX = window.innerWidth - BTN_SIZE - EDGE_MARGIN;

    animate(x, snapX, { type: "spring", stiffness: 400, damping: 30 });
    // Y does not animate since it cannot be dragged

    sessionStorage.setItem("mchat_pos_v4", JSON.stringify({ x: snapX, y: currentY }));
  };

  const getNextId = () => { msgIdRef.current += 1; return msgIdRef.current.toString(); };

  useEffect(() => {
    if (isOpen) messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;
    const userMsg: Message = { id: getNextId(), sender: "user", text: query.trim() };
    const updated = [...messages, userMsg];
    setMessages(updated);
    if (!textToSend) setInput("");
    setLoading(true);
    try {
      const apiMessages = updated
        .filter((m) => m.id !== "welcome")
        .map((m) => ({ role: m.sender === "user" ? "user" : "model", parts: [{ text: m.text }] }));
      const payload = apiMessages.length > 0 ? apiMessages : [{ role: "user", parts: [{ text: userMsg.text }] }];
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: payload }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Stylist unavailable.");
      setMessages((prev) => [...prev, { id: getNextId(), sender: "ai", text: data.reply }]);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Please try again.";
      setMessages((prev) => [...prev, { id: getNextId(), sender: "ai", text: `We apologize: ${errMsg}` }]);
    } finally {
      setLoading(false);
    }
  };

  const resetChat = () => setMessages([{ id: "welcome", sender: "ai", text: "Welcome to M Chat. How may I assist you today?" }]);

  const renderFormattedText = (text: string) => {
    const parts = text.split(/(\[[^\]]+\]\([^)]+\))/g);
    return parts.map((part, idx) => {
      const m = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (m) {
        return (
          <Link key={idx} href={m[2]} onClick={() => setIsOpen(false)}
            className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-semibold underline underline-offset-4 mx-0.5 transition-colors">
            {m[1]}<ArrowRight className="w-3.5 h-3.5 inline" />
          </Link>
        );
      }
      return (
        <React.Fragment key={idx}>
          {part.split(/(\*\*.*?\*\*)/g).map((sub, si) =>
            sub.startsWith("**") && sub.endsWith("**")
              ? <strong key={si} className="font-semibold text-white">{sub.slice(2, -2)}</strong>
              : <span key={si}>{sub}</span>
          )}
        </React.Fragment>
      );
    });
  };

  if (pathname === "/chat" || pathname?.startsWith("/chat")) return null;

  return (
    <>
      {/* Edge Tab when hidden */}
      {mounted && isHidden && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            lastActionTime.current = Date.now();
            setIsHidden(false);
            // Snap back to right edge at the exact same Y position
            const initialX = window.innerWidth - BTN_SIZE - EDGE_MARGIN;
            x.set(initialX);
          }}
          style={{ top: y.get() }}
          className="fixed right-0 z-50 flex items-center justify-center w-8 h-16 bg-[#0d0d0f]/90 backdrop-blur border border-r-0 border-white/10 rounded-l-xl text-white/60 hover:text-white shadow-xl transition-all duration-200 hover:bg-indigo-950/60 hover:w-10 group"
          aria-label="Show M Chat"
        >
          <ChevronLeft className="w-5 h-5 text-indigo-400 group-hover:-translate-x-0.5 transition-transform" />
        </button>
      )}

      {/* Desktop floating button using Framer Motion */}
      {mounted && !isHidden && (
        <>
          <motion.div
            drag="x"
            dragConstraints={dragLimits}
            dragElastic={0}
            dragMomentum={false}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onTap={() => {
              if (Date.now() - lastActionTime.current < 400) return; // Ignore ghost taps right after drag/unhide
              
              if (window.innerWidth < 640) {
                window.location.href = "/chat";
              } else {
                setIsOpen(!isOpen);
              }
            }}
            style={{
              x,
              y,
              position: "fixed",
              top: 0,
              left: 0,
              width: BTN_SIZE,
              height: BTN_SIZE,
              zIndex: 50,
              touchAction: "none"
            }}
          >
            <button
              className="relative flex items-center justify-center w-full h-full bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 text-white rounded-full shadow-2xl shadow-indigo-500/40 border border-white/20 active:scale-95 pointer-events-none"
              aria-label="Open M Chat"
            >
              <div className="absolute top-1 right-1 w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse border-2 border-[#0a0a0a]" />
              {isOpen
                ? <X className="w-5 h-5 text-white" />
                : <Sparkles className="w-6 h-6 text-indigo-200 animate-spin" style={{ animationDuration: "8s" }} />
              }
            </button>
          </motion.div>

          {/* Chat panel */}
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              style={{
                position: "fixed",
                left: isOnLeft
                  ? x.get() + BTN_SIZE + 12
                  : Math.max(8, x.get() - 428 - 12),
                top: Math.max(8, Math.min(y.get() - 280, (typeof window !== 'undefined' ? window.innerHeight : 900) - 628)),
                width: 420,
                maxHeight: "min(620px, calc(100vh - 24px))",
                zIndex: 49,
              }}
              className="bg-[#0d0d0f]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="p-4 bg-gradient-to-r from-indigo-950/60 via-purple-950/40 to-black/60 border-b border-white/10 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h3 className="text-white text-base font-bold tracking-wide">M Chat</h3>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={resetChat} title="Reset"
                    className="p-2 text-white/40 hover:text-white/80 hover:bg-white/5 rounded-lg transition-colors">
                    <RefreshCw className="w-4 h-4" />
                  </button>
                  <button onClick={() => setIsOpen(false)} title="Close"
                    className="p-2 text-white/40 hover:text-white/80 hover:bg-white/5 rounded-lg transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex gap-3 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                    {msg.sender === "ai" && (
                      <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0 mt-1">
                        <Bot className="w-4 h-4 text-indigo-400" />
                      </div>
                    )}
                    <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                      msg.sender === "user"
                        ? "bg-indigo-600 text-white rounded-br-xs font-medium"
                        : "bg-white/5 border border-white/10 text-white/80 rounded-bl-xs shadow-sm whitespace-pre-wrap"
                    }`}>
                      {msg.sender === "ai" ? renderFormattedText(msg.text) : msg.text}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex gap-3 justify-start items-center text-white/40 text-xs py-2">
                    <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                      <Bot className="w-4 h-4 text-indigo-400" />
                    </div>
                    <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3.5 py-2.5 rounded-2xl rounded-bl-xs">
                      <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                      <span>Curating recommendations...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Suggestions */}
              {messages.length <= 2 && !loading && (
                <div className="px-4 pb-2 shrink-0">
                  <p className="text-white/30 text-[11px] uppercase tracking-wider mb-2 font-semibold">Suggested inquiries</p>
                  <div className="flex flex-wrap gap-1.5">
                    {SUGGESTIONS.map((sug, idx) => (
                      <button key={idx} onClick={() => handleSend(sug)}
                        className="text-left text-xs bg-white/[0.04] hover:bg-white/[0.08] text-white/70 hover:text-white px-2.5 py-1.5 rounded-lg border border-white/[0.06] transition-all duration-200">
                        {sug}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input */}
              <div className="p-3 bg-black/40 border-t border-white/10 shrink-0">
                <form onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                  className="flex items-center gap-2 bg-white/[0.06] border border-white/10 rounded-xl px-3 py-1.5 focus-within:border-indigo-500/50 transition-colors">
                  <input type="text" value={input} onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about attire, sizing, or occasions..."
                    className="flex-1 bg-transparent text-white text-sm placeholder:text-white/30 focus:outline-none py-1.5"
                    disabled={loading} />
                  <button type="submit" disabled={!input.trim() || loading}
                    className="p-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:bg-white/5 disabled:text-white/20 text-white transition-all duration-200">
                    <Send className="w-4 h-4" />
                  </button>
                </form>
                <p className="text-[10px] text-white/20 text-center mt-2">M Chat</p>
              </div>
            </motion.div>
          )}
        </>
      )}
    </>
  );
}
