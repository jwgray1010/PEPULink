import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import homeIcon from "../assets/home.svg";

function timeAgo(date) {
  const now = new Date();
  const diff = Math.floor((now - new Date(date)) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
  return `${Math.floor(diff/86400)}d ago`;
}

const demoTxs = [
  {
    hash: "0xabc123...",
    date: "2025-06-13",
    type: "Payment",
    amount: "-25.00 PEPU",
    to: "0xMerchant1",
    status: "Success"
  },
  {
    hash: "0xdef456...",
    date: "2025-06-12",
    type: "Top Up",
    amount: "+100.00 PEPU",
    to: "Card",
    status: "Success"
  },
  {
    hash: "0xghi789...",
    date: "2025-06-11",
    type: "Reward",
    amount: "+5.00 PEPU",
    to: "You",
    status: "Success"
  }
];

const demoActivities = [
  {
    icon: "💰",
    title: "Received Payment",
    time: "10 mins ago",
    amount: "+50.00 PEPU"
  },
  {
    icon: "🔄",
    title: "Swapped Tokens",
    time: "30 mins ago",
    amount: "-10.00 PEPU"
  },
  {
    icon: "📈",
    title: "Price Alert",
    time: "1 hour ago",
    amount: "+5.00 PEPU"
  },
  {
    icon: "🎉",
    title: "Milestone Reached",
    time: "2 hours ago",
    amount: "+100.00 PEPU"
  },
  {
    icon: "⚡",
    title: "Instant Transfer",
    time: "3 hours ago",
    amount: "-25.00 PEPU"
  },
  {
    icon: "🔔",
    title: "New Block Confirmed",
    time: "5 hours ago",
    amount: "0.00 PEPU"
  }
];

// Example transaction data
const transactions = [
  { icon: "🏪", title: "BURGER PALACE", time: "Just now", amount: -8.5 },
  { icon: "🏦", title: "BANK", time: "Today", amount: 125000 },
  { icon: "☕️", title: "COFFEE SHOP", time: "Yesterday", amount: -4.5 },
  { icon: "💸", title: "REQUEST FROM ALICE", time: "1 min ago", amount: 50 },
  { icon: "💳", title: "CARD LOAD", time: "Today", amount: 100 },
  { icon: "🍔", title: "FAST FOOD", time: "Yesterday", amount: -12 },
  { icon: "🎁", title: "GIFT RECEIVED", time: "3 days ago", amount: 20 },
];

export default function TxHistory({ signer }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('');
  const [copiedIdx, setCopiedIdx] = useState(null);
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  const perPage = 10;

  useEffect(() => {
    setHistory(demoTxs);
    setLoading(false);
  }, []);

  useEffect(() => {
    setPage(1);
  }, [filter]);

  useEffect(() => {
    async function fetchTxs() {
      if (!signer?.address) {
        setHistory(demoTxs); // <--- Use demo data if no signer
        return;
      }
      try {
        const res = await fetch(`/api/tx-history?address=${signer.address}`);
        if (!res.ok) throw new Error("No tx history endpoint");
        const data = await res.json();
        setHistory(data);
      } catch {
        setHistory(demoTxs); // <--- Use demo data on error
      }
    }
    fetchTxs();
  }, [signer]);

  const filteredHistory = history.filter(tx =>
    tx.type.includes(filter) ||
    tx.hash?.toLowerCase().includes(filter.toLowerCase()) ||
    String(tx.amount).includes(filter)
  );

  const pagedHistory = filteredHistory.slice((page-1)*perPage, page*perPage);

  if (loading) {
    return (
      <div
        style={{
          width: "100vw",
          height: "100vh",
          minHeight: "100vh",
          background: "#181c20",
          color: "#fff",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{
          display: "flex",
          alignItems: "center",
          padding: 18,
          gap: 12
        }}>
          <img
            src={homeIcon}
            alt="Home"
            aria-label="Go to Dashboard"
            style={{ width: 40, height: 40, cursor: "pointer" }}
            onClick={() => navigate("/")}
            title="Go to Dashboard"
          />
          <h2 style={{ margin: 0 }}>Transaction History</h2>
        </div>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {[1, 2, 3].map(i => (
            <li key={i} style={{ margin: '0.5em 0' }}>
              <div className="skeleton" style={{ height: 32, width: '100%' }} />
            </li>
          ))}
        </ul>
      </div>
    );
  }
  if (error) return <div className="tx-history error">{error}</div>;

  return (
    <div
      style={{
        width: "100vw",
        minHeight: "100vh",
        background: "linear-gradient(180deg, #2e8b57 0%, #f6f5ef 120%)",
        color: "#23272f",
        margin: 0,
        padding: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <div
        style={{
          background: "#174c31",
          borderRadius: 28,
          boxShadow: "0 4px 16px #0002",
          margin: "48px auto 0 auto",
          maxWidth: 420,
          width: "90vw",
          padding: "28px 18px 18px 18px",
        }}
      >
        <div
          style={{
            fontWeight: 900,
            fontSize: 28,
            marginBottom: 18,
            color: "#fff",
            textAlign: "center",
            letterSpacing: 1,
          }}
        >
          Transaction History
        </div>
        <div>
          {transactions.map((a, i) => (
            <div
              key={i}
              style={{
                background: "#181c20",
                borderRadius: 14,
                boxShadow: "0 2px 8px #0006",
                padding: "16px 18px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 16,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span
                  style={{
                    fontSize: 26,
                    background: "#23272f",
                    borderRadius: "50%",
                    width: 38,
                    height: 38,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {a.icon}
                </span>
                <div>
                  <div style={{ fontWeight: 600, color: "#fff" }}>{a.title}</div>
                  <div style={{ color: "#aaa", fontSize: 13 }}>{a.time}</div>
                </div>
              </div>
              <div
                style={{
                  fontWeight: 700,
                  color: a.amount > 0 ? "#00e676" : "#ff4d4f",
                  fontSize: 20,
                  minWidth: 80,
                  textAlign: "right",
                }}
              >
                {a.amount > 0 ? "+" : ""}
                ${Math.abs(a.amount).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}