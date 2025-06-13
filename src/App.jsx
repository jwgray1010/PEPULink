import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CardScreen from "./components/CardScreen";
import Layout from "./components/Layout";
import HomeScreen from "./components/HomeScreen";
import TxHistory from "./components/TxHistory";
import { TourProvider } from '@reactour/tour';
import './styles/theme.css';

const steps = [
  {
    selector: '.wallet-connect',
    content: 'Connect your wallet here to get started!',
  },
  // ...other steps
];

function App() {
  const [signer, setSigner] = useState(null);
  const [showPepuModal, setShowPepuModal] = useState(false);

  const openPepuModal = () => setShowPepuModal(true);
  const closePepuModal = () => setShowPepuModal(false);

  return (
    <TourProvider steps={steps}>
      <Routes>
        <Route
          element={
            <Layout setSigner={setSigner} signer={signer} />            }
        >
          <Route
            path="/"
            element={
              <HomeScreen
                signer={signer}
                walletAddress={signer ? (signer.getAddress ? signer.getAddress() : "0x...") : "0x..."}
                onWalletConnect={() => {}}
                onCopy={(addr) => navigator.clipboard.writeText(addr)}
                onScan={() => {/* open QR scanner */}}
                onRequest={() => {/* handle request/load card */}}
                onPay={() => {/* handle pay */}}
              />
            }
          />
          <Route path="/card" element={<CardScreen signer={signer} />} />
          <Route path="/tx" element={<TxHistory signer={signer} />} />
          {/* Add more routes here as needed */}
        </Route>
      </Routes>
      {showPepuModal && (
        <div className="modal-overlay" tabIndex={-1} aria-modal="true" role="dialog">
          <div className="modal">
            <h2>What is PEPU?</h2>
            <p>
              <b>PEPU</b> is a fast, low-fee token for instant payments on Pepe Unchained.<br />
              It’s used for all transactions in this app.<br /><br />
              <a
                href="https://your-pepu-docs-link.com"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#ffd700', textDecoration: 'underline' }}
              >
                Learn more about PEPU
              </a>
            </p>
            <button className="wallet-btn" onClick={closePepuModal} style={{ marginTop: 16 }}>
              Close
            </button>
          </div>
        </div>
      )}
    </TourProvider>
  );
}

export default function AppWithRouter() {
  return (
    <Router>
      <App />
    </Router>
  );
}

if (!signer) {
  // Show demo card or a message
}
