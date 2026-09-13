"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Send, Bot, Loader2, ArrowLeft, ArrowRight } from "lucide-react";

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

export default function MobileChatPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "ai",
      text: "Welcome to M Chat. How may I assist you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const msgIdRef = useRef(100);

  const getNextId = () => {
    msgIdRef.current += 1;
    return msgIdRef.current.toString();
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMsg: Message = {
      id: getNextId(),
      sender: "user",
      text: query.trim(),
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    if (!textToSend) setInput("");
    setLoading(true);

    try {
      const apiMessages = updatedMessages
        .filter((m) => m.id !== "welcome")
        .map((m) => ({
          role: m.sender === "user" ? "user" : "model",
          parts: [{ text: m.text }],
        }));

      const payloadMessages =
        apiMessages.length > 0
          ? apiMessages
          : [{ role: "user", parts: [{ text: userMsg.text }] }];

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: payloadMessages }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Stylist unavailable at the moment.");
      }

      setMessages((prev) => [
        ...prev,
        {
          id: getNextId(),
          sender: "ai",
          text: data.reply,
        },
      ]);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Please try again shortly.";
      setMessages((prev) => [
        ...prev,
        {
          id: getNextId(),
          sender: "ai",
          text: `We apologize, but our stylist connection encountered an issue: ${errMsg}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };


  const renderFormattedText = (text: string) => {
    const linkRegex = /(\[[^\]]+\]\([^)]+\))/g;
    const parts = text.split(linkRegex);

    return parts.map((part, idx) => {
      const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (linkMatch) {
        const title = linkMatch[1];
        const url = linkMatch[2];
        return (
          <Link
            key={idx}
            href={url}
            className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-semibold underline underline-offset-4 mx-0.5 transition-colors"
          >
            {title}
            <ArrowRight className="w-3.5 h-3.5 inline" />
          </Link>
        );
      }

      const boldParts = part.split(/(\*\*.*?\*\*)/g);
      return (
        <React.Fragment key={idx}>
          {boldParts.map((sub, sIdx) => {
            if (sub.startsWith("**") && sub.endsWith("**")) {
              return (
                <strong key={sIdx} className="font-semibold text-white">
                  {sub.slice(2, -2)}
                </strong>
              );
            }
            return <span key={sIdx}>{sub}</span>;
          })}
        </React.Fragment>
      );
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0a0a0f] text-white flex flex-col overflow-hidden w-full h-[100dvh]">
      {/* Floating Back Button Arrow Only */}
      <div className="absolute top-4 left-4 z-50">
        <button
          onClick={() => router.back()}
          className="p-3 text-white/80 hover:text-white bg-white/[0.08] hover:bg-white/[0.15] border border-white/10 rounded-full backdrop-blur-xl transition-all active:scale-95 shadow-lg flex items-center justify-center"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>

      {/* Message History */}
      <main className="flex-1 overflow-y-auto p-4 pt-16 md:p-6 md:pt-20 space-y-4 max-w-3xl w-full mx-auto">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.sender === "ai" && (
              <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0 mt-1">
                <Bot className="w-4 h-4 text-indigo-400" />
              </div>
            )}

            <div
              className={`max-w-[85%] px-4 py-3.5 rounded-2xl text-sm md:text-base leading-relaxed ${
                msg.sender === "user"
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-br-xs font-medium shadow-lg shadow-indigo-600/20"
                  : "bg-white/[0.06] border border-white/10 text-white/90 rounded-bl-xs shadow-sm whitespace-pre-wrap"
              }`}
            >
              {msg.sender === "ai" ? renderFormattedText(msg.text) : msg.text}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 justify-start items-center text-white/50 text-xs py-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="flex items-center gap-2.5 bg-white/[0.06] border border-white/10 px-4 py-3 rounded-2xl rounded-bl-xs">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
              <span>Curating recommendations...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </main>

      {/* Quick Suggestion Pills */}
      {messages.length <= 2 && !loading && (
        <div className="px-4 pb-3 max-w-3xl w-full mx-auto">
          <p className="text-white/40 text-[11px] uppercase tracking-wider mb-2 font-semibold">
            Suggested inquiries
          </p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((sug, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(sug)}
                className="text-left text-xs bg-white/[0.05] hover:bg-white/[0.1] text-white/80 hover:text-white px-3 py-2 rounded-xl border border-white/10 transition-all duration-200"
              >
                {sug}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Sticky Bottom Input Bar */}
      <footer className="sticky bottom-0 z-40 p-3 md:p-4 bg-black/90 backdrop-blur-2xl border-t border-white/10 shadow-2xl">
        <div className="max-w-3xl w-full mx-auto">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2 bg-white/[0.08] border border-white/15 rounded-2xl px-4 py-2 focus-within:border-indigo-500/60 transition-colors shadow-inner"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about attire, sizing, or occasions..."
              className="flex-1 bg-transparent text-white text-sm md:text-base placeholder:text-white/40 focus:outline-none py-1.5"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="p-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:from-white/5 disabled:to-white/5 disabled:text-white/20 text-white transition-all duration-200 shadow-md"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <p className="text-[10px] text-white/30 text-center mt-2">
            M Chat &bull; Modestus Luxury AI
          </p>
        </div>
      </footer>
    </div>
  );
}
