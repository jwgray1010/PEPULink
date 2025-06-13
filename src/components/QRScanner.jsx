import React, { useState } from 'react';
import QrScanner from 'react-qr-scanner';
import { ethers } from "ethers";
import allowlist from "../allowlist.json";
import { toast } from 'react-toastify';
import homeIcon from "../assets/home.svg";
import { useNavigate } from "react-router-dom";

function QRScanner(props) {
  const { signer, pepuUsdRate = 1, openPepuModal } = props;
  const [scanResult, setScanResult] = useState(null);
  const [txStatus, setTxStatus] = useState(null);
  const [txHash, setTxHash] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pendingTx, setPendingTx] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // --- Mitigation Step 1: Secure QR Verification ---
  const verifyQrPayload = async (qrPayload) => {
    const { merchantId, address, amount, expiry, signature } = qrPayload;
    if (Date.now() / 1000 > expiry) throw new Error("QR code expired.");
    const merchant = allowlist.find(m => m.id === merchantId && m.address.toLowerCase() === address.toLowerCase());
    if (!merchant) throw new Error("Unknown or unverified merchant.");
    const message = JSON.stringify({ merchantId, address, amount, expiry });
    const recovered = ethers.verifyMessage(message, signature);
    if (recovered.toLowerCase() !== address.toLowerCase()) throw new Error("Invalid QR signature.");
    return true;
  };

  const handleScan = async (data) => {
    try {
      let qrPayload;
      try {
        qrPayload = JSON.parse(data);
      } catch {
        throw new Error("Invalid QR code format.");
      }
      await verifyQrPayload(qrPayload);
      setPendingTx(qrPayload);
      setScanResult(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const sendTx = async () => {
    if (!pendingTx) return;
    const { address, amount } = pendingTx;
    try {
      setLoading(true);
      setTxStatus('pending');
      const tx = await signer.sendTransaction({
        to: address,
        value: ethers.parseUnits(amount.toString(), 18),
      });
      setTxHash(tx.hash);
      await tx.wait();
      setTxStatus('confirmed');
      toast.success('Transaction confirmed!');
      setPendingTx(null);
    } catch (err) {
      setTxStatus('failed');
      toast.error('Transaction failed: ' + (err.reason || err.message));
    }
    setLoading(false);
  };

  const handleRescan = () => {
    setScanResult(null);
    setTxStatus(null);
    setTxHash(null);
    setPendingTx(null);
    setLoading(false);
    setError("");
  };

  return (
    <div
      className="qr-scanner"
      style={{
        width: "100vw",
        height: "100vh",
        color: "#23272f",
        margin: 0,
        padding: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        background: "none", // or remove this line entirely
      }}
    >
      {/* Header */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "99vw",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          paddingTop: 32,
          paddingBottom: 20,
          zIndex: 2,
          background: "rgba(24,28,32,0.85)",
          boxSizing: "border-box",
        }}
      >
        <h2 style={{ margin: 0, fontSize: "2.5em", color: "#fff", textAlign: "center", width: "100%" }}>
          Scan QR Code
        </h2>
      </div>
      {/* Scanner */}
      <div
        style={{
          flex: 1,
          width: "100vw",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        {!scanResult && (
          <div
            style={{
              width: 340,
              height: 340,
              background: "#23272f",
              borderRadius: 18,
              boxShadow: "0 2px 16px #0008",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            <QrScanner
              delay={300}
              onError={(err) => setError(err.message)}
              onScan={(result) => result && handleScan(result?.text)}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
        )}
        {/* Scan result and actions */}
        {scanResult && (
          <div style={{
            margin: '1em 0',
            width: "90vw",
            maxWidth: 420,
            background: "#23272f",
            borderRadius: 16,
            padding: 24,
            boxShadow: "0 2px 16px #0001",
            zIndex: 2
          }}>
            <p>
              Scanned:{' '}
              <span
                style={{
                  background: '#181c20',
                  padding: '0.2em 0.5em',
                  borderRadius: 6,
                  userSelect: 'all',
                  cursor: 'pointer',
                }}
                title="Copy"
                onClick={() => {
                  navigator.clipboard.writeText(scanResult);
                  toast.success("QR payload copied!");
                }}
                tabIndex={0}
                aria-label="Copy scanned result"
              >
                {scanResult}
              </span>
            </p>
            <button onClick={handleRescan} style={{ marginTop: 8 }}>
              Rescan
            </button>
          </div>
        )}
      </div>
      {/* Transaction status and modals */}
      {txStatus && (
        <p
          style={{
            color:
              txStatus === 'pending'
                ? '#ffd700'
                : txStatus === 'confirmed'
                ? '#b6ffb6'
                : '#ff4d4f',
            fontWeight: 600,
            fontSize: "1.1em",
            textAlign: "center"
          }}
        >
          Transaction Status: {txStatus}
          {txStatus === 'failed' && (
            <button onClick={sendTx} style={{ marginLeft: 12 }}>
              Retry
            </button>
          )}
        </p>
      )}
      {txHash && (
        <p style={{ textAlign: "center" }}>
          Tx Hash:{' '}
          <a
            href={`https://etherscan.io/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#ffd700' }}
          >
            {txHash}
          </a>
        </p>
      )}
      {loading && <div className="skeleton" style={{ height: 24, marginTop: 8 }} />}
      {error && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Warning</h2>
            <p>{error}</p>
            <button onClick={handleRescan}>Close</button>
          </div>
        </div>
      )}
      {pendingTx && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Confirm Payment</h2>
            <p>
              Pay <b data-tooltip="Amount in PEPU">{pendingTx.amount} PEPU</b>
              <span style={{ color: '#ffd700', marginLeft: 8 }}>
                (~${(pendingTx.amount * pepuUsdRate).toFixed(2)} USD)
              </span>
              {openPepuModal && (
                <button onClick={openPepuModal} className="wallet-btn" style={{ marginLeft: 8, fontSize: '0.9em' }}>
                  What is PEPU?
                </button>
              )}
            </p>
            <button onClick={sendTx} disabled={loading}>Confirm</button>
            <button onClick={handleRescan} style={{ marginLeft: 8 }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default QRScanner;