import { useCallback, useEffect, useState } from "react";
import { MessageSquare, RefreshCw } from "lucide-react";
import { adminAPI, getApiErrorMessage } from "../../lib/api";
import { title } from "./AdminDashboard";

const ENQUIRY_ARRAY_KEYS = ["enquiries", "admin_enquiries", "data", "items", "list", "records"];
const MESSAGE_ARRAY_KEYS = ["messages", "contact_messages", "data", "items", "list", "records"];

/** Pull an array of row objects from typical admin API envelopes */
function extractRows(raw, preferredKeys) {
  if (raw == null) return [];
  if (Array.isArray(raw)) return raw.filter((x) => x && typeof x === "object");
  if (typeof raw !== "object") return [];
  if (raw.success === false) return [];
  for (const key of preferredKeys) {
    if (Array.isArray(raw[key])) return raw[key];
  }
  if (Array.isArray(raw.data)) return raw.data;
  if (raw.data && typeof raw.data === "object") {
    for (const key of preferredKeys) {
      if (Array.isArray(raw.data[key])) return raw.data[key];
    }
    if (Array.isArray(raw.data.items)) return raw.data.items;
  }
  if (Array.isArray(raw.items)) return raw.items;
  return [];
}

function formatLabel(key) {
  return String(key)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatValue(v) {
  if (v == null) return "";
  if (typeof v === "object") return JSON.stringify(v, null, 2);
  return String(v);
}

function isHiddenEnquiryField(key) {
  const k = String(key).toLowerCase();
  if (k === "id" || k === "_id") return true;
  return k === "enquiry_id" || k === "enquiryid";
}

function pickEnquiryId(row) {
  if (!row || typeof row !== "object") return null;
  for (const k of Object.keys(row)) {
    if (!isHiddenEnquiryField(k)) continue;
    const v = row[k];
    if (v != null && v !== "") return v;
  }
  return null;
}

function isHiddenMessageField(key) {
  const k = String(key).toLowerCase();
  if (k === "id" || k === "_id") return true;
  return ["enquiry_id", "contact_id", "message_id", "contact_message_id"].includes(k);
}

function cardShell(children) {
  return (
    <article
      style={{
        background: "#FFFFFF",
        border: "1px solid #D6E8D6",
        borderRadius: 14,
        padding: "clamp(14px, 4vw, 18px)",
        boxShadow: "0 4px 14px rgba(26,46,26,0.06)",
        minWidth: 0,
        width: "100%",
      }}
    >
      {children}
    </article>
  );
}

function EnquiryCard({ row, index }) {
  const entries = Object.entries(row).filter(([k]) => k !== "__proto__");

  return cardShell(
    <>
      <div
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: "#757575",
          marginBottom: 12,
          paddingBottom: 10,
          borderBottom: "1px solid #E8F5E9",
        }}
      >
        Enquiry #{index + 1}
      </div>
      <dl style={{ margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
        {entries.map(([key, val]) => {
          if (val === undefined || val === null || val === "") return null;
          if (isHiddenEnquiryField(key)) return null;
          return (
            <div key={key} style={{ minWidth: 0 }}>
              <dt style={{ fontSize: 11, fontWeight: 700, color: "#607060", marginBottom: 4 }}>{formatLabel(key)}</dt>
              <dd
                style={{
                  margin: 0,
                  fontSize: 14,
                  color: "#1A1A1A",
                  fontWeight: 600,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  overflowWrap: "anywhere",
                }}
              >
                {formatValue(val)}
              </dd>
            </div>
          );
        })}
      </dl>
    </>,
  );
}

function ContactMessageCard({ row, index }) {
  const entries = Object.entries(row).filter(([k]) => k !== "__proto__" && !isHiddenMessageField(k));

  return cardShell(
    <>
      <div
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: "#757575",
          marginBottom: 12,
          paddingBottom: 10,
          borderBottom: "1px solid #E8F5E9",
        }}
      >
        Message #{index + 1}
      </div>
      <dl style={{ margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
        {entries.map(([key, val]) => {
          if (val === undefined || val === null || val === "") return null;
          return (
            <div key={key} style={{ minWidth: 0 }}>
              <dt style={{ fontSize: 11, fontWeight: 700, color: "#607060", marginBottom: 4 }}>{formatLabel(key)}</dt>
              <dd
                style={{
                  margin: 0,
                  fontSize: 14,
                  color: "#1A1A1A",
                  fontWeight: 600,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  overflowWrap: "anywhere",
                }}
              >
                {formatValue(val)}
              </dd>
            </div>
          );
        })}
      </dl>
    </>,
  );
}

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 320px), 1fr))",
  gap: "clamp(12px, 3vw, 18px)",
  width: "100%",
};

const sectionHead = {
  fontSize: "clamp(18px, 2.5vw, 22px)",
  fontWeight: 800,
  color: "#1A2E1A",
  margin: "28px 0 14px",
  display: "flex",
  alignItems: "center",
  gap: 10,
};

export default function AdminEnquiriesMessages() {
  const [enquiries, setEnquiries] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loadingE, setLoadingE] = useState(true);
  const [loadingM, setLoadingM] = useState(true);
  const [errorE, setErrorE] = useState(null);
  const [errorM, setErrorM] = useState(null);

  const loadAll = useCallback(async () => {
    setErrorE(null);
    setErrorM(null);
    setLoadingE(true);
    setLoadingM(true);

    const runE = adminAPI
      .getAdminEnquiries()
      .then((raw) => {
        setEnquiries(extractRows(raw, ENQUIRY_ARRAY_KEYS));
      })
      .catch((err) => {
        setErrorE(getApiErrorMessage(err, "Could not load enquiries."));
        setEnquiries([]);
      })
      .finally(() => setLoadingE(false));

    const runM = adminAPI
      .getContactMessages()
      .then((raw) => {
        setMessages(extractRows(raw, MESSAGE_ARRAY_KEYS));
      })
      .catch((err) => {
        setErrorM(getApiErrorMessage(err, "Could not load contact messages."));
        setMessages([]);
      })
      .finally(() => setLoadingM(false));

    await Promise.all([runE, runM]);
  }, []);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  const loading = loadingE || loadingM;

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", width: "100%" }}>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: 8,
        }}
      >
        <h1 style={{ ...title, marginBottom: 0 }}>Enquiries &amp; Messages</h1>
        <button
          type="button"
          onClick={() => void loadAll()}
          disabled={loading}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 16px",
            borderRadius: 12,
            border: "none",
            background: loading ? "#C8E6C9" : "linear-gradient(135deg, #4CAF50, #388E3C)",
            color: "#FFFFFF",
            fontWeight: 800,
            cursor: loading ? "wait" : "pointer",
            fontSize: 14,
          }}
        >
          <RefreshCw size={18} style={{ animation: loading ? "spin 0.8s linear infinite" : undefined }} />
          Refresh
        </button>
      </div>
      <p style={{ color: "#607060", marginBottom: 20, fontSize: 15 }}>Product enquiries and contact form submissions (admin token).</p>

      <h2 style={sectionHead}>
        <MessageSquare size={22} color="#2E7D32" aria-hidden />
        Enquiries
      </h2>
      {loadingE ? (
        <p style={{ color: "#607060" }}>Loading enquiries…</p>
      ) : errorE ? (
        <p style={{ color: "#C62828", fontWeight: 700 }}>{errorE}</p>
      ) : enquiries.length === 0 ? (
        <p style={{ color: "#607060" }}>No enquiries yet.</p>
      ) : (
        <div style={grid}>
          {enquiries.map((row, i) => (
            <EnquiryCard key={pickEnquiryId(row) ?? `enquiry-${i}`} row={row} index={i} />
          ))}
        </div>
      )}

      <h2 style={{ ...sectionHead, marginTop: 36 }}>
        <MessageSquare size={22} color="#2E7D32" aria-hidden />
        Contact messages
      </h2>
      {loadingM ? (
        <p style={{ color: "#607060" }}>Loading messages…</p>
      ) : errorM ? (
        <p style={{ color: "#C62828", fontWeight: 700 }}>{errorM}</p>
      ) : messages.length === 0 ? (
        <p style={{ color: "#607060" }}>No contact messages yet.</p>
      ) : (
        <div style={grid}>
          {messages.map((row, i) => (
            <ContactMessageCard key={`msg-${i}`} row={row} index={i} />
          ))}
        </div>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
