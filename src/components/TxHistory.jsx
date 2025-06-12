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
    setLoading(true);
    fetch('/api/history')
      .then(res => res.json())
      .then(data => {
        setHistory(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load transaction history');
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    setPage(1);
  }, [filter]);

  useEffect(() => {
    async function fetchTxs() {
      if (!signer?.address) return;
      try {
        const res = await fetch(`/api/tx-history?address=${signer.address}`);
        if (!res.ok) throw new Error("No tx history endpoint");
        const data = await res.json();
        setHistory(data);
      } catch {
        // Fallback: set empty or mock data
        setHistory([]);
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
      <div className="tx-history loading">
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
    <div className="tx-history">
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
      <input
        type="text"
        placeholder="Filter by type, hash, or amount"
        value={filter}
        onChange={e => setFilter(e.target.value)}
        style={{ marginBottom: 12, width: '100%', padding: '0.5em', borderRadius: 6, border: '1px solid #2e8b57' }}
      />
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {pagedHistory.length === 0 && <li>No transactions yet.</li>}
        {pagedHistory.map((tx, i) => (
          <li
            key={tx.hash || i}
            className="history-item"
            tabIndex={0}
            aria-label={`Transaction on ${tx.date}: ${tx.type} ${tx.amount}`}
            style={{
              margin: '0.5em 0',
              padding: '0.75em 1em',
              borderRadius: '8px',
              background: tx.type === 'topup' ? '#2e8b57' : '#23272f',
              color: '#fff',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              transition: 'background 0.2s'
            }}
          >
            <span>
              {timeAgo(tx.date)}:{' '}
              <b style={{ textTransform: 'capitalize' }}>{tx.type}</b>{' '}
              <span style={{
                color: tx.amount > 0 ? '#b6ffb6' : '#ffb6b6',
                fontWeight: 600,
                marginRight: 8
              }}>
                {tx.amount > 0 ? '⬇️' : '⬆️'}
                {tx.amount > 0 ? '+' : ''}
                {tx.amount}
              </span>
            </span>
            {tx.hash && (
              <span
                title="Copy transaction hash"
                style={{ cursor: 'pointer', color: '#ffd700', marginLeft: 12, fontSize: '0.95em', position: 'relative' }}
                tabIndex={0}
                onClick={() => {
                  navigator.clipboard.writeText(tx.hash);
                  setCopiedIdx(i);
                  setTimeout(() => setCopiedIdx(null), 1200);
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    navigator.clipboard.writeText(tx.hash);
                    setCopiedIdx(i);
                    setTimeout(() => setCopiedIdx(null), 1200);
                  }
                }}
                aria-label="Copy transaction hash"
              >
                <a
                  href={`https://etherscan.io/tx/${tx.hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#ffd700', textDecoration: 'underline' }}
                  tabIndex={-1}
                >
                  View
                </a>
                <span style={{ marginLeft: 4, fontSize: '1.1em' }}>📋</span>
                {copiedIdx === i && (
                  <span style={{
                    position: 'absolute',
                    top: -24,
                    left: 0,
                    background: '#23272f',
                    color: '#ffd700',
                    padding: '2px 8px',
                    borderRadius: 6,
                    fontSize: '0.9em'
                  }}>Copied!</span>
                )}
              </span>
            )}
            {tx.status && (
              <span style={{
                marginLeft: 8,
                color: tx.status === 'confirmed' ? '#b6ffb6' : '#ffd700',
                fontWeight: 500
              }}>
                {tx.status}
              </span>
            )}
          </li>
        ))}
      </ul>
      <div style={{ textAlign: 'center', marginTop: 12 }}>
        <button disabled={page === 1} onClick={() => setPage(p => p-1)}>Prev</button>
        <span style={{ margin: '0 1em' }}>Page {page}</span>
        <button disabled={page*perPage >= filteredHistory.length} onClick={() => setPage(p => p+1)}>Next</button>
      </div>
    </div>
  );
}