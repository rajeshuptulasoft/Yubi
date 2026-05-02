import { useEffect, useState } from "react";
import { Bot, Eye, Send, X } from "lucide-react";

const WHATSAPP_URL = "https://wa.me/919439731691";
const VISITOR_KEY = "yubiVisitorRegistered";
const VISITOR_COUNT_KEY = "yubiVisitorCount";

export default function UserFloatingTools() {
  const [chatOpen, setChatOpen] = useState(false);
  const [visitorCount, setVisitorCount] = useState(1);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hi, I am YUBI Assistant. How can I help you today?" },
  ]);

  useEffect(() => {
    const registered = localStorage.getItem(VISITOR_KEY);
    const storedCount = Number(localStorage.getItem(VISITOR_COUNT_KEY) || "0");
    if (!registered) {
      const next = Math.max(1, storedCount + 1);
      localStorage.setItem(VISITOR_KEY, "true");
      localStorage.setItem(VISITOR_COUNT_KEY, String(next));
      setVisitorCount(next);
      return;
    }
    setVisitorCount(Math.max(1, storedCount || 1));
  }, []);

  const sendMessage = () => {
    const text = message.trim();
    if (!text) return;
    setMessages((prev) => [
      ...prev,
      { from: "user", text },
      { from: "bot", text: "Thanks for reaching out. Our team will help you with food, spices, grocery, agro products, orders, and delivery support." },
    ]);
    setMessage("");
  };

  return (
    <>
      <div style={leftWrap}>
        <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" aria-label="Chat on WhatsApp" style={whatsappButton}>
          <WhatsAppIcon />
        </a>
        <div style={visitorBadge}>
          <Eye size={17} />
          <strong style={{ fontSize: 13, color: "#1A2E1A", lineHeight: 1, whiteSpace: "nowrap" }}>
            Visitor: {visitorCount}
          </strong>
        </div>
      </div>

      <button type="button" aria-label="Open AI chatbot" onClick={() => setChatOpen(true)} style={chatButton}>
        <Bot size={26} />
      </button>

      {chatOpen ? (
        <div style={chatPanel}>
          <div style={chatHeader}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Bot size={20} />
              <span style={{ fontWeight: 900 }}>YUBI AI Chatbot</span>
            </div>
            <button type="button" aria-label="Close chatbot" onClick={() => setChatOpen(false)} style={closeButton}>
              <X size={18} />
            </button>
          </div>
          <div style={chatBody}>
            {messages.map((item, index) => (
              <div
                key={`${item.from}-${index}`}
                style={{
                  ...messageBubble,
                  alignSelf: item.from === "user" ? "flex-end" : "flex-start",
                  background: item.from === "user" ? "#4CAF50" : "#F1F8F1",
                  color: item.from === "user" ? "#FFFFFF" : "#1A2E1A",
                }}
              >
                {item.text}
              </div>
            ))}
          </div>
          <div style={chatInputRow}>
            <input
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") sendMessage();
              }}
              placeholder="Ask YUBI..."
              style={chatInput}
            />
            <button type="button" aria-label="Send message" onClick={sendMessage} style={sendButton}>
              <Send size={17} />
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="29" height="29" viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="M16.02 4.02c-6.57 0-11.9 5.22-11.9 11.66 0 2.24.65 4.34 1.78 6.12L4 28l6.42-1.82a12.14 12.14 0 0 0 5.6 1.36c6.57 0 11.9-5.22 11.9-11.66S22.59 4.02 16.02 4.02Zm0 21.5c-1.82 0-3.52-.49-4.98-1.35l-.36-.21-3.7 1.05 1.08-3.55-.24-.37a9.55 9.55 0 0 1-1.65-5.41c0-5.32 4.42-9.65 9.85-9.65s9.85 4.33 9.85 9.65-4.42 9.84-9.85 9.84Zm5.4-7.25c-.29-.15-1.73-.84-2-.94-.27-.1-.47-.15-.67.15-.2.29-.77.94-.95 1.13-.17.2-.35.22-.64.07-.29-.15-1.23-.44-2.35-1.43-.87-.76-1.46-1.7-1.63-1.99-.17-.29-.02-.45.13-.59.13-.13.29-.35.44-.52.15-.17.2-.29.29-.49.1-.2.05-.37-.02-.52-.07-.15-.67-1.58-.92-2.17-.24-.57-.49-.49-.67-.5h-.57c-.2 0-.52.07-.79.37-.27.29-1.04 1-1.04 2.44s1.07 2.83 1.21 3.02c.15.2 2.1 3.15 5.1 4.42.71.3 1.27.48 1.7.62.72.22 1.37.19 1.89.12.58-.08 1.73-.69 1.98-1.36.24-.67.24-1.24.17-1.36-.07-.13-.27-.2-.56-.35Z"
      />
    </svg>
  );
}

const leftWrap = {
  position: "fixed",
  left: 22,
  bottom: 22,
  zIndex: 1200,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 8,
};

const whatsappButton = {
  width: 54,
  height: 54,
  borderRadius: "50%",
  background: "#25D366",
  color: "#FFFFFF",
  display: "grid",
  placeItems: "center",
  boxShadow: "0 12px 26px rgba(37,211,102,0.35)",
};

const visitorBadge = {
  minWidth: 112,
  padding: "9px 12px",
  borderRadius: 10,
  background: "#FFFFFF",
  boxShadow: "0 8px 22px rgba(26,46,26,0.14)",
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  gap: 7,
  color: "#4CAF50",
};

const chatButton = {
  position: "fixed",
  right: 24,
  bottom: 24,
  zIndex: 1200,
  width: 56,
  height: 56,
  borderRadius: "50%",
  background: "linear-gradient(135deg, #4CAF50, #1A2E1A)",
  color: "#FFFFFF",
  display: "grid",
  placeItems: "center",
  boxShadow: "0 14px 30px rgba(26,46,26,0.24)",
};

const chatPanel = {
  position: "fixed",
  right: 24,
  bottom: 92,
  zIndex: 1201,
  width: "min(340px, calc(100vw - 32px))",
  height: 430,
  borderRadius: 14,
  overflow: "hidden",
  background: "#FFFFFF",
  boxShadow: "0 22px 70px rgba(26,46,26,0.22)",
  border: "1px solid #D6E8D6",
  display: "flex",
  flexDirection: "column",
};

const chatHeader = {
  padding: "14px 16px",
  background: "linear-gradient(135deg, #4CAF50, #388E3C)",
  color: "#FFFFFF",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
};

const closeButton = {
  width: 32,
  height: 32,
  borderRadius: "50%",
  background: "rgba(255,255,255,0.18)",
  color: "#FFFFFF",
  display: "grid",
  placeItems: "center",
};

const chatBody = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  gap: 10,
  padding: 14,
  overflowY: "auto",
  background: "#FBFEFB",
};

const messageBubble = {
  maxWidth: "84%",
  padding: "10px 12px",
  borderRadius: 12,
  fontSize: 13,
  fontWeight: 700,
  lineHeight: 1.45,
};

const chatInputRow = {
  padding: 12,
  borderTop: "1px solid #E8F5E9",
  display: "flex",
  gap: 8,
};

const chatInput = {
  flex: 1,
  minWidth: 0,
  border: "1px solid #D6E8D6",
  borderRadius: 10,
  padding: "10px 12px",
  outline: "none",
  color: "#1A2E1A",
  fontWeight: 700,
};

const sendButton = {
  width: 42,
  borderRadius: 10,
  background: "#4CAF50",
  color: "#FFFFFF",
  display: "grid",
  placeItems: "center",
};
