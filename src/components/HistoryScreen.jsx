import React, { useEffect, useState } from 'react';

export default function HistoryScreen() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch('/api/history')
      .then(res => res.json())
      .then(data => {
        setHistory(data);
        setLoading(false);
      })
      .catch((err) => {
        setError('Failed to load transaction history');
        setLoading(false);
        console.error(err);
      });
  }, []);

  if (loading) return <div className="history-screen loading">Loading history...</div>;
  if (error) return <div className="history-screen error">{error}</div>;

  return (
    <div
      className="history-screen"
      style={{
        minHeight: "100vh",
        width: "100%",
        background: "#181c20",
        color: "#fff",
        margin: 0,
        padding: 0,
        fontFamily: "inherit"
      }}
    >
      <div style={{
        padding: "24px 0 18px 0",
        textAlign: "center"
      }}>
        <h2 style={{ margin: 0 }}>Transaction History</h2>
      </div>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {history.length === 0 && <li>No transactions yet.</li>}
        {history.map((tx, i) => (
          <li
            key={i}
            className="history-item"
            style={{
              margin: '0.5em 0',
              padding: '0.75em 1em',
              borderRadius: '0px',
              background: tx.type === 'topup' ? '#2e8b57' : '#23272f',
              color: '#fff',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              transition: 'background 0.2s'
            }}
            tabIndex={0}
            aria-label={`Transaction on ${tx.date}: ${tx.type} ${tx.amount}`}
          >
            <span>
              {new Date(tx.date).toLocaleDateString()}:{' '}
              <b style={{ textTransform: 'capitalize' }}>{tx.type}</b>{' '}
              <span
                style={{
                  color: tx.amount > 0 ? '#b6ffb6' : '#ffb6b6',
                  fontWeight: 600
                }}
              >
                {tx.amount > 0 ? '+' : ''}
                ${Math.abs(tx.amount)}
              </span>
            </span>
            {tx.hash && (
              <a
                href={`https://etherscan.io/tx/${tx.hash}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#ffd700', marginLeft: 12, fontSize: '0.95em' }}
              >
                View
              </a>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}