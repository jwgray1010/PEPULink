import React, { useEffect, useState, useRef } from "react";
import { ethers } from "ethers";
import Jazzicon from "react-jazzicon";
import toast from "react-hot-toast";

export default function WalletConnectButton({ setSigner }) {
  const [account, setAccount] = useState(null);
  const [ensName, setEnsName] = useState(null);
  const [connecting, setConnecting] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef();

  useEffect(() => {
    if (account) {
      const provider = new ethers.JsonRpcProvider();
      provider
        .lookupAddress(account)
        .then((name) => setEnsName(name || null))
        .catch(() => setEnsName(null));
    } else {
      setEnsName(null);
    }
  }, [account]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  const connectWallet = async () => {
    setConnecting(true);
    try {
      console.log("window.ethereum:", window.ethereum); // Add this
      if (!window.ethereum) {
        toast.error("MetaMask not detected!");
        setConnecting(false);
        return;
      }
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      setAccount(address);
      setSigner(signer);
      toast.success("Wallet connected!");
    } catch (err) {
      toast.error("Wallet connection failed");
    }
    setConnecting(false);
  };

  const disconnectWallet = () => {
    setAccount(null);
    setSigner(null);
    setDropdownOpen(false);
  };

  const copyToClipboard = () => {
    if (!account) return;
    navigator.clipboard.writeText(account);
    toast.success("Wallet address copied!");
    setDropdownOpen(false);
  };

  return (
    <div
      className="wallet-connect"
      style={{ position: "relative" }}
      ref={dropdownRef}
    >
      {!account ? (
        <button
          onClick={connectWallet}
          disabled={connecting}
          className={`wallet-btn${connecting ? " button-loading" : ""}`}
          aria-busy={connecting}
        >
          {connecting ? "Connecting..." : "Connect Wallet"}
        </button>
      ) : (
        <div>
          <button
            className="wallet-address-btn"
            onClick={() => setDropdownOpen((open) => !open)}
            style={{
              display: "flex",
              alignItems: "center",
              background: "none",
              border: "none",
              color: "#ffd700",
              fontWeight: 600,
              cursor: "pointer",
              fontSize: "1em",
              padding: 0,
            }}
            aria-label="Wallet menu"
            tabIndex={0}
          >
            <Jazzicon
              diameter={24}
              seed={parseInt(account.slice(2, 10), 16)}
              style={{ marginRight: 8 }}
            />
            <span style={{ marginRight: 6 }}>
              {ensName || `${account.slice(0, 6)}...${account.slice(-4)}`}
            </span>
            <span style={{ fontSize: "1.2em" }}>▼</span>
          </button>
          {dropdownOpen && (
            <div
              className="wallet-dropdown"
              style={{
                position: "absolute",
                top: "110%",
                right: 0,
                background: "#23272f",
                border: "1px solid #444",
                borderRadius: 8,
                minWidth: 180,
                zIndex: 100,
                boxShadow: "0 2px 12px #0006",
                padding: 8,
              }}
              tabIndex={-1}
            >
              <div
                style={{
                  padding: "8px 12px",
                  cursor: "pointer",
                  color: "#ffd700",
                  borderBottom: "1px solid #333",
                  fontSize: "0.97em",
                }}
                onClick={copyToClipboard}
                tabIndex={0}
                role="button"
                aria-label="Copy Address"
              >
                Copy Address
              </div>
              <div
                style={{
                  padding: "8px 12px",
                  cursor: "pointer",
                  color: "#ff4d4f",
                  fontWeight: 600,
                  fontSize: "0.97em",
                }}
                onClick={disconnectWallet}
                data-testid="logout"
                tabIndex={0}
                role="button"
                aria-label="Logout"
              >
                Logout
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}