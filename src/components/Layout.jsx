import React, { useState } from 'react';
import { Outlet, Link } from "react-router-dom";
import '../styles/theme.css';
import WalletConnectButton from './WalletConnectButton.jsx';
import copyIcon from '../assets/copy.svg';
import homeIcon from "../assets/home.svg";
import creditIcon from "../assets/credit.svg";
import moneyIcon from "../assets/money.svg";
import chartIcon from "../assets/chart.svg";
import questionIcon from "../assets/question.svg";
import storeIcon from "../assets/store.svg";
import rewardsIcon from "../assets/rewards.svg";
import SmartSpendingAIChat from "./SmartSpendingAIChat.jsx";
import ailogo from "../assets/ailogo.svg";

export default function Layout({ setSigner, signer, txHistory }) {
  const [aiModal, setAiModal] = useState(false);
  return (
    <div
      className="pepe-theme"
      style={{
        minHeight: '100vh',
        width: '100vw',
        background: '#f6f5ef', // <-- updated
        margin: 0,
        padding: 0,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header with Connect Wallet and Copy icon, no green padding */}
      <header
        style={{
          width: '100%',
          background: 'transparent', // <-- No green background
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 0,
            margin: 0,
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0,
            minHeight: 0,
            height: 'auto',
            }}
            >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 0, margin: 0, marginTop: 28 }}>
            <WalletConnectButton setSigner={setSigner} style={{ position: 'relative', top: '-4px' }} />
            <img
            src={copyIcon}
            alt="Copy"
            style={{
              width: 28,
              height: 28,
              cursor: 'pointer',
              marginLeft: 4,
              verticalAlign: 'middle',
              horizontalAlign: 'center',
            }}
            onClick={() => navigator.clipboard.writeText(window.location.href)}
            title="Copy page URL"
            />
            </div>
            </header>
            <main
            className="main-content"
            style={{
              width: '100vw',
              minHeight: '100vh',
              padding: 0,
              margin: 0,
              background: 'none',
              boxShadow: 'none',
              borderRadius: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'stretch',
              flex: 1,
            }}
          >
            <div
            style={{
              background: "none",
              borderRadius: 0,
              boxShadow: "none",
              padding: "0",
              margin: "0",
              width: "100vw",
              minHeight: "100vh",
            }}
          >
            <Outlet />
          </div>
          </main>
          {/* Bottom Navigation Bar */}
      <nav
        style={{
          width: '100%',
          position: 'fixed',
          left: 0,
          bottom: 0,
          background: '#f6f5ef', // lighter background
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          padding: '0.8em 0',
          zIndex: 100,
          borderTop: '1px solid #ddd',
          height: '80px',
        }}
      >
        <Link to="/" title="Home">
          <img src={homeIcon} alt="Home" style={{ width: 32, height: 32, filter: 'invert(34%) sepia(21%) saturate(749%) hue-rotate(87deg) brightness(92%) contrast(92%)' }} />
        </Link>
        <Link to="/card" title="Card">
          <img src={creditIcon} alt="Card" style={{ width: 32, height: 32 }} />
        </Link>
        <Link to="/history" title="Transactions">
          <img src={moneyIcon} alt="Transactions" style={{ width: 32, height: 32 }} />
        </Link>
        <Link to="/chart" title="Live Chart">
          <img src={chartIcon} alt="Live Chart" style={{ width: 32, height: 32 }} />
        </Link>
        <Link to="/about" title="What is PEPU?">
          <img src={questionIcon} alt="What is PEPU?" style={{ width: 32, height: 32 }} />
        </Link>
        <Link to="/send" title="Send to Merchant">
          <img src={storeIcon} alt="Store" style={{ width: 32, height: 32 }} />
        </Link>
        <Link to="/rewards" title="Rewards">
          <img src={rewardsIcon} alt="Rewards" style={{ width: 32, height: 32 }} />
        </Link>
      </nav>
      {/* Floating AI Button */}
      <div
        onClick={() => setAiModal(true)}
        style={{
          position: "fixed",
          bottom: 140, // moved up from 100 to 140
          right: 32,   // slightly more right for better spacing
          zIndex: 1001,
          width: 64,
          height: 64,
          background: "#fff",
          borderRadius: "50%",
          boxShadow: "0 2px 12px #0006",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          userSelect: "none",
        }}
        title="AI Smart Spending"
      >
        <img
          src={ailogo}
          alt="AI"
          style={{
            width: 36,
            height: 36,
            objectFit: "contain",
            display: "block",
            margin: 0, // ensure no margin
          }}
        />
      </div>

      {/* AI Modal */}
      {aiModal && (
        <div className="modal-overlay" tabIndex={-1} aria-modal="true" role="dialog" onClick={() => setAiModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{
  background: "#fff",
  borderRadius: 18,
  boxShadow: "0 4px 24px #0001",
  padding: "2em",
  margin: "2em auto",
  maxWidth: 420,
  width: "100%",
}}>
            <SmartSpendingAIChat signer={signer} txHistory={txHistory} />
            <button
              className="close-modal"
              onClick={() => setAiModal(false)}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: 'transparent',
                border: 'none',
                color: '#23272f', // dark color for visibility
                fontSize: '28px',
                cursor: 'pointer',
                fontWeight: 700,
              }}
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </div>
  );
}