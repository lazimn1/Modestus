"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, Send, X, RefreshCw, Bot, Loader2, ArrowRight } from "lucide-react";

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
const EDGE_MARGIN = 12;
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

  // We track the true position in a ref so drag handlers never have stale closures
  const posRef = useRef({ x: 0, y: 0 });
  // React state only used to trigger re-renders when needed (snap, open/close)
  const [committedPos, setCommittedPos] = useState({ x: 0, y: 0 });
  const [isSnapping, setIsSnapping] = useState(false);

  const btnWrapperRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const hasDragged = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  // Initialize position
  useEffect(() => {
    let initial = {
      x: window.innerWidth - BTN_SIZE - EDGE_MARGIN,
      y: window.innerHeight * DEFAULT_Y_RATIO,
    };
    const saved = sessionStorage.getItem("mchat_btn_pos2");
    if (saved) {
      try {
        const p = JSON.parse(saved);
        // Re-snap to correct edge based on saved side
        initial = {
          x: p.x < window.innerWidth / 2 ? EDGE_MARGIN : window.innerWidth - BTN_SIZE - EDGE_MARGIN,
          y: Math.max(EDGE_MARGIN, Math.min(p.y, window.innerHeight - BTN_SIZE - EDGE_MARGIN)),
        };
      } catch {}
    }
    posRef.current = initial;
    setCommittedPos(initial);
  }, []);

  // Apply position directly to the DOM element (bypasses React for smooth dragging)
  const applyPos = useCallback((x: number, y: number) => {
    if (btnWrapperRef.current) {
      btnWrapperRef.current.style.left = `${x}px`;
      btnWrapperRef.current.style.top = `${y}px`;
    }
  }, []);

  const snapToEdge = useCallback((x: number, y: number) => {
    const snappedX = x + BTN_SIZE / 2 < window.innerWidth / 2
      ? EDGE_MARGIN
      : window.innerWidth - BTN_SIZE - EDGE_MARGIN;
    const clampedY = Math.max(EDGE_MARGIN, Math.min(y, window.innerHeight - BTN_SIZE - EDGE_MARGIN));
    const finalPos = { x: snappedX, y: clampedY };

    posRef.current = finalPos;
    sessionStorage.setItem("mchat_btn_pos2", JSON.stringify(finalPos));

    setIsSnapping(true);
    setCommittedPos(finalPos); // triggers re-render with transition
    setTimeout(() => setIsSnapping(false), 400);
  }, []);

  // Attach global pointer events once on mount
  useEffect(() => {
    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging.current) return;
      e.preventDefault();

      const rawX = e.clientX - dragOffset.current.x;
      const rawY = e.clientY - dragOffset.current.y;
      const clampedX = Math.max(0, Math.min(rawX, window.innerWidth - BTN_SIZE));
      const clampedY = Math.max(0, Math.min(rawY, window.innerHeight - BTN_SIZE));

      if (Math.abs(rawX - posRef.current.x) > 3 || Math.abs(rawY - posRef.current.y) > 3) {
        hasDragged.current = true;
      }

      posRef.current = { x: clampedX, y: clampedY };
      // Directly mutate DOM style — no React re-render needed during drag
      applyPos(clampedX, clampedY);
    };

    const onPointerUp = () => {
      if (!isDragging.current) return;
      isDragging.current = false;
      document.body.style.userSelect = "";
      if (hasDragged.current) {
        snapToEdge(posRef.current.x, posRef.current.y);
      }
    };

    window.addEventListener("pointermove", onPointerMove, { passive: false });
    window.addEventListener("pointerup", onPointerUp);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, [applyPos, snapToEdge]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0 && e.pointerType === "mouse") return;
    isDragging.current = true;
    hasDragged.current = false;
    dragOffset.current = {
      x: e.clientX - posRef.current.x,
      y: e.clientY - posRef.current.y,
    };
    document.body.style.userSelect = "none";
    // Remove transition during drag so it follows instantly
    if (btnWrapperRef.current) {
      btnWrapperRef.current.style.transition = "none";
    }
    e.preventDefault();
  };

  const handleClick = () => {
    if (!hasDragged.current) setIsOpen((v) => !v);
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

  const isOnLeft = committedPos.x < window.innerWidth / 2;

  return (
    <>
      {/* Mobile */}
      <div className="fixed bottom-5 right-5 z-50 block sm:hidden">
        <Link href="/chat"
          className="group relative flex items-center justify-center w-14 h-14 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white rounded-full shadow-2xl shadow-indigo-500/30 border border-white/20 transition-all duration-300 active:scale-95"
          aria-label="Open M Chat">
          <div className="absolute top-1 right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse border-2 border-[#0a0a0a]" />
          <Sparkles className="w-6 h-6 text-indigo-200 animate-spin" style={{ animationDuration: "8s" }} />
        </Link>
      </div>

      {/* Desktop floating button — positioned via direct DOM ref */}
      <div className="hidden sm:block">
        <div
          ref={btnWrapperRef}
          style={{
            position: "fixed",
            left: committedPos.x,
            top: committedPos.y,
            width: BTN_SIZE,
            height: BTN_SIZE,
            zIndex: 50,
            transition: isSnapping
              ? "left 0.38s cubic-bezier(0.34, 1.56, 0.64, 1), top 0.38s cubic-bezier(0.34, 1.56, 0.64, 1)"
              : "none",
          }}
        >
          <button
            onPointerDown={handlePointerDown}
            onClick={handleClick}
            className="relative flex items-center justify-center w-full h-full bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 text-white rounded-full shadow-2xl shadow-indigo-500/40 border border-white/20 active:scale-90 touch-none select-none"
            style={{ cursor: "grab" }}
            aria-label="Open M Chat"
          >
            <div className="absolute top-1 right-1 w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse border-2 border-[#0a0a0a]" />
            {isOpen
              ? <X className="w-5 h-5 text-white" />
              : <Sparkles className="w-6 h-6 text-indigo-200 animate-spin" style={{ animationDuration: "8s" }} />
            }
          </button>
        </div>

        {/* Chat panel */}
        {isOpen && (
          <div
            style={{
              position: "fixed",
              left: isOnLeft
                ? committedPos.x + BTN_SIZE + 12
                : Math.max(8, committedPos.x - 428 - 12),
              top: Math.max(8, Math.min(committedPos.y - 280, window.innerHeight - 628)),
              width: 420,
              maxHeight: "min(620px, calc(100vh - 24px))",
              zIndex: 49,
            }}
            className="bg-[#0d0d0f]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
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
          </div>
        )}
      </div>
    </>
  );
}
