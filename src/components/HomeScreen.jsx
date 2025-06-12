import { useState, useEffect } from "react";
import { ethers, Wallet } from "ethers";
import { useNavigate } from "react-router-dom";
import "../styles/theme.css";
import QRScanner from './QRScanner.jsx';
import qrIcon from '../assets/qr.svg'; // Make sure you have a QR icon SVG in your assets
// eslint-disable-next-line
import ailogo from '../assets/ailogo.svg'; // AI logo for future use

export default function HomeScreen({ openModal, signer, ...props }) {
  const {
    walletAddress = "0x1234...abcd",
    onWalletConnect,
    onCopy,
    onScan,
    onRequest,
    merchantAddress
  } = props;

  const [amount, setAmount] = useState("0");
  const [balance, setBalance] = useState(0);
  const [paying, setPaying] = useState(false);
  const [payStatus, setPayStatus] = useState("");
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [autoTopUp, setAutoTopUp] = useState(50); // Default $50
  const [showReceipt, setShowReceipt] = useState(null);
  const [recurringAmount, setRecurringAmount] = useState(10);
  const [recurringInterval, setRecurringInterval] = useState("monthly");
  const [guestWallet, setGuestWallet] = useState(null);
  const [showPepuModal, setShowPepuModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchBalance() {
      if (!signer) {
        setBalance(0);
        return;
      }
      try {
        // Replace with your contract/balance logic as needed
        const address = await signer.getAddress();
        // Example: get balance from contract or provider
        // const bal = await contract.balanceOf(address);
        // setBalance(Number(ethers.formatUnits(bal, 18)));
        setBalance(1234.56); // Demo
      } catch {
        setBalance(0);
      }
    }
    fetchBalance();
  }, [signer]);

  useEffect(() => {
    if (balance < autoTopUp) {
      // Call your top-up function here
      // Example: triggerTopUp(autoTopUp - balance);
      // TODO: Implement actual swap or top-up logic here
    }
    // eslint-disable-next-line
  }, [balance, autoTopUp]);

  const handleKey = (val) => {
    let next = amount;
    if (val === "." && amount.includes(".")) return;
    if (val === "<") {
      next = amount.length > 1 ? amount.slice(0, -1) : "0";
    } else {
      next = amount === "0" && val !== "." ? val : amount + val;
    }
    if (next.startsWith("0") && !next.startsWith("0.")) next = next.replace(/^0+/, "");
    if (Number(next) > balance) return;
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
        pepu: (amount / pepuUsdRate).toFixed(2), // adjust as needed
        meme: "/memes/pepe-dance.gif", // path to your meme/gif
        txHash: tx.hash
      });
      // Optionally, refresh balance
      // const address = await signer.getAddress();
      // const bal = await contract.balanceOf(address);
      // setBalance(Number(ethers.formatUnits(bal, 18)));
    } catch (err) {
      setPayStatus("Payment failed: " + (err.reason || err.message));
    }
    setPaying(false);
  };

  const triggerTopUp = async (amountNeeded) => {
    // Example: Call your contract or backend to swap PEPU for fiat
    // await contract.swapPEPUForFiat(amountNeeded);
    setPayStatus(`Auto-Top-Up: Swapped PEPU for $${amountNeeded.toFixed(2)}`);
  };

  const createGuestWallet = () => {
    const tempWallet = Wallet.createRandom();
    setGuestWallet(tempWallet);
    // Use tempWallet.address for payment
  };

  const keypad = [
    ["1", "2", "3"],
    ["4", "5", "6"],
    ["7", "8", "9"],
    [".", "0", "<"]
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        background: "#f6f5ef",
        color: "#23272f",
        display: "flex",
        flexDirection: "column",
        fontFamily: "inherit",
        margin: 0,
        padding: 0,
      }}
    >
      <main
        className="main-content"
        style={{
          width: '100%',
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
            background: "#fff",
            borderRadius: 18,
            boxShadow: "0 4px 24px #0001",
            padding: "2em",
            margin: "2em auto 100px auto",
            maxWidth: 420,
            width: "100%",
            minHeight: "60vh",
          }}
        >
          {/* Balance */}
          <div style={{ textAlign: "center", margin: "32px 0 0 0" }}>
            <div style={{ fontSize: "5em", fontWeight: 700, color: "#6aff6a" }}>
              ${amount}
            </div>
            {/* Swap the order below */}
            <div style={{ color: "#ffd700", fontSize: "1.2em", marginTop: 8 }}>
              USD Balance: <b>{balance}</b>
            </div>
            <div style={{ color: "#ffd700", fontSize: "1.2em", marginTop: 8 }}>
              PEPU Balance: <b>{/* insert PEPU balance variable here, e.g. pepuBalance */}</b>
            </div>
          </div>

          {/* Keypad */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", margin: "0 0 32px 0" }}>
            {keypad.map((row, i) => (
              <div key={i} style={{ display: "flex", gap: 64, margin: "18px 0" }}>
                {row.map((key) => (
                  <button
                    key={key}
                    onClick={() => handleKey(key)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#6aff6a",
                      fontSize: "2.6em",
                      width: 80,
                      height: 80,
                      borderRadius: "50%",
                      cursor: "pointer",
                      transition: "background 0.2s"
                    }}
                    disabled={
                      key !== "<" &&
                      key !== "." &&
                      Number(
                        amount === "0" && key !== "." ? key : amount + key
                      ) > balance
                    }
                  >
                    {key === "<" ? <span>&larr;</span> : key}
                  </button>
                ))}
              </div>
            ))}
          </div>

          {/* Load Card / Pay Buttons */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 24,
              margin: "0 0 32px 0",
              padding: "0 24px",
            }}
          >
            <button
              onClick={onRequest}
              style={{
                flex: 1,
                background: "#181c20",
                color: "#6aff6a",
                border: "none",
                borderRadius: 40,
                padding: "22px 0",
                fontSize: "2em",
                fontWeight: 600,
                marginRight: 8,
                boxShadow: "0 2px 8px #0002",
                transition: "background 0.2s",
                letterSpacing: 0.5,
              }}
            >
              Load Card
            </button>
            <button
              onClick={handlePay}
              disabled={paying || Number(amount) <= 0 || Number(amount) > balance}
              style={{
                flex: 1,
                background: paying ? "#333" : "#181c20",
                color: "#6aff6a",
                border: "none",
                borderRadius: 40,
                padding: "22px 0",
                fontSize: "2em",
                fontWeight: 600,
                marginLeft: 8,
                boxShadow: "0 2px 8px #0002",
                transition: "background 0.2s",
                letterSpacing: 0.5,
                opacity: paying ? 0.7 : 1,
                cursor: paying ? "not-allowed" : "pointer"
              }}
            >
              {paying ? "Paying..." : "Pay"}
            </button>
          </div>
          {payStatus && (
            <div style={{
              textAlign: "center",
              color: payStatus.includes("success") ? "#6aff6a" : "#ffd700",
              marginBottom: 16
            }}>
              {payStatus}
            </div>
          )}
          {/* QR Scanner Modal */}
          {showQRScanner && (
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100vw",
                height: "100vh",
                background: "rgba(0,0,0,0.85)",
                zIndex: 1000,
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <div style={{ position: "relative", background: "#181c20", borderRadius: 16, padding: 24 }}>
                <button
                  onClick={() => setShowQRScanner(false)}
                  style={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    background: "none",
                    border: "none",
                    color: "#fff",
                    fontSize: 28,
                    cursor: "pointer"
                  }}
                  aria-label="Close QR Scanner"
                >
                  ×
                </button>
                <QRScanner
                  onScan={(data) => {
                    setShowQRScanner(false);
                    if (onScan) onScan(data);
                  }}
                  onError={() => setShowQRScanner(false)}
                />
              </div>
            </div>
          )}
          {/* Receipt Modal - New Feature */}
          {showReceipt && (
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100vw",
                height: "100vh",
                background: "rgba(0,0,0,0.85)",
                zIndex: 2000,
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <div style={{
                background: "#23272f",
                borderRadius: 16,
                padding: 32,
                textAlign: "center",
                color: "#fff",
                minWidth: 320
              }}>
                <img src={showReceipt.meme} alt="Meme" style={{ width: 120, marginBottom: 16 }} />
                <h2> Payment Successful!</h2>
                <p>
                  <b>${showReceipt.amount}</b> spent<br />
                  (<b>{showReceipt.pepu} PEPU</b>)
                </p>
                <button
                  style={{
                    margin: "16px 0 0 0",
                    background: "#ffd700",
                    color: "#23272f",
                    border: "none",
                    borderRadius: 8,
                    padding: "10px 24px",
                    fontWeight: 700,
                    cursor: "pointer"
                  }}
                  onClick={() => {
                    // Example: share to Twitter
                    window.open(
                      `https://twitter.com/intent/tweet?text=I%20just%20paid%20with%20PEPU%20on%20PEPULink!%20%23pepu%20%23web3`,
                      "_blank"
                    );
                  }}
                >
                Share on Twitter
                </button>
                <br />
                <button
                  style={{
                    margin: "16px 0 0 0",
                    background: "none",
                    color: "#fff",
                    border: "1px solid #fff",
                    borderRadius: 8,
                    padding: "8px 24px",
                    cursor: "pointer"
                  }}
                  onClick={() => setShowReceipt(null)}
                >
                  Close
                </button>
              </div>
            </div>
          )}
          {/* Recurring Payment / Guest Checkout Buttons */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 24,
              margin: "0 0 24px 0",
              padding: "0 24px",
            }}
          >
            <button
              onClick={() => setShowRecurringModal(true)}
              style={{
                flex: 1,
                background: "#181c20",
                color: "#6aff6a", // Green text
                border: "none",
                borderRadius: 20,
                padding: "12px 0",
                fontSize: "1.2em",
                fontWeight: 400,
                marginRight: 5,
                boxShadow: "0 2px 8px #0002",
                transition: "background 0.2s",
                letterSpacing: 0.5,
                cursor: "pointer"
              }}
            >
            Recurring Payment
            </button>
            <button
              onClick={createGuestWallet}
              style={{
                flex: 1,
                background: "#181c20",
                color: "#6aff6a",
                border: "none",
                borderRadius: 20,
                padding: "12px 0",
                fontSize: "1.2em",
                fontWeight: 400,
                marginLeft: 5,
                boxShadow: "0 2px 8px #0002",
                transition: "background 0.2s",
                letterSpacing: 0.5,
                cursor: "pointer"
              }}
            >
            Guest Checkout
            </button>
          </div>
          <div
            style={{
              position: "absolute",
              top: 24,
              right: 24,
              zIndex: 10,
            }}
          >
            <button
              onClick={() => setShowQRScanner(true)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
              }}
              aria-label="Scan QR"
            >
              <img src={qrIcon} alt="Scan QR" style={{ width: 40, height: 40 }} />
            </button>
          </div>
          {showPepuModal && (
            <Modal title="What is PEPU?" onClose={() => setShowPepuModal(false)}>
              <p>PEPU is your open, borderless digital wallet...</p>
            </Modal>
          )}
        </div>
      </main>
      <footer className="footer" style={{ marginBottom: 80 }}>
        <hr className="footer-divider" />
        <p>
          Powered by PepeUnchained • PEPULink &copy; {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
}