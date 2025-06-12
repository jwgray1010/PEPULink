import React, { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { ethers } from "ethers";
import { toast } from "react-toastify";
import { v4 as uuidv4 } from "uuid";
import copyIcon from "../assets/copy.svg";
import homeIcon from "../assets/home.svg";
import { useNavigate } from "react-router-dom";

export default function MerchantQRGenerator({
  merchantId,
  merchantAddress,
  privateKey,
  pepuUsdRate,
  openPepuModal
}) {
  const [usdAmount, setUsdAmount] = useState("");
  const [amount, setAmount] = useState(""); // PEPU
  const [expiry, setExpiry] = useState(600); // seconds
  const [description, setDescription] = useState("");
  const [qrPayload, setQrPayload] = useState(null);
  const [copied, setCopied] = useState(false);
  const [liveRate, setLiveRate] = useState(pepuUsdRate || "");
  const [rateLoading, setRateLoading] = useState(false);
  const navigate = useNavigate();

  // Add 1% slippage buffer to PEPU amount
  const calcPepuWithBuffer = usd => {
    if (!liveRate || !usd) return "";
    const pepu = (parseFloat(usd) / parseFloat(liveRate)) * 1.01;
    return pepu.toFixed(4);
  };

  const handleUsdChange = e => {
    const usd = e.target.value;
    setUsdAmount(usd);
    setAmount(calcPepuWithBuffer(usd));
  };

  const handlePepuChange = e => {
    setAmount(e.target.value);
    setUsdAmount((parseFloat(e.target.value) * parseFloat(liveRate)).toFixed(2));
  };

  const handleGenerate = async () => {
    if (!amount || !merchantId || !merchantAddress || !privateKey) {
      toast.error("Missing required fields");
      return;
    }
    const payload = {
      merchantId,
      address: merchantAddress,
      amount: Number(amount),
      usdAmount: Number(usdAmount),
      expiry: Math.floor(Date.now() / 1000) + Number(expiry),
      description,
      txId: uuidv4(),
    };
    const message = JSON.stringify(payload);
    try {
      const wallet = new ethers.Wallet(privateKey);
      const signature = await wallet.signMessage(message);
      setQrPayload({ ...payload, signature });
      toast.success("QR code generated!");
    } catch (err) {
      toast.error("Failed to sign QR: " + (err.reason || err.message));
    }
  };

  // Demo Mode: Preloaded QR
  const demoQr = {
    merchantId: "DEMO123",
    address: "0xTestnetMerchant...",
    amount: 5,
    usdAmount: 0.06,
    expiry: Math.floor(Date.now() / 1000) + 3600,
    txId: "demo-txid-123",
    signature: "0xDEMO_SIGNATURE"
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(qrPayload, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  // Expiry warning
  const isExpired = qrPayload && qrPayload.expiry < Math.floor(Date.now() / 1000);

  // Fetch live PEPU/USD rate
  useEffect(() => {
    const fetchRate = async () => {
      setRateLoading(true);
      try {
        // Update the CoinGecko ID below if the new PEPU token uses a different one, e.g. "pepu-2"
        const res = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=pepu&vs_currencies=usd"
        );
        const data = await res.json();
        if (data.pepu && data.pepu.usd) setLiveRate(data.pepu.usd);
      } catch (e) {
        // fallback to prop or previous rate
      }
      setRateLoading(false);
    };
    fetchRate();
    const interval = setInterval(fetchRate, 60000); // update every minute
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="merchant-qr-generator">
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
        />
        <h2 style={{ margin: 0 }}>Merchant QR Generator</h2>
      </div>
      <div>
        <input
          type="number"
          placeholder="Amount (USD)"
          value={usdAmount}
          onChange={handleUsdChange}
          min={0.01}
          step={0.01}
          data-tooltip="Amount in USD"
          aria-label="Amount in USD"
        />
        <input
          type="number"
          placeholder="Amount (PEPU)"
          value={amount}
          onChange={handlePepuChange}
          min={0.0001}
          step={0.0001}
          data-tooltip="Amount in PEPU tokens"
          aria-label="Amount in PEPU"
        />
        {amount && (
          <span style={{ color: '#ffd700', marginLeft: 8 }}>
            (~${(parseFloat(amount) * parseFloat(liveRate)).toFixed(2)} USD, includes 1% buffer)
          </span>
        )}
        <button onClick={openPepuModal} className="wallet-btn" style={{ marginLeft: 8, fontSize: '0.9em' }}>
          What is PEPU?
        </button>
        <input
          type="number"
          placeholder="Expiry (seconds)"
          value={expiry}
          onChange={e => setExpiry(e.target.value)}
          min={60}
          aria-label="Expiry in seconds"
        />
        <input
          type="text"
          placeholder="Description (optional)"
          value={description}
          onChange={e => setDescription(e.target.value)}
          aria-label="Description"
        />
        <button className="wallet-btn" onClick={handleGenerate}>
          Generate QR
        </button>
      </div>
      {qrPayload && (
        <div style={{ marginTop: 16 }}>
          <QRCodeSVG
            value={JSON.stringify(qrPayload)}
            size={200}
            aria-label="Merchant payment QR code"
          />
          <div style={{ display: "flex", alignItems: "center", marginTop: 8 }}>
            <pre style={{ textAlign: "left", fontSize: "0.85em", margin: 0 }}>
              {JSON.stringify(qrPayload, null, 2)}
            </pre>
            <img
              src={copyIcon}
              alt={copied ? "Copied!" : "Copy to clipboard"}
              title={copied ? "Copied!" : "Copy to clipboard"}
              onClick={handleCopy}
              style={{
                width: 28,
                height: 28,
                cursor: "pointer",
                marginLeft: 8,
                verticalAlign: "middle",
                filter: copied ? "grayscale(1) opacity(0.5)" : "none",
                transition: "filter 0.2s"
              }}
            />
          </div>
          <button
            className="wallet-btn"
            onClick={() => {
              const svg = document.querySelector('.merchant-qr-generator svg');
              const serializer = new XMLSerializer();
              const source = serializer.serializeToString(svg);
              const blob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "merchant-qr.svg";
              a.click();
              URL.revokeObjectURL(url);
            }}
          >
            Download QR
          </button>
          {isExpired && (
            <div style={{ color: "#ff4d4f", marginTop: 8, fontWeight: 600 }}>
              Warning: This QR code is expired!
            </div>
          )}
        </div>
      )}
      <div style={{ marginBottom: 8 }}>
        <b>Live PEPU/USD rate:</b>{" "}
        {rateLoading ? "Loading..." : liveRate ? `$${liveRate}` : "Unavailable"}
      </div>
      <hr style={{ margin: "2em 0" }} />
      <h3>Demo Mode</h3>
      <QRCodeSVG value={JSON.stringify(demoQr)} size={200} aria-label="Demo QR code" />
      <pre style={{ textAlign: "left", fontSize: "0.85em", marginTop: 8 }}>
        {JSON.stringify(demoQr, null, 2)}
      </pre>
      <div style={{ background: "#ffd70022", padding: 8, borderRadius: 6, marginTop: 12 }}>
        <b>Early Adopter Rewards:</b> Merchants using PEPU now get bonus rewards and marketing support!
      </div>
    </div>
  );
}