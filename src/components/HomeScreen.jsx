import React, { useState, useEffect } from "react";
import { ethers, Wallet } from "ethers";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import qrIcon from "../assets/qr.svg";
import requestIcon from "../assets/request.svg";
import loadIcon from "../assets/load.svg";
import payIcon from "../assets/money.svg";

const demoAddress = "0x1234..abcd";
const demoCard = {
  number: "Card 1234",
  balance: 125.0,
};
const demoActivities = [
  {
    icon: "🏪",
    title: "BURGER PALACE",
    time: "Just now",
    amount: "- $8.50",
    color: "#ff4d4f",
  },
  {
    icon: "🏦",
    title: "BANK",
    time: "Just now",
    amount: "+ 125000",
    color: "#00e676",
  },
  {
    icon: "☕️",
    title: "COFFEE SHOP",
    time: "Today",
    amount: "- $4.50",
    color: "#ff4d4f",
  },
  {
    icon: "🛒",
    title: "GROCERY",
    time: "Yesterday",
    amount: "- $32.10",
    color: "#ff4d4f",
  },
  {
    icon: "💸",
    title: "REQUEST FROM ALICE",
    time: "1 min ago",
    amount: "+ $50.00",
    color: "#00e676",
  },
  {
    icon: "💳",
    title: "CARD LOAD",
    time: "Today",
    amount: "+ $100.00",
    color: "#00e676",
  },
  {
    icon: "🍔",
    title: "FAST FOOD",
    time: "Yesterday",
    amount: "- $12.00",
    color: "#ff4d4f",
  },
  {
    icon: "🏥",
    title: "INSURANCE",
    time: "2 days ago",
    amount: "- $75.00",
    color: "#ff4d4f",
  },
  {
    icon: "🎁",
    title: "GIFT RECEIVED",
    time: "3 days ago",
    amount: "+ $20.00",
    color: "#00e676",
  },
];
const keypad = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
  [".", "0", "<"]
];

function HomeScreen({ openModal, signer, onScan, onRequest, onPay, onLoad, ...props }) {
  const {
    walletAddress = "0x1234...abcd",
    merchantAddress
  } = props;

  const [amount, setAmount] = useState("0");
  const [balance, setBalance] = useState(0);
  const [paying, setPaying] = useState(false);
  const [payStatus, setPayStatus] = useState("");
  const [showReceipt, setShowReceipt] = useState(null);
  const [guestWallet, setGuestWallet] = useState(null);
  const [showPepuModal, setShowPepuModal] = useState(false);
  const [keypadMode, setKeypadMode] = useState(null); // "pay" | "request" | "load" | null
  const [inputValue, setInputValue] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchBalance() {
      if (!signer) {
        setBalance(0);
        return;
      }
      try {
        const address = await signer.getAddress();
        setBalance(1234.56); // Demo
      } catch {
        setBalance(0);
      }
    }
    fetchBalance();
  }, [signer]);

  const handleKey = (val) => {
    let next = amount;
    if (val === "." && amount.includes(".")) return;
    if (val === "<") {
      next = amount.length > 1 ? amount.slice(0, -1) : "0";
    } else {
      next = amount === "0" && val !== "." ? val : amount + val;
    }
    if (next.startsWith("0") && !next.startsWith("0.")) next = next.replace(/^0+/, "");
    setAmount(next);
  };

  const handlePay = async () => {
    if (!signer || !merchantAddress || Number(amount) <= 0) return;
    setPaying(true);
    setPayStatus("Processing payment...");
    try {
      const CARD_CONTRACT_ADDRESS = process.env.REACT_APP_CARD_CONTRACT_ADDRESS;
      const PEPUCardABI = (await import("../abi/PEPUCard.json")).default;
      const PEPU_DECIMALS = 18;

      const contract = new ethers.Contract(CARD_CONTRACT_ADDRESS, PEPUCardABI, signer);
      const tx = await contract.spend(
        merchantAddress,
        ethers.parseUnits(amount, PEPU_DECIMALS),
        ""
      );
      await tx.wait();
      setPayStatus("Payment successful!");
      setShowReceipt({
        amount: amount,
        pepu: (amount / 1).toFixed(2), // adjust as needed
        meme: "/memes/pepe-dance.gif",
        txHash: tx.hash
      });
    } catch (err) {
      setPayStatus("Payment failed: " + (err.reason || err.message));
    }
    setPaying(false);
  };

  const createGuestWallet = () => {
    const tempWallet = Wallet.createRandom();
    setGuestWallet(tempWallet);
  };

  function handleKeypadClick(key) {
    if (key === "<") {
      setInputValue((v) => v.slice(0, -1));
    } else if (key === ".") {
      if (!inputValue.includes(".")) setInputValue((v) => v + ".");
    } else {
      setInputValue((v) => (v === "0" ? key : v + key));
    }
  }

  function closeKeypad() {
    setKeypadMode(null);
    setInputValue("");
  }

  const isPayMode = keypadMode === "pay";
  const isRequestMode = keypadMode === "request";
  const isLoadMode = keypadMode === "load";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #2e8b57 0%, #f6f5ef 120%)",
        fontFamily: "system-ui, sans-serif",
        color: "#23272f",
        margin: 0,
        padding: 0,
        overflowY: "auto", // allow scrolling
      }}
    >
      {/* Half-circle dark green header */}
      <div
        style={{
          width: "100vw",
          height: 220,
          background: "#174c31",
          borderBottomLeftRadius: "100vw",
          borderBottomRightRadius: "100vw",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
        }}
      >
        <div
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            marginTop: 40,
            marginBottom: 0,
          }}
        >
          {/* Logo to the left */}
          <img
            src={logo}
            alt="PEPU Logo"
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              marginRight: 18,
              boxShadow: "0 2px 8px #0003",
              position: "relative",
              left: 0,
            }}
          />
          {/* Centered, bigger Title */}
          <span
            style={{
              fontWeight: 900,
              fontSize: 56,
              color: "#fff",
              letterSpacing: 1,
              textAlign: "center",
              flex: "0 1 auto",
              lineHeight: 1.1,
            }}
          >
            PEPULink
          </span>
        </div>
      </div>

      {/* Slightly smaller Card, still overlapping the half-circle */}
      <div
        style={{
          background: "#fff",
          borderRadius: 22,
          boxShadow: "0 8px 32px #0002",
          margin: "0 auto",
          marginTop: -80,
          padding: "12px 12px",
          maxWidth: 340,
          width: "90vw",
          position: "relative",
          zIndex: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
        }}
      >
        <div style={{ color: "#888", fontWeight: 700, fontSize: 18, marginBottom: 10 }}>
          {demoAddress}
        </div>
        <div
          style={{
            background: "#2e8b57",
            borderRadius: 20,
            padding: "40px 14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: 16, marginBottom: 6 }}>
              {demoCard.number}
            </div>
            <div style={{ color: "#fff", fontWeight: 900, fontSize: 24 }}>
              ${demoCard.balance.toFixed(2)}
            </div>
          </div>
          <img
            src={logo}
            alt="Coin"
            style={{ width: 70, height: 70, borderRadius: "50%" }}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 32,
          margin: "40px auto 0 auto",
          maxWidth: 600,
        }}
      >
        <ActionButton icon={qrIcon} label="Scan" onClick={() => navigate("/qr")} />
        <ActionButton icon={requestIcon} label="Request" onClick={() => setKeypadMode("request")} />
        <ActionButton icon={loadIcon} label="Load Card" onClick={() => setKeypadMode("load")} />
        <ActionButton icon={payIcon} label="Pay" onClick={() => setKeypadMode("pay")} />
      </div>

      {/* Dropdown Keypad */}
      {keypadMode && (
        <div
          style={{
            background: "#fff",
            borderRadius: 18,
            boxShadow: "0 2px 12px #0002",
            margin: "18px auto 0 auto",
            padding: "18px 12px 12px 12px",
            maxWidth: 340,
            width: "90vw",
            textAlign: "center",
            zIndex: 3,
            transition: "all 0.2s",
          }}
        >
          <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 10 }}>
            {isPayMode && "Enter Amount to Pay"}
            {isRequestMode && "Enter Amount to Request"}
            {isLoadMode && "Enter Amount to Load"}
          </div>
          <div
            style={{
              fontSize: 32,
              fontWeight: 700,
              marginBottom: 12,
              border: "1px solid #2e8b57",
              borderRadius: 8,
              padding: "8px 0",
              background: "#f6f5ef",
              letterSpacing: 2,
            }}
          >
            {inputValue || "0"}
          </div>
          <div>
            {keypad.map((row, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "center", marginBottom: 6 }}>
                {row.map((key) => (
                  <button
                    key={key}
                    onClick={() => handleKeypadClick(key)}
                    style={{
                      width: 56,
                      height: 56,
                      margin: "0 6px",
                      borderRadius: "50%",
                      border: "none",
                      background: "#2e8b57",
                      color: "#fff",
                      fontSize: 24,
                      fontWeight: 700,
                      cursor: "pointer",
                      boxShadow: "0 1px 4px #0001",
                      outline: "none",
                      transition: "background 0.15s",
                    }}
                  >
                    {key === "<" ? "⌫" : key}
                  </button>
                ))}
              </div>
            ))}
          </div>
          <button
            onClick={closeKeypad}
            style={{
              marginTop: 10,
              padding: "8px 18px",
              borderRadius: 8,
              background: "#2e8b57",
              color: "#fff",
              border: "none",
              fontWeight: 600,
              fontSize: 16,
              cursor: "pointer",
            }}
          >
            Close
          </button>
        </div>
      )}

      {/* Recent Activity */}
      <div
        style={{
          background: "#174c31",
          borderRadius: 28,
          boxShadow: "0 4px 16px #0002",
          margin: "40px auto 0 auto",
          maxWidth: 400,
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
          Recent Activity
        </div>
        <div>
          {demoActivities.map((a, i) => (
            <div
              key={i}
              style={{
                background: "#fff",
                borderRadius: 14,
                boxShadow: "0 2px 8px #0001",
                padding: "14px 16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 12,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span
                  style={{
                    fontSize: 26,
                    background: "#f6f5ef",
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
                  <div style={{ fontWeight: 600 }}>{a.title}</div>
                  <div style={{ color: "#888", fontSize: 13 }}>{a.time}</div>
                </div>
              </div>
              <div
                style={{
                  fontWeight: 700,
                  color: a.color,
                  fontSize: 18,
                  minWidth: 70,
                  textAlign: "right",
                }}
              >
                {a.amount}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ActionButton({ icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: "#174c31",
        color: "#fff",
        border: "none",
        borderRadius: "50%",
        width: 120,
        height: 120,
        aspectRatio: "1 / 1",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 48,
        boxShadow: "0 2px 8px #0002",
        cursor: "pointer",
        margin: 0,
        padding: 0,
        outline: "none",
        overflow: "hidden",
        flexShrink: 0,
        flexGrow: 0,
      }}
      aria-label={label}
    >
      <img src={icon} alt={label} style={{ width: 48, height: 48, marginBottom: 4 }} />
      <div style={{
        fontSize: 16,
        fontWeight: 500,
        marginTop: 8,
        color: "#fff",
        lineHeight: 1.15,
        textAlign: "center",
        whiteSpace: "normal",
        maxWidth: "90%",
        padding: "0 4px",
        wordBreak: "break-word"
      }}>{label}</div>
    </button>
  );
}

export default HomeScreen;
