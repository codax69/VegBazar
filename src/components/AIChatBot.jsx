import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Bot,
  X,
  Send,
  Sparkles,
  ChevronRight,
  RefreshCw,
  ShoppingBag,
  Package,
  Wallet,
  HelpCircle,
} from "lucide-react";
import { useOrderContext } from "../Context/OrderContext";
import { useAuth } from "../Context/AuthContext.jsx";

const INITIAL_SUGGESTIONS = [
  { label: "🥦 Fresh veggies today?", query: "What fresh vegetables do you recommend today?" },
  { label: "🧺 Family basket deal?", query: "Recommend a vegetable basket for a family of 4" },
  { label: "🚚 Delivery hours in Valsad?", query: "How does delivery work and what are the timings?" },
  { label: "💰 Wallet cashback & offers?", query: "How can I earn cashback using VegBazar wallet?" },
  { label: "🥗 Low calorie green veggies?", query: "Which vegetables are low calorie and best for weight loss?" },
];

const BOT_KNOWLEDGE = [
  {
    keywords: ["fresh", "today", "recommend", "veggie", "vegetables"],
    text: "Here are our top recommended fresh vegetables today! Farm-fresh and delivered directly to your doorstep in Valsad:",
    action: { label: "Browse Vegetables", path: "/vegetables", icon: ShoppingBag },
  },
  {
    keywords: ["basket", "family", "package", "offer", "combo"],
    text: "Our curated Vegetable Baskets save you up to 25%! We offer daily essential bundles, mini baskets, and mega family baskets.",
    action: { label: "View Baskets & Offers", path: "/offers", icon: Package },
  },
  {
    keywords: ["delivery", "time", "hours", "valsad", "shipping", "charge"],
    text: "We deliver across Valsad, Abrama, Tithal Road, and Halar between 7:00 AM - 11:00 AM daily. Orders above ₹269 get FREE Delivery!",
    action: { label: "Support & Delivery Info", path: "/support", icon: HelpCircle },
  },
  {
    keywords: ["wallet", "cashback", "money", "pay", "discount"],
    text: "Use VegBazar Wallet for instant 1-click checkout! Top up your wallet to unlock exclusive cashback rewards and instant refunds.",
    action: { label: "Open My Wallet", path: "/wallet", icon: Wallet },
  },
  {
    keywords: ["calorie", "weight", "diet", "green", "soup", "salad"],
    text: "Great choices for a healthy diet include Spinach, Broccoli, Cucumber, Lauki (Bottle Gourd), and Capsicum. High in fiber & low in calories!",
    action: { label: "Shop Healthy Greens", path: "/vegetables", icon: ShoppingBag },
  },
];

const AIChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [unread, setUnread] = useState(true);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showFloatingMsg, setShowFloatingMsg] = useState(true);
  const [typedText, setTypedText] = useState("");

  let user = null;
  try {
    const auth = useAuth();
    user = auth?.user;
  } catch {
    // AuthContext fallback
  }

  const username = user?.username || user?.name?.split(" ")[0] || user?.email?.split("@")[0] || "there";
  const fullFloatingText = `Hello! How can I help ${username}?`;

  useEffect(() => {
    let index = 0;
    setTypedText("");
    const timer = setInterval(() => {
      if (index < fullFloatingText.length) {
        setTypedText(fullFloatingText.slice(0, index + 1));
        index++;
      } else {
        clearInterval(timer);
      }
    }, 45);

    return () => clearInterval(timer);
  }, [fullFloatingText]);

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "bot",
      text: "Hello! 👋 I'm **VeggieBot**, your fresh assistant. How can I help you shop for quality vegetables today?",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const { navigate } = useOrderContext();
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setUnread(false);
    }
  }, [messages, isOpen]);

  const getBotResponse = (userText) => {
    const lower = userText.toLowerCase();

    for (const item of BOT_KNOWLEDGE) {
      if (item.keywords.some((kw) => lower.includes(kw))) {
        return { text: item.text, action: item.action };
      }
    }

    return {
      text: "Thanks for asking! I can help you find fresh vegetables, basket deals, delivery schedules in Valsad, and wallet cashback offers.",
      action: { label: "Browse Catalog", path: "/vegetables", icon: ShoppingBag },
    };
  };

  const handleSend = useCallback(
    (textToSend) => {
      const queryText = textToSend || inputMessage;
      if (!queryText.trim()) return;

      const userMsg = {
        id: Date.now(),
        sender: "user",
        text: queryText,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, userMsg]);
      setInputMessage("");
      setIsTyping(true);

      setTimeout(() => {
        const reply = getBotResponse(queryText);
        const botMsg = {
          id: Date.now() + 1,
          sender: "bot",
          text: reply.text,
          action: reply.action,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages((prev) => [...prev, botMsg]);
        setIsTyping(false);
      }, 700);
    },
    [inputMessage]
  );

  const handleActionClick = (path) => {
    setIsOpen(false);
    window.scrollTo({ top: 0, behavior: "instant" });
    navigate(path);
  };

  return (
    <>
      {showFloatingMsg && !isOpen && (
        <div className="fixed bottom-32 md:bottom-20 right-4 md:right-6 z-40 max-w-[260px] animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="relative bg-[var(--color-bg-surface)] border border-[var(--color-border)] text-[var(--color-text-primary)] p-3 rounded-[12px] text-xs font-body shadow-lg flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 overflow-hidden">
              <Sparkles className="w-4 h-4 text-[var(--color-amber)] shrink-0" />
              <p className="truncate font-medium">{typedText}</p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowFloatingMsg(false);
              }}
              className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] p-0.5 rounded-full"
              title="Dismiss message"
              aria-label="Dismiss message"
            >
              <X className="w-3.5 h-3.5" />
            </button>
            <div className="absolute -bottom-1.5 right-5 w-3 h-3 bg-[var(--color-bg-surface)] border-b border-r border-[var(--color-border)] transform rotate-45" />
          </div>
        </div>
      )}

      {/* Floating Trigger Button */}
      <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-40">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[var(--color-brand-green)] hover:bg-[var(--color-brand-green-hover)] text-white shadow-lg transition-transform duration-150 focus:outline-none"
          aria-label="Open AI Assistant"
        >
          {isOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <>
              <Bot className="w-6 h-6 sm:w-7 sm:h-7" />
              {unread && (
                <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-[var(--color-amber)] text-[var(--color-amber-ink)] rounded-full border-2 border-[var(--color-bg-surface)]" />
              )}
            </>
          )}
        </button>
      </div>

      {/* Chat Drawer / Modal */}
      {isOpen && (
        <div className="fixed bottom-36 md:bottom-24 right-4 md:right-6 z-40 w-[calc(100vw-32px)] sm:w-96 h-[480px] max-h-[75vh] bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-[12px] shadow-xl flex flex-col overflow-hidden transition-colors duration-150">
          {/* Header */}
          <div className="bg-[var(--color-brand-green)] p-3.5 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="relative w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
                <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-400 rounded-full" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-sm flex items-center gap-1">
                  VeggieBot
                </h3>
                <p className="text-[10px] text-white/80 font-body">Always active to assist you</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full hover:bg-white/20 transition-colors"
              aria-label="Close Chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Suggestions Chips */}
          <div className="p-2 bg-[var(--color-bg-app)] border-b border-[var(--color-border)] overflow-x-auto whitespace-nowrap scrollbar-none flex gap-1.5 font-body">
            {INITIAL_SUGGESTIONS.map((sug, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(sug.query)}
                className="px-2.5 py-1 bg-[var(--color-bg-surface)] border border-[var(--color-border)] hover:border-[var(--color-border-strong)] rounded-full text-[11px] font-medium text-[var(--color-text-secondary)] transition-colors shrink-0 hover:bg-[var(--color-tint-green)]"
              >
                {sug.label}
              </button>
            ))}
          </div>

          {/* Message List */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3 font-body bg-[var(--color-bg-app)]">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[82%] px-3.5 py-2.5 rounded-[12px] text-xs leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-[var(--color-brand-green)] text-white rounded-br-none"
                      : "bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] border border-[var(--color-border)] rounded-bl-none"
                  }`}
                >
                  <p>{msg.text}</p>

                  {/* Action Link inside Bot Message */}
                  {msg.action && (
                    <button
                      onClick={() => handleActionClick(msg.action.path)}
                      className="mt-2 w-full flex items-center justify-between px-3 py-1.5 bg-[var(--color-tint-green)] hover:bg-[var(--color-brand-green)] hover:text-white text-[var(--color-brand-green)] rounded-[6px] text-[11px] font-medium border border-[var(--color-border)] transition-colors"
                    >
                      <span className="flex items-center gap-1.5">
                        <msg.action.icon className="w-3.5 h-3.5" />
                        {msg.action.label}
                      </span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <span className="text-[9px] text-[var(--color-text-muted)] font-mono mt-1 px-1">
                  {msg.time}
                </span>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] p-2 font-body">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-[var(--color-brand-green)]" />
                <span>VeggieBot is thinking...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-2.5 bg-[var(--color-bg-surface)] border-t border-[var(--color-border)] flex items-center gap-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask VeggieBot anything..."
              className="flex-1 px-3 py-2 bg-[var(--color-bg-app)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-xs rounded-[8px] focus:outline-none focus:border-[var(--color-brand-green)] font-body"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim()}
              className="p-2 rounded-[8px] bg-[var(--color-brand-green)] hover:bg-[var(--color-brand-green-hover)] text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Send Message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default AIChatBot;
