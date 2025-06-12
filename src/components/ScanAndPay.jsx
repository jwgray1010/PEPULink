import React, { useState, useRef } from "react";
import { ethers } from "ethers";
import { QrReader } from "react-qr-reader";
import PEPUCardABI from "../abi/PEPUCard.json";
import { useNavigate } from "react-router-dom";
import homeIcon from "../assets/home.svg";

const CARD_CONTRACT_ADDRESS = process.env.REACT_APP_CARD_CONTRACT_ADDRESS;
const PEPU_DECIMALS = 18;
const AUTO_PRELOAD_AMOUNT = "100"; // PEPU tokens to preload if needed

export default function ScanAndPay({ signer }) {
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [showScanner, setShowScanner] = useState(true);
  const [scanData, setScanData] = useState(null);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const payBtnRef = useRef();
  const navigate = useNavigate();

  // Haptic feedback (mobile)
  const vibrate = (pattern = [80]) => {
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(pattern);
    }
  };

  // QR payload format: JSON string with {merchant, amount, reference}
  const handleScan = async (result) => {
    if (!result?.text) return;
    setShowScanner(false);
    setStatus("Processing QR...");
    setError("");
    try {
      const { merchant, amount, reference } = JSON.parse(result.text);
      if (!ethers.isAddress(merchant) || !amount) throw new Error();
      setScanData({ merchant, amount, reference });
      setStatus("");
      setTimeout(() => {
        payBtnRef.current && payBtnRef.current.focus();
      }, 100);
    } catch (err) {
      vibrate([120, 60, 120]);
      setStatus("");
      setError("❌ Invalid QR code. Please try again.");
      setTimeout(() => {
        setShowScanner(true);
        setError("");
      }, 2000);
    }
  };

  const handleSeamlessPay = async () => {
    setLoading(true);
    setStatus("Checking card balance...");
    setSuccess(false);
    setError("");
    try {
      const contract = new ethers.Contract(CARD_CONTRACT_ADDRESS, PEPUCardABI, signer);
      const address = await signer.getAddress();
      let bal = await contract.cardBalances(address);
      bal = Number(ethers.formatUnits(bal, PEPU_DECIMALS));
      // If not enough, preload automatically
      if (bal < Number(scanData.amount)) {
        setStatus("Preloading card...");
        const tx1 = await contract.preload(ethers.parseUnits(AUTO_PRELOAD_AMOUNT, PEPU_DECIMALS));
        await tx1.wait();
      }
      setStatus("Paying merchant...");
      const tx2 = await contract.spend(
        scanData.merchant,
        ethers.parseUnits(scanData.amount.toString(), PEPU_DECIMALS),
        scanData.reference || ""
      );
      await tx2.wait();
      setStatus("Payment complete!");
      setSuccess(true);
      vibrate([120, 60, 120, 60, 240]);
      setTimeout(() => {
        setScanData(null);
        setShowScanner(true);
        setStatus("");
        setSuccess(false);
      }, 2500);
    } catch (err) {
      vibrate([180, 80, 180]);
      setStatus("");
      setError("Payment failed: " + (err.reason || err.message));
      setTimeout(() => {
        setScanData(null);
        setShowScanner(true);
        setError("");
      }, 3500);
    }
    setLoading(false);
  };

  return (
    <div
      style={{
        maxWidth: 420,
        margin: "0 auto",
        padding: 24,
        borderRadius: 16,
        background: "#fff",
        boxShadow: "0 2px 16px #0001",
        minHeight: 520,
        position: "relative"
      }}
      aria-live="polite"
    >
      {/* Logo as Home button */}
      <div style={{
        display: "flex",
        alignItems: "center",
        paddingBottom: 12,
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
        <h2 style={{ margin: 0 }}>Scan & Pay</h2>
      </div>
      {showScanner && (
        <div style={{ margin: "0 auto", maxWidth: 320 }}>
          <QrReader
            onResult={handleScan}
            constraints={{ facingMode: "environment" }}
            style={{ width: "100%" }}
            scanDelay={300}
          />
          <div style={{ textAlign: "center", marginTop: 12, color: "#888" }}>
            Scan merchant QR code to pay instantly
          </div>
        </div>
      )}
      {scanData && !loading && (
        <div
          style={{
            marginTop: 24,
            padding: 16,
            borderRadius: 12,
            background: "#f6f6fa",
            boxShadow: "0 1px 4px #0001"
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: 8 }}>Confirm Payment</div>
          <div>
            Merchant:{" "}
            <span style={{ color: "#888", wordBreak: "break-all" }}>
              {scanData.merchant}
            </span>
          </div>
          <div>
            Amount: <b>{scanData.amount} PEPU</b>
          </div>
          {scanData.reference && (
            <div>
              Memo: <span style={{ color: "#888" }}>{scanData.reference}</span>
            </div>
          )}
          <button
            ref={payBtnRef}
            style={{
              marginTop: 16,
              width: "100%",
              padding: "12px 0",
              background: "#2e8b57",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontWeight: 700,
              fontSize: "1.1em",
              outline: "none"
            }}
            onClick={handleSeamlessPay}
            disabled={loading}
            aria-label="Confirm and pay"
          >
            {loading ? "Processing..." : "Pay Now"}
          </button>
          <button
            style={{
              marginTop: 8,
              width: "100%",
              background: "#eee",
              color: "#333",
              border: "none",
              borderRadius: 8,
              fontWeight: 500
            }}
            onClick={() => {
              setScanData(null);
              setShowScanner(true);
              setStatus("");
              setError("");
            }}
            disabled={loading}
            aria-label="Cancel payment"
          >
            Cancel
          </button>
        </div>
      )}
      {(status || error) && (
        <div
          style={{
            marginTop: 24,
            textAlign: "center",
            color: error
              ? "#ff4d4f"
              : status.startsWith("Payment complete")
              ? "#2e8b57"
              : "#333",
            fontWeight: 600,
            fontSize: "1.1em"
          }}
          role="status"
        >
          {status || error}
        </div>
      )}
      {success && (
        <div
          style={{
            marginTop: 24,
            textAlign: "center",
            fontSize: "2.5em",
            color: "#2e8b57",
            animation: "pop 0.5s"
          }}
          aria-label="Payment successful"
        >
          ✅
        </div>
      )}
      {loading && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "#fff8",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 16,
            zIndex: 10
          }}
          aria-busy="true"
        >
          <div className="loader" aria-label="Processing payment" />
        </div>
      )}
      <button
        onClick={() => navigate("/")}
        style={{
          margin: "24px auto 0 auto",
          display: "block",
          background: "#23272b",
          color: "#ffd700",
          border: "none",
          borderRadius: 8,
          padding: "10px 24px",
          fontWeight: 600,
          fontSize: "1em",
          cursor: "pointer"
        }}
      >
        ← Back to Dashboard
      </button>
      <style>
        {`
          @keyframes pop {
            0% { transform: scale(0.7); opacity: 0.5; }
            70% { transform: scale(1.2); opacity: 1; }
            100% { transform: scale(1); opacity: 1; }
          }
          .loader {
            border: 4px solid #eee;
            border-top: 4px solid #2e8b57;
            border-radius: 50%;
            width: 36px;
            height: 36px;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            0% { transform: rotate(0deg);}
            100% { transform: rotate(360deg);}
          }
        `}
      </style>
    </div>
  );
}