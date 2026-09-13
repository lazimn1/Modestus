"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, Send, X, RefreshCw, Bot, Loader2, ArrowRight, EyeOff, Eye, GripHorizontal } from "lucide-react";

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

const DEFAULT_POS = { x: -96, y: -96 }; // offset from bottom-right corner (negative = distance from edge)

export default function AiStylistWidget() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: "welcome", sender: "ai", text: "Welcome to M Chat. How may I assist you today?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const msgIdRef = useRef(100);

  // Drag state
  const [pos, setPos] = useState(DEFAULT_POS);
  const isDragging = useRef(false);
  const dragStart = useRef({ mouseX: 0, mouseY: 0, elX: 0, elY: 0 });
  const hasDragged = useRef(false);
  const buttonRef = useRef<HTMLDivElement>(null);

  // Persist position in sessionStorage
  useEffect(() => {
    const saved = sessionStorage.getItem("mchat_pos");
    if (saved) {
      try { setPos(JSON.parse(saved)); } catch {}
    }
  }, []);

  useEffect(() => {
    sessionStorage.setItem("mchat_pos", JSON.stringify(pos));
  }, [pos]);

  const getStyle = (): React.CSSProperties => {
    // pos stores pixel offset from bottom-right
    return {
      position: "fixed",
      right: Math.abs(pos.x),
      bottom: Math.abs(pos.y),
      zIndex: 50,
    };
  };

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    isDragging.current = true;
    hasDragged.current = false;
    dragStart.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      elX: pos.x,
      elY: pos.y,
    };
    e.preventDefault();
  }, [pos]);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    isDragging.current = true;
    hasDragged.current = false;
    const t = e.touches[0];
    dragStart.current = {
      mouseX: t.clientX,
      mouseY: t.clientY,
      elX: pos.x,
      elY: pos.y,
    };
  }, [pos]);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const dx = e.clientX - dragStart.current.mouseX;
      const dy = e.clientY - dragStart.current.mouseY;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) hasDragged.current = true;
      // Moving right = decreasing right offset, moving left = increasing right offset
      const newX = Math.min(-24, dragStart.current.elX - dx); // keep at least 24px from right
      // Moving down = decreasing bottom offset, moving up = increasing bottom offset
      const newY = Math.min(-24, dragStart.current.elY + dy); // keep at least 24px from bottom
      setPos({ x: newX, y: newY });
    };

    const onMouseUp = () => { isDragging.current = false; };

    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging.current) return;
      const t = e.touches[0];
      const dx = t.clientX - dragStart.current.mouseX;
      const dy = t.clientY - dragStart.current.mouseY;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) hasDragged.current = true;
      const newX = Math.min(-24, dragStart.current.elX - dx);
      const newY = Math.min(-24, dragStart.current.elY + dy);
      setPos({ x: newX, y: newY });
      e.preventDefault();
    };

    const onTouchEnd = () => { isDragging.current = false; };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  const getNextId = () => { msgIdRef.current += 1; return msgIdRef.current.toString(); };

  useEffect(() => {
    if (isOpen) messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;
    const userMsg: Message = { id: getNextId(), sender: "user", text: query.trim() };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    if (!textToSend) setInput("");
    setLoading(true);
    try {
      const apiMessages = updatedMessages
        .filter((m) => m.id !== "welcome")
        .map((m) => ({ role: m.sender === "user" ? "user" : "model", parts: [{ text: m.text }] }));
      const payloadMessages = apiMessages.length > 0 ? apiMessages : [{ role: "user", parts: [{ text: userMsg.text }] }];
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: payloadMessages }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Stylist unavailable at the moment.");
      setMessages((prev) => [...prev, { id: getNextId(), sender: "ai", text: data.reply }]);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Please try again shortly.";
      setMessages((prev) => [...prev, { id: getNextId(), sender: "ai", text: `We apologize, but our stylist connection encountered an issue: ${errMsg}` }]);
    } finally {
      setLoading(false);
    }
  };

  const resetChat = () => {
    setMessages([{ id: "welcome", sender: "ai", text: "Welcome to M Chat. How may I assist you today?" }]);
  };

  const renderFormattedText = (text: string) => {
    const linkRegex = /(\[[^\]]+\]\([^)]+\))/g;
    const parts = text.split(linkRegex);
    return parts.map((part, idx) => {
      const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (linkMatch) {
        return (
          <Link key={idx} href={linkMatch[2]} onClick={() => setIsOpen(false)}
            className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-semibold underline underline-offset-4 mx-0.5 transition-colors">
            {linkMatch[1]}<ArrowRight className="w-3.5 h-3.5 inline" />
          </Link>
        );
      }
      const boldParts = part.split(/(\*\*.*?\*\*)/g);
      return (
        <React.Fragment key={idx}>
          {boldParts.map((sub, sIdx) =>
            sub.startsWith("**") && sub.endsWith("**")
              ? <strong key={sIdx} className="font-semibold text-white">{sub.slice(2, -2)}</strong>
              : <span key={sIdx}>{sub}</span>
          )}
        </React.Fragment>
      );
    });
  };

  if (pathname === "/chat" || pathname?.startsWith("/chat")) return null;

  // Collapsed "Show AI" tab when hidden
  if (isHidden) {
    return (
      <div style={{ position: "fixed", bottom: 24, right: 0, zIndex: 50 }}>
        <button
          onClick={() => setIsHidden(false)}
          className="flex items-center gap-2 px-3 py-2 bg-[#0d0d0f]/90 backdrop-blur border border-white/10 rounded-l-xl text-white/60 hover:text-white text-xs font-medium shadow-xl transition-all duration-200 hover:bg-indigo-950/60"
        >
          <Eye className="w-3.5 h-3.5 text-indigo-400" />
          M Chat
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Mobile: links to /chat page */}
      <div className="fixed bottom-5 right-5 z-50 block sm:hidden">
        <Link
          href="/chat"
          className="group relative flex items-center justify-center w-14 h-14 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-500 hover:to-purple-500 text-white rounded-full shadow-2xl shadow-indigo-500/30 border border-white/20 transition-all duration-300 active:scale-95"
          aria-label="Open M Chat"
        >
          <div className="absolute top-1 right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse border-2 border-[#0a0a0a]" />
          <Sparkles className="w-6 h-6 text-indigo-200 animate-spin" style={{ animationDuration: "8s" }} />
        </Link>
      </div>

      {/* Desktop: draggable + hideable */}
      <div ref={buttonRef} style={getStyle()} className="hidden sm:block">
        {/* Context menu */}
        {showContextMenu && !isOpen && (
          <div
            className="absolute bottom-16 right-0 bg-[#111] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 min-w-[140px] animate-in fade-in duration-150"
            onMouseLeave={() => setShowContextMenu(false)}
          >
            <button
              onClick={() => { setIsHidden(true); setShowContextMenu(false); }}
              className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
            >
              <EyeOff className="w-4 h-4 text-rose-400" />
              Hide widget
            </button>
            <button
              onClick={() => { setPos(DEFAULT_POS); setShowContextMenu(false); }}
              className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
            >
              <GripHorizontal className="w-4 h-4 text-indigo-400" />
              Reset position
            </button>
          </div>
        )}

        {/* Trigger Button */}
        {!isOpen && (
          <button
            onMouseDown={onMouseDown}
            onTouchStart={onTouchStart}
            onClick={() => { if (!hasDragged.current) setIsOpen(true); setShowContextMenu(false); }}
            onContextMenu={(e) => { e.preventDefault(); setShowContextMenu(v => !v); }}
            className="group relative flex items-center justify-center w-14 h-14 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-500 hover:to-purple-500 text-white rounded-full shadow-2xl shadow-indigo-500/30 border border-white/20 transition-all duration-300 hover:scale-105 cursor-grab active:cursor-grabbing select-none"
            aria-label="Open M Chat"
          >
            <div className="absolute top-1 right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse border-2 border-[#0a0a0a]" />
            <Sparkles className="w-6 h-6 text-indigo-200 animate-spin" style={{ animationDuration: "8s" }} />
          </button>
        )}

        {/* Chat Drawer */}
        {isOpen && (
          <div className="w-[420px] max-h-[620px] h-[80vh] bg-[#0d0d0f]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-300">
            {/* Header — drag handle for the drawer */}
            <div
              onMouseDown={onMouseDown}
              onTouchStart={onTouchStart}
              className="p-4 bg-gradient-to-r from-indigo-950/60 via-purple-950/40 to-black/60 border-b border-white/10 flex items-center justify-between cursor-grab active:cursor-grabbing select-none"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="text-white text-base font-bold tracking-wide">M Chat</h3>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => { setIsOpen(false); setIsHidden(true); }}
                  title="Hide widget"
                  className="p-2 text-white/40 hover:text-rose-400 hover:bg-white/5 rounded-lg transition-colors"
                >
                  <EyeOff className="w-4 h-4" />
                </button>
                <button onClick={resetChat} title="Reset conversation"
                  className="p-2 text-white/40 hover:text-white/80 hover:bg-white/5 rounded-lg transition-colors">
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button onClick={() => setIsOpen(false)} title="Close window"
                  className="p-2 text-white/40 hover:text-white/80 hover:bg-white/5 rounded-lg transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10">
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
              <div className="px-4 pb-2">
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
            <div className="p-3 bg-black/40 border-t border-white/10">
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
