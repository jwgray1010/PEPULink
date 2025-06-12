import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import PEPUPaymentABI from "../abi/PEPUPayment.json";
import { useNavigate } from "react-router-dom";

const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS;
const PEPU_DECIMALS = 18;

export default function MerchantDashboard({ signer, provider }) {
  const [escrowBalance, setEscrowBalance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [txHistory, setTxHistory] = useState([]);
  const [address, setAddress] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fetch merchant address
  useEffect(() => {
    if (!signer) return;
    (async () => {
      try {
        const addr = await signer.getAddress();
        setAddress(addr);
      } catch (err) {
        setError("Failed to fetch merchant address");
      }
    })();
  }, [signer]);

  // Fetch escrow balance
  useEffect(() => {
    if (!signer) return;
    (async () => {
      try {
        const contract = new ethers.Contract(CONTRACT_ADDRESS, PEPUPaymentABI, signer);
        const addr = await signer.getAddress();
        const bal = await contract.merchantBalances(addr);
        setEscrowBalance(Number(ethers.formatUnits(bal, PEPU_DECIMALS)));
      } catch (err) {
        setError("Failed to fetch escrow balance");
      }
    })();
  }, [signer, loading]);

  // Fetch all payment and escrow history
  useEffect(() => {
    if (!provider || !address) return;
    (async () => {
      try {
        const contract = new ethers.Contract(CONTRACT_ADDRESS, PEPUPaymentABI, provider);
        // Direct payments (Payment event)
        const directEvents = await contract.queryFilter(
          contract.filters.Payment(null, address)
        );
        // EscrowPaid events
        const paidEvents = await contract.queryFilter(
          contract.filters.EscrowPaid(null, address)
        );
        // EscrowWithdrawn events
        const withdrawnEvents = await contract.queryFilter(
          contract.filters.EscrowWithdrawn(address)
        );
        // Format events
        const txs = [
          ...directEvents.map(e => ({
            type: "DirectPayment",
            from: e.args.from,
            amount: Number(ethers.formatUnits(e.args.amount, PEPU_DECIMALS)),
            txId: e.args.txId,
            metadata: e.args.metadata,
            txHash: e.transactionHash,
            blockNumber: e.blockNumber,
          })),
          ...paidEvents.map(e => ({
            type: "EscrowPaid",
            from: e.args.from,
            amount: Number(ethers.formatUnits(e.args.amount, PEPU_DECIMALS)),
            txId: e.args.txId,
            metadata: e.args.metadata,
            txHash: e.transactionHash,
            blockNumber: e.blockNumber,
          })),
          ...withdrawnEvents.map(e => ({
            type: "EscrowWithdrawn",
            amount: Number(ethers.formatUnits(e.args.amount, PEPU_DECIMALS)),
            txHash: e.transactionHash,
            blockNumber: e.blockNumber,
          })),
        ];
        // Sort by block number (descending)
        txs.sort((a, b) => b.blockNumber - a.blockNumber);
        setTxHistory(txs);
      } catch (err) {
        setError("Failed to fetch transaction history");
      }
    })();
  }, [provider, address, loading]);

  // Withdraw escrow handler
  const handleWithdrawEscrow = async () => {
    setLoading(true);
    setError(null);
    try {
      const contract = new ethers.Contract(CONTRACT_ADDRESS, PEPUPaymentABI, signer);
      const tx = await contract.withdrawEscrow();
      await tx.wait();
      alert("Escrow withdrawn!");
    } catch (err) {
      setError("Withdraw failed: " + (err.reason || err.message));
    }
    setLoading(false);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100vw",
        background: "#181c20",
        color: "#fff",
        fontFamily: "inherit",
        margin: 0,
        padding: 0,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ padding: "24px 0 18px 0", textAlign: "center" }}>
        <h2
          style={{
            margin: 0,
            color: "#111",
            background: "#ffd700",
            display: "inline-block",
            padding: "0.2em 1em",
            borderRadius: "8px",
            boxShadow: "0 2px 8px #0002",
            fontWeight: 800,
            letterSpacing: 1,
          }}
        >
          Merchant Dashboard
        </h2>
      </div>
      {error && (
        <div style={{ color: "red", marginBottom: 12, textAlign: "center" }}>{error}</div>
      )}
      <div style={{ textAlign: "center", marginBottom: 18 }}>
        Escrow Balance: <b>{escrowBalance !== null ? escrowBalance : (loading ? "Loading..." : "...")}</b> PEPU
      </div>
      <div style={{ textAlign: "center" }}>
        <button
          onClick={handleWithdrawEscrow}
          disabled={loading || !escrowBalance || escrowBalance <= 0}
          style={{
            margin: "12px 0",
            padding: "12px 32px",
            borderRadius: 24,
            background: "#427b5e",
            color: "#fff",
            border: "none",
            fontWeight: 600,
            fontSize: "1.1em",
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Withdrawing..." : "Withdraw Escrow"}
        </button>
      </div>
      <h3 style={{ textAlign: "center", marginTop: 32 }}>All Payment History</h3>
      <div style={{
        flex: 1,
        overflowY: "auto",
        padding: 8,
        margin: 0,
        width: "100%",
        background: "none",
        border: "none",
        minHeight: 0, // for flexbox scroll
      }}>
        {txHistory.length === 0 && <div style={{ textAlign: "center" }}>No payments found.</div>}
        {txHistory.map((tx, i) => (
          <div key={tx.txHash ? tx.txHash + tx.blockNumber : i} style={{
            marginBottom: 18,
            fontSize: "1em",
            background: "#23272f",
            borderRadius: 12,
            padding: 16,
            color: "#fff"
          }}>
            <b>
              {tx.type === "DirectPayment"
                ? "Direct Payment Received"
                : tx.type === "EscrowPaid"
                ? "Escrow Payment Received"
                : "Escrow Withdrawn"}
            </b>
            <br />
            {tx.type !== "EscrowWithdrawn" && (
              <>
                From: <span style={{ color: "#888" }}>{tx.from}</span>
                <br />
                Amount: <b>{tx.amount} PEPU</b>
                <br />
                Memo: <span style={{ color: "#888" }}>{tx.metadata}</span>
                <br />
                txId: <span style={{ color: "#888" }}>{tx.txId}</span>
                <br />
              </>
            )}
            {tx.type === "EscrowWithdrawn" && (
              <>
                Amount: <b>{tx.amount} PEPU</b>
                <br />
              </>
            )}
            <a
              href={`https://etherscan.io/tx/${tx.txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#ffd700" }}
            >
              View on Explorer
            </a>
            <br />
            Block: {tx.blockNumber}
          </div>
        ))}
      </div>
    </div>
  );
}