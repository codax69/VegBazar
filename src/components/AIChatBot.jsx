import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Bot,
  X,
  Send,
  Sparkles,
  ChevronRight,
  RefreshCw,
  ShoppingBag,
  ShoppingCart,
  CheckCircle,
} from "lucide-react";
import { useOrderContext } from "../Context/OrderContext";
import { useAuth } from "../Context/AuthContext.jsx";

const INITIAL_SUGGESTIONS = [
  { label: "Healthy diabetic recipe?", query: "Suggest a healthy recipe for a diabetic person with ingredients in stock" },
  { label: "Fresh green veggies?", query: "What fresh green vegetables do you recommend today?" },
  { label: "Quick dinner meal?", query: "Suggest a quick 15-minute healthy dinner using fresh vegetables" },
  { label: "Wallet & cashback?", query: "How can I earn cashback using VegBazar wallet?" },
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
      text: "Hello! I'm **VegBazar AI Assistant**. Describe your health goal or cooking idea, and I will recommend recipes, manage your cart, or help place an order!",
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

  const handleSend = useCallback(
    async (textToSend) => {
      const queryText = textToSend || inputMessage;
      if (!queryText.trim() || isTyping) return;

      const userMsg = {
        id: Date.now(),
        sender: "user",
        text: queryText,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      const updatedMessages = [...messages, userMsg];
      setMessages(updatedMessages);
      setInputMessage("");
      setIsTyping(true);

      try {
        const payloadMessages = updatedMessages.map((m) => ({
          role: m.sender === "user" ? "user" : "assistant",
          content: m.text,
        }));

        let token = localStorage.getItem("accessToken");
        const headers = { "Content-Type": "application/json" };
        if (token) {
          headers["Authorization"] = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
        }

        let response = await fetch("/api/ai/chat", {
          method: "POST",
          headers,
          credentials: "include",
          body: JSON.stringify({ messages: payloadMessages }),
        });

        // If 401 (token expired), attempt auto refresh once
        if (response.status === 401) {
          try {
            const refreshRes = await fetch("/api/auth/refresh-token", {
              method: "POST",
              credentials: "include",
              headers: { "Content-Type": "application/json" },
            });
            const refreshData = await refreshRes.json();

            if (refreshRes.ok && refreshData.data?.accessToken) {
              token = refreshData.data.accessToken;
              localStorage.setItem("accessToken", token);
              headers["Authorization"] = `Bearer ${token}`;

              // Retry AI request with fresh token
              response = await fetch("/api/ai/chat", {
                method: "POST",
                headers,
                credentials: "include",
                body: JSON.stringify({ messages: payloadMessages }),
              });
            }
          } catch (refreshErr) {
            console.error("Auto token refresh failed:", refreshErr);
          }
        }

        const data = await response.json();

        if (response.status === 401) {
          throw new Error("Please log in to chat with VegBazar AI Assistant.");
        }

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Failed to communicate with AI endpoint.");
        }

        const botMsg = {
          id: Date.now() + 1,
          sender: "bot",
          text: data.reply || "Here is what I found for you:",
          actions: data.actions || [],
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };

        setMessages((prev) => [...prev, botMsg]);
      } catch (error) {
        console.error("AI Assistant API error:", error);
        const errorMsg = {
          id: Date.now() + 1,
          sender: "bot",
          text: error.message || "Sorry, I couldn't reach the AI assistant. Please try again.",
          isError: true,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages((prev) => [...prev, errorMsg]);
      } finally {
        setIsTyping(false);
      }
    },
    [inputMessage, messages, isTyping]
  );

  const handleActionClick = (path) => {
    setIsOpen(false);
    window.scrollTo({ top: 0, behavior: "instant" });
    navigate(path);
  };

  const renderActions = (actions) => {
    if (!Array.isArray(actions) || actions.length === 0) return null;

    return actions.map((action, idx) => {
      if (action.type === "products" && Array.isArray(action.items)) {
        return (
          <div key={idx} className="mt-2.5 p-2 bg-[var(--color-bg-app)] border border-[var(--color-border)] rounded-[8px]">
            <div className="text-[11px] font-semibold text-[var(--color-brand-green)] flex items-center gap-1 mb-1.5 uppercase tracking-wider">
              <ShoppingBag className="w-3.5 h-3.5" /> Recommended Vegetables
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {action.items.map((prod, pIdx) => (
                <div key={pIdx} className="bg-[var(--color-bg-surface)] p-2 rounded-[6px] border border-[var(--color-border)] text-left">
                  <p className="font-semibold text-[11px] text-[var(--color-text-primary)] truncate">{prod.name}</p>
                  <p className="text-[11px] font-bold text-[var(--color-brand-green)]">₹{prod.price}/{prod.unit || "kg"}</p>
                  <p className="text-[9px] text-[var(--color-text-muted)]">Stock: {prod.stock}kg</p>
                </div>
              ))}
            </div>
          </div>
        );
      }

      if (action.type === "cart" && action.cart) {
        const { items = [], total = 0, deliveryCharges = 0 } = action.cart;
        return (
          <div key={idx} className="mt-2.5 p-2.5 bg-[var(--color-bg-app)] border border-[var(--color-border)] rounded-[8px] text-left">
            <div className="text-[11px] font-semibold text-[var(--color-brand-green)] flex items-center gap-1 mb-1.5 uppercase tracking-wider">
              <ShoppingCart className="w-3.5 h-3.5" /> Updated Cart
            </div>
            {items.map((item, iIdx) => (
              <div key={iIdx} className="flex justify-between items-center text-[11px] py-0.5 border-b border-dashed border-[var(--color-border)]">
                <span>{item.name} ({item.weight || "1kg"}) × {item.quantity}</span>
                <span className="font-semibold">₹{item.totalPrice}</span>
              </div>
            ))}
            <div className="flex justify-between items-center text-[11px] font-bold text-[var(--color-brand-green)] mt-1.5 pt-1">
              <span>Delivery: ₹{deliveryCharges}</span>
              <span>Total: ₹{total}</span>
            </div>
            <button
              onClick={() => handleActionClick("/cart")}
              className="mt-2 w-full flex items-center justify-center gap-1 py-1 bg-[var(--color-brand-green)] text-white text-[11px] font-medium rounded-[6px]"
            >
              View Full Cart <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      }

      if (action.type === "order_confirmation" && action.order) {
        const { orderId, totalAmount, paymentMethod, deliveryEstimate } = action.order;
        return (
          <div key={idx} className="mt-2.5 p-2.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 rounded-[8px] text-left text-emerald-900 dark:text-emerald-200">
            <div className="text-[11px] font-bold flex items-center gap-1 mb-1 text-emerald-700 dark:text-emerald-400">
              <CheckCircle className="w-4 h-4 text-emerald-600" /> Order Placed!
            </div>
            <p className="text-[11px]">ID: <strong>{orderId}</strong></p>
            <p className="text-[11px]">Amount: <strong>₹{totalAmount}</strong> ({paymentMethod})</p>
            <p className="text-[11px]">Delivery: <strong>{deliveryEstimate}</strong></p>
            <button
              onClick={() => handleActionClick("/orders")}
              className="mt-2 w-full py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-medium rounded-[6px]"
            >
              Track Order Status
            </button>
          </div>
        );
      }

      return null;
    });
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
        <div className="fixed bottom-36 md:bottom-24 right-4 md:right-6 z-40 w-[calc(100vw-32px)] sm:w-[480px] md:w-[520px] h-[620px] max-h-[85vh] bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-[16px] shadow-2xl flex flex-col overflow-hidden transition-all duration-200">
          {/* Header */}
          <div className="bg-[var(--color-brand-green)] p-3.5 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="relative w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-sm flex items-center gap-1">
                  VegBazar AI Assistant
                </h3>
                <p className="text-[10px] text-white/80 font-body">Real-time product & order assistance</p>
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
                  className={`max-w-[85%] px-4 py-3 rounded-[14px] text-xs sm:text-sm leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-[var(--color-brand-green)] text-white rounded-br-none"
                      : msg.isError
                      ? "bg-red-50 text-red-700 border border-red-200 rounded-bl-none"
                      : "bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] border border-[var(--color-border)] rounded-bl-none"
                  }`}
                >
                  <p>{msg.text}</p>

                  {/* Render structured action cards */}
                  {msg.actions && renderActions(msg.actions)}
                </div>
                <span className="text-[9px] text-[var(--color-text-muted)] font-mono mt-1 px-1">
                  {msg.time}
                </span>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] p-2 font-body">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-[var(--color-brand-green)]" />
                <span>VegBazar AI is searching catalog & thinking...</span>
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
              placeholder="Ask recipes, products, or order items..."
              className="flex-1 px-3 py-2 bg-[var(--color-bg-app)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-xs rounded-[8px] focus:outline-none focus:border-[var(--color-brand-green)] font-body"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isTyping}
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
