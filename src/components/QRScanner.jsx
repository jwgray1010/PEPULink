import React, { useState } from 'react';
import QrReader from 'react-qr-reader';
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
        minHeight: "100vh",
        width: "100vw",
        background: "#181c20",
        color: "#fff",
        fontFamily: "inherit",
        margin: 0,
        padding: 0,
      }}
    >
      {/* Logo as Home button */}
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
          role="button"
          tabIndex={0}
          onKeyDown={e => {
            if (e.key === "Enter" || e.key === " ") navigate("/");
          }}
        />
        <h2 style={{ margin: 0 }}>Scan QR Code</h2>
      </div>
      {!scanResult && (
        <QrReader
          onResult={(result, error) => {
            if (!!result) handleScan(result?.text);
          }}
          constraints={{ facingMode: 'environment' }}
          style={{ width: '100%' }}
        />
      )}
      {scanResult && (
        <div style={{ margin: '1em 0' }}>
          <p>
            Scanned:{' '}
            <span
              style={{
                background: '#23272f',
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
        <p>
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