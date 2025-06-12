import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import toast from "react-hot-toast";
import PEPUCardABI from "../abi/PEPUCard.json";
import homeIcon from "../assets/home.svg";
import { useNavigate } from "react-router-dom";
import { usePlaidLink } from 'react-plaid-link';

const CARD_CONTRACT_ADDRESS = process.env.REACT_APP_CARD_CONTRACT_ADDRESS;
const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS;
const PEPU_DECIMALS = 18;

export default function CardScreen({ signer }) {
  const [card, setCard] = useState(null);
  const [cardBalance, setCardBalance] = useState(null);
  const [amount, setAmount] = useState("");
  const [spendAmount, setSpendAmount] = useState("");
  const [merchant, setMerchant] = useState("");
  const [reference, setReference] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [plaidOpen, setPlaidOpen] = useState(false);
  const navigate = useNavigate();
  const pepuUsdRate = 1.00;

  useEffect(() => {
    if (!signer) return;
    (async () => {
      const contract = new ethers.Contract(CARD_CONTRACT_ADDRESS, PEPUCardABI, signer);
      const address = await signer.getAddress();
      const bal = await contract.cardBalances(address);
      setCardBalance(Number(ethers.formatUnits(bal, PEPU_DECIMALS)));
      setLoading(false);
    })();
  }, [signer]);

  const handleAddMoney = () => {
    // Add money handling logic
    toast("Add money clicked!");
  };

  const handleWithdraw = () => {
    // Withdraw handling logic
    toast("Withdraw clicked!");
  };

  function handlePlaidSuccess(public_token, metadata) {
    toast.success("Bank linked! (demo)");
    // Send public_token to your backend for access_token exchange
  }

  const togglePlaidModal = () => {
    setPlaidOpen(!plaidOpen);
  };

  if (loading) return <div className="card-screen loading">Loading card details...</div>;
  if (error) return <div className="card-screen error">{error}</div>;
  if (!CARD_CONTRACT_ADDRESS) {
    return <div className="card-screen error">No card contract address set.</div>;
  }
  if (!CONTRACT_ADDRESS) {
    throw new Error("Contract address is not set!");
  }

  return (
    <div style={{
      minHeight: "100vh",
      width: "100%",
      background: "#181c20",
      color: "#fff",
      fontFamily: "inherit",
      padding: 0,
      margin: 0
    }}>
      {/* Top Bar */}
      <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", padding: 18 }}>
        <img
          src={homeIcon}
          alt="Home"
          aria-label="Go to Dashboard"
          style={{ width: 40, height: 40, cursor: "pointer" }}
          onClick={() => navigate("/")}
          title="Go to Dashboard"
        />
      </div>

      {/* Title */}
      <div style={{ fontWeight: 700, fontSize: "2em", color: "#e0e0e0", margin: "0 0 18px 24px" }}>
        Money
      </div>

      {/* Main Card */}
      <div style={{
        background: "#23272f",
        borderRadius: 28,
        padding: "28px 24px 18px 24px",
        margin: "0 16px 18px 16px",
        boxShadow: "0 2px 16px #0006"
      }}>
        <div style={{ fontWeight: 600, fontSize: "1.2em", color: "#fff" }}>Cash balance</div>
        <div style={{ fontWeight: 800, fontSize: "3em", color: "#6aff6a", margin: "8px 0" }}>
          ${cardBalance !== null ? cardBalance.toFixed(2) : "0.00"}
        </div>
        <div style={{ color: "#aaa", fontSize: "1.1em", marginBottom: 18 }}>
          Account**** &nbsp; Routing***
        </div>
        <div style={{ display: "flex", gap: 16 }}>
          <button
            style={{
              flex: 1,
              background: "#181c20",
              color: "#fff",
              border: "none",
              borderRadius: 32,
              padding: "16px 0",
              fontSize: "1.1em",
              fontWeight: 600,
              cursor: "pointer"
            }}
            onClick={handleAddMoney}
          >
            Add money
          </button>
          <button
            style={{
              flex: 1,
              background: "#181c20",
              color: "#fff",
              border: "none",
              borderRadius: 32,
              padding: "16px 0",
              fontSize: "1.1em",
              fontWeight: 600,
              cursor: "pointer"
            }}
            onClick={handleWithdraw}
          >
            Withdraw
          </button>
        </div>
      </div>

      {/* Feature Card */}
      <div style={{
        background: "#23272f",
        borderRadius: 20,
        margin: "0 16px 18px 16px",
        padding: "18px 20px",
        display: "flex",
        alignItems: "center",
        gap: 16
      }}>
        <div
          style={{
            background: "#6aff6a",
            borderRadius: "50%",
            width: 40,
            height: 40,
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <span role="img" aria-label="paycheck" style={{ fontSize: 24, color: "#23272f" }}>💸</span>
        </div>
        <div>
          <div style={{ fontWeight: 600, fontSize: 16 }}>Paychecks</div>
          <div style={{ color: "#aaa", fontSize: 14 }}>Get benefits with direct deposit</div>
        </div>
      </div>

      {/* Explore Section */}
      <div style={{ fontWeight: 700, fontSize: 22, margin: "32px 0 12px 24px" }}>
        Explore
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
          margin: "0 16px"
        }}
      >
        {/* Card 1 */}
        <div
          style={{
            background: "#181c20",
            borderRadius: 18,
            padding: "18px 14px",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start"
          }}
        >
          <div
            style={{
              background: "#6aff6a",
              borderRadius: "50%",
              width: 32,
              height: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 8
            }}
          >
            <span role="img" aria-label="savings" style={{ fontSize: 18, color: "#23272f" }}>💰</span>
          </div>
          <div style={{ fontWeight: 600 }}>Savings</div>
          <div style={{ color: "#aaa", fontSize: 13 }}>Up to 4% interest</div>
        </div>
        {/* Card 2 */}
        <div
          style={{
            background: "#181c20",
            borderRadius: 18,
            padding: "18px 14px",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start"
          }}
        >
          <div
            style={{
              background: "#00e0ff",
              borderRadius: "50%",
              width: 32,
              height: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 8
            }}
          >
            <span role="img" aria-label="bitcoin" style={{ fontSize: 18, color: "#23272f" }}>₿</span>
          </div>
          <div style={{ fontWeight: 600 }}>Bitcoin</div>
          <div style={{ color: "#aaa", fontSize: 13 }}>Learn and invest</div>
        </div>
        {/* Card 3 */}
        <div
          style={{
            background: "#181c20",
            borderRadius: 18,
            padding: "18px 14px",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start"
          }}
        >
          <div
            style={{
              background: "#a259ff",
              borderRadius: "50%",
              width: 32,
              height: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 8
            }}
          >
            <span role="img" aria-label="stocks" style={{ fontSize: 18, color: "#23272f" }}>📈</span>
          </div>
          <div style={{ fontWeight: 600 }}>Stocks</div>
          <div style={{ color: "#aaa", fontSize: 13 }}>Track and invest</div>
        </div>
        {/* Card 4 */}
        <div
          style={{
            background: "#181c20",
            borderRadius: 18,
            padding: "18px 14px",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start"
          }}
        >
          <div
            style={{
              background: "#a259ff",
              borderRadius: "50%",
              width: 32,
              height: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 8
            }}
          >
            <span role="img" aria-label="taxes" style={{ fontSize: 18, color: "#23272f" }}>🏛️</span>
          </div>
          <div style={{ fontWeight: 600 }}>Taxes</div>
          <div style={{ color: "#aaa", fontSize: 13 }}>Manage and file</div>
        </div>
      </div>

      {/* Load Card from Bank Section */}
      <div
        style={{
          background: "#23272f",
          borderRadius: 20,
          margin: "24px 24px 0 24px",
          padding: "24px 20px",
          boxShadow: "0 2px 16px #0004",
          display: "flex",
          flexDirection: "column",
          alignItems: "center"
        }}
      >
        <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 8 }}>
          Load Card from Bank
        </div>
        <div style={{ color: "#aaa", fontSize: 15, marginBottom: 18, textAlign: "center" }}>
          Securely link your bank to instantly load your card.<br />
          (Plaid, MX, or Trustly supported)
        </div>
        <button
          style={{
            background: "#6aff6a",
            color: "#23272f",
            border: "none",
            borderRadius: 16,
            padding: "16px 32px",
            fontWeight: 700,
            fontSize: 18,
            cursor: "pointer",
            marginBottom: 12,
            boxShadow: "0 2px 8px #0002"
          }}
          onClick={() => setPlaidOpen(true)}
        >
          Link Bank Account
        </button>
        <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
          <button
            style={{
              background: "#181c20",
              color: "#fff",
              border: "none",
              borderRadius: 12,
              padding: "10px 20px",
              fontWeight: 600,
              fontSize: 16,
              cursor: "pointer"
            }}
            onClick={() => alert("Load $25 (demo)")}
          >
            +$25
          </button>
          <button
            style={{
              background: "#181c20",
              color: "#fff",
              border: "none",
              borderRadius: 12,
              padding: "10px 20px",
              fontWeight: 600,
              fontSize: 16,
              cursor: "pointer"
            }}
            onClick={() => alert("Load $50 (demo)")}
          >
            +$50
          </button>
          <button
            style={{
              background: "#181c20",
              color: "#fff",
              border: "none",
              borderRadius: 12,
              padding: "10px 20px",
              fontWeight: 600,
              fontSize: 16,
              cursor: "pointer"
            }}
            onClick={() => alert("Custom amount (demo)")}
          >
            Custom
          </button>
        </div>
        <div style={{ color: "#ffd700", fontSize: 13, marginTop: 14, textAlign: "center" }}>
          Optional: Convert to PEPU for rewards!
        </div>
      </div>

      {/* Plaid Modal */}
      <PlaidModal
        open={plaidOpen}
        onClose={() => setPlaidOpen(false)}
        onSuccess={handlePlaidSuccess}
      />
    </div>
  );
}

function PlaidModal({ open, onClose, onSuccess }) {
  const [linkToken, setLinkToken] = useState(null);

  useEffect(() => {
    if (open) {
      fetch('http://localhost:5001/create_link_token', { method: 'POST' })
        .then(res => res.json())
        .then(data => setLinkToken(data.link_token));
    }
  }, [open]);

  const config = {
    token: linkToken,
    onSuccess: (public_token, metadata) => {
      onSuccess(public_token, metadata);
      onClose();
    },
    onExit: onClose,
  };
  const { open: openPlaid, ready } = usePlaidLink(config);

  if (!open) return null;

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
      background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999
    }}>
      <div style={{
        background: "#23272f", borderRadius: 16, padding: 32, minWidth: 320, textAlign: "center"
      }}>
        <h2 style={{ color: "#6aff6a" }}>Link Your Bank</h2>
        <p style={{ color: "#aaa" }}>Securely connect your bank account with Plaid.</p>
        <button
          style={{
            background: "#6aff6a", color: "#23272f", border: "none", borderRadius: 12,
            padding: "14px 32px", fontWeight: 700, fontSize: 18, cursor: "pointer", margin: "18px 0"
          }}
          onClick={openPlaid}
          disabled={!ready}
        >
          {ready ? "Start Bank Link" : "Loading..."}
        </button>
        <br />
        <button
          style={{
            background: "none", color: "#fff", border: "1px solid #fff", borderRadius: 12,
            padding: "10px 24px", fontWeight: 600, fontSize: 16, cursor: "pointer"
          }}
          onClick={onClose}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
