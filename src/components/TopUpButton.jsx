import React, { useState, useRef, useEffect } from 'react';

export default function TopUpButton({ onSuccess, pepuUsdRate = 0.0123, openPepuModal }) {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [amount, setAmount] = useState('');
  const progressRef = useRef();

  // Simulate progress bar animation
  useEffect(() => {
    if (loading) {
      setProgress(0);
      progressRef.current = setInterval(() => {
        setProgress(prev => (prev < 90 ? prev + Math.random() * 10 : prev));
      }, 200);
    } else {
      setProgress(100);
      setTimeout(() => setProgress(0), 500);
      clearInterval(progressRef.current);
    }
    return () => clearInterval(progressRef.current);
  }, [loading]);

  const handleTopUp = async () => {
    setLoading(true);
    setStatus('');
    try {
      const res = await fetch('/api/topup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: amount || undefined }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setStatus('success');
        if (onSuccess) onSuccess();
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
    setLoading(false);
    setTimeout(() => setStatus(''), 2000);
  };

  const handleConfirm = (e) => {
    e.preventDefault();
    setShowConfirm(false);
    handleTopUp();
  };

  return (
    <div>
      <form
        onSubmit={e => {
          e.preventDefault();
          setShowConfirm(true);
        }}
        style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}
      >
        <label>
          Amount (PEPU)
          <input
            type="number"
            min="1"
            step="1"
            placeholder="Amount"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            style={{ width: 90 }}
            aria-label="Top up amount"
            disabled={loading}
            data-tooltip="Enter the amount in PEPU tokens"
          />
          <span style={{ color: '#ffd700', marginLeft: 8 }}>
            (~${(amount && pepuUsdRate ? (amount * pepuUsdRate).toFixed(2) : "0.00")} USD)
          </span>
        </label>
        <button
          type="submit"
          disabled={loading}
          className={`topup-btn${loading ? ' button-loading' : ''}`}
          aria-busy={loading}
          aria-live="polite"
        >
          {loading ? (
            <span>
              <span className="spinner" aria-hidden="true" /> Topping Up...
            </span>
          ) : (
            'Top Up Card'
          )}
        </button>
        <button onClick={openPepuModal} className="wallet-btn" style={{ marginLeft: 8, fontSize: '0.9em' }}>
          What is PEPU?
        </button>
      </form>
      {loading && (
        <div className="topup-progress-bar-container" aria-hidden="true">
          <div
            className="topup-progress-bar"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
      {showConfirm && (
        <div className="modal-overlay" tabIndex={-1} aria-modal="true" role="dialog">
          <div className="modal">
            <p>
              Confirm top-up of <b>{amount || 'default'}</b> units?
            </p>
            <button onClick={handleConfirm} className="topup-btn" autoFocus>
              Confirm
            </button>
            <button onClick={() => setShowConfirm(false)} style={{ marginLeft: 8 }}>
              Cancel
            </button>
          </div>
        </div>
      )}
      {status === 'success' && (
        <span className="topup-feedback success" aria-live="polite">✅ Success!</span>
      )}
      {status === 'error' && (
        <span className="topup-feedback error" aria-live="polite">❌ Error</span>
      )}
    </div>
  );
}