import React, { useState, useEffect, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Joyride, { STATUS } from 'react-joyride';
import Layout from './components/Layout.jsx';
import WalletConnectButton from './components/WalletConnectButton.jsx';
import CardScreen from './components/CardScreen.jsx';
import MerchantQRGenerator from './components/MerchantQRGenerator.jsx';
import TxHistory from './components/TxHistory.jsx';
import HistoryScreen from './components/HistoryScreen.jsx';
import TopUpButton from './components/TopUpButton.jsx';
import toast, { Toaster } from 'react-hot-toast';
import HomeScreen from './components/HomeScreen.jsx';
import PEPULiveChart from './components/PepuLiveChart.jsx';
import WhatIsPepu from "./components/WhatIsPepu.jsx";
import QRScanner from './components/QRScanner.jsx';
import SendToMerchant from './components/SendToMerchant.jsx';
import SplashScreen from './components/SplashScreen.jsx';
import SmartSpendingAI from './components/SmartSpendingAI.jsx';
import FloatingMessage from "./components/FloatingMessage.jsx";
import RewardsPage from './components/RewardsPage.jsx';
import ProfilePage from './components/ProfilePage.jsx';
import PinSetupModal from './components/PinSetupModal.jsx';
import SmartSpendingAIChat from "./components/SmartSpendingAIChat";

const TOUR_STEPS = [
  {
    target: '.wallet-connect',
    content: 'Connect your wallet here to get started!',
    disableBeacon: true,
  },
  {
    target: '.nav-link[href="/"]',
    content: 'This is your Card dashboard.',
  },
  {
    target: '.nav-link[href="/history"]',
    content: 'View your transaction history here.',
  },
  {
    target: '.nav-link[href="/qr"]',
    content: 'Scan merchant QR codes to pay.',
  },
  {
    target: '.nav-link[href="/merchant"]',
    content: 'Generate QR codes for your own merchant payments.',
  },
  {
    target: '.topup-btn',
    content: 'Top up your card balance anytime!',
  },
];

function App() {
  const [signer, setSigner] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [modal, setModal] = useState(null);
  const [runTour, setRunTour] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [txHistory, setTxHistory] = useState([]);
  const [floatingMsg, setFloatingMsg] = useState("👋 Welcome to PEPULink! Try the new AI Smart Spending Assistant.");
  const [showPinModal, setShowPinModal] = useState(false);
  const [userPin, setUserPin] = useState(null);
  const [spendingLimits, setSpendingLimits] = useState({});

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2000); // 2 seconds
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!localStorage.getItem('onboarded')) {
      setShowOnboarding(true);
    }
  }, []);

  useEffect(() => {
    async function fetchTxs() {
      // Replace with your real API or ethers.js call
      // Example: fetch from your backend
      const res = await fetch(`/api/tx-history?address=${signer?.address}`);
      const data = await res.json();
      setTxHistory(data);
    }
    if (signer?.address) fetchTxs();
  }, [signer]);

  const handleDismissOnboarding = () => {
    setShowOnboarding(false);
    setRunTour(true);
    localStorage.setItem('onboarded', '1');
  };

  // Joyride callback to end tour
  const handleJoyrideCallback = data => {
    const { status } = data;
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      setRunTour(false);
    }
  };

  // FIXED: openModal should only set modal state, not return JSX
  const openModal = (title, content) => {
    setModal({ title, content, onClose: () => setModal(null) });
  };

  const handleSetLimit = (category, value) => {
    setSpendingLimits(limits => ({ ...limits, [category]: value }));
  };

  if (showSplash) return <SplashScreen />;

  // Example in your Dashboard or main component

  // Assume these come from your app's state, context, or API
  const userTxHistory = signer ? signer.txHistory : [];
  const userGoals = signer ? signer.goals : [];
  const userCategories = signer ? signer.categories : [];

  return (
    <Router>
      <Toaster position="top-center" />
      <Joyride
        steps={TOUR_STEPS}
        run={runTour}
        callback={handleJoyrideCallback}
        continuous
        showSkipButton
        styles={{
          options: {
            zIndex: 10000,
          },
        }}
      />
      <Routes>
        <Route element={<Layout setSigner={setSigner} signer={signer} txHistory={txHistory} />}>
          <Route
            path="/"
            element={<HomeScreen walletAddress={signer?.address || "0x..."} />}
          />
          <Route path="/history" element={<HistoryScreen signer={signer} />} />
          <Route path="/qr" element={<QRScanner signer={signer} openModal={openModal} />} />
          <Route path="/merchant" element={<MerchantQRGenerator signer={signer} />} />
          <Route path="/tx" element={<TxHistory signer={signer} />} />
          <Route path="/card" element={signer ? <CardScreen signer={signer} /> : <div>Please connect wallet</div>} />
          <Route path="/chart" element={<PEPULiveChart />} />
          <Route path="/about" element={<WhatIsPepu />} />
          <Route path="/send" element={<SendToMerchant />} />
          <Route path="/rewards" element={<RewardsPage userAddress={signer?.address} />} />
          <Route path="/ai" element={<SmartSpendingAI signer={signer} txHistory={txHistory} />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Routes>

      {/* Onboarding Modal */}
      {showOnboarding && (
        <div className="modal-overlay" tabIndex={-1} aria-modal="true" role="dialog">
          <div className="modal">
            <h2>Welcome to PEPULink!</h2>
            <ul style={{ textAlign: 'left', margin: '1em 0' }}>
              <li> Connect your wallet securely</li>
              <li> Top up and manage your PEPU card</li>
              <li> Scan or generate merchant QR codes</li>
              <li> View transaction history and status</li>
              <li> Learn more via tooltips and help links</li>
            </ul>
            <button className="topup-btn" onClick={handleDismissOnboarding} autoFocus>
              Start Guided Tour
            </button>
          </div>
        </div>
      )}

      {/* Global Modal Example */}
      {modal && (
        <div className="modal-overlay" tabIndex={-1} aria-modal="true" role="dialog" onClick={modal.onClose}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>{modal.title}</h2>
            <div>{modal.content}</div>
            <button className="topup-btn" onClick={modal.onClose} style={{ marginTop: 16 }}>
              Close
            </button>
          </div>
        </div>
      )}
      <FloatingMessage
        message={floatingMsg}
        onClose={() => setFloatingMsg(null)}
      />
      {/* BottomNav removed */}
      {/* <TopUpButton signer={signer} openModal={openModal} /> */}

      {/* PIN Setup Modal - Controlled by showPinModal state */}
      {showPinModal && (
        <PinSetupModal
          onClose={() => setShowPinModal(false)}
          onSetPin={pin => setUserPin(pin)}
        />
      )}
    </Router>
  );
}

export default App;