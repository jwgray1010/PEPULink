import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { v4 as uuidv4 } from "uuid";
import { toast } from "react-toastify";
import PEPUPaymentABI from "../abi/PEPUPayment.json";

const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS;
const PEPU_DECIMALS = 18;

export default function PayMerchant({
  signer,
  merchantAddress,
  pepuUsdRate = 0.0123,
  feeBps = 100,
  feeRecipient,
  isMerchant = false,
}) {
  const [amount, setAmount] = useState("");
  const [metadata, setMetadata] = useState("");
  const [txStatus, setTxStatus] = useState(null);
  const [txHash, setTxHash] = useState(null);
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState(null);
  const [escrowBalance, setEscrowBalance] = useState(null);
  const [payToEscrow, setPayToEscrow] = useState(false);
  const [isBlacklisted, setIsBlacklisted] = useState(false);

  // Calculate fee and payout
  const fee = amount ? (parseFloat(amount) * feeBps) / 10000 : 0;
  const payout = amount ? parseFloat(amount) - fee : 0;

  // Generate a unique txId for each payment
  const [txId, setTxId] = useState(() =>
    ethers.keccak256(ethers.toUtf8Bytes(uuidv4()))
  );

  // Regenerate txId if user resets form
  const resetForm = () => {
    setAmount("");
    setMetadata("");
    setTxStatus(null);
    setTxHash(null);
    setTxId(ethers.keccak256(ethers.toUtf8Bytes(uuidv4())));
  };

  // Fetch user PEPU balance
  useEffect(() => {
    if (!signer) return;
    (async () => {
      const address = await signer.getAddress();
      const pepuToken = new ethers.Contract(
        process.env.REACT_APP_PEPU_TOKEN_ADDRESS,
        ["function balanceOf(address) view returns (uint256)"],
        signer
      );
      const bal = await pepuToken.balanceOf(address);
      setBalance(Number(ethers.formatUnits(bal, PEPU_DECIMALS)));
    })();
  }, [signer]);

  // Fetch merchant escrow balance (if merchant)
  useEffect(() => {
    if (!signer || !isMerchant) return;
    (async () => {
      const contract = new ethers.Contract(CONTRACT_ADDRESS, PEPUPaymentABI, signer);
      const address = await signer.getAddress();
      const bal = await contract.merchantBalances(address);
      setEscrowBalance(Number(ethers.formatUnits(bal, PEPU_DECIMALS)));
    })();
  }, [signer, isMerchant]);

  // Check if merchant is blacklisted
  useEffect(() => {
    if (!merchantAddress || !signer) return;
    (async () => {
      const contract = new ethers.Contract(CONTRACT_ADDRESS, PEPUPaymentABI, signer);
      try {
        const blacklisted = await contract.isBlacklisted(merchantAddress);
        setIsBlacklisted(blacklisted);
      } catch {
        setIsBlacklisted(false);
      }
    })();
  }, [merchantAddress, signer]);

  const handlePay = async () => {
    setLoading(true);
    setTxStatus(null);
    setTxHash(null);
    try {
      const contract = new ethers.Contract(CONTRACT_ADDRESS, PEPUPaymentABI, signer);
      if (isBlacklisted) {
        toast.error("Merchant is blacklisted. Payment not allowed.");
        setLoading(false);
        return;
      }
      // Check replay protection and merchant allowlist
      const canPay = await contract.canPay(merchantAddress, txId);
      if (!canPay) {
        toast.error(
          "Payment not allowed (merchant not allowlisted, paused, or txId used)"
        );
        setLoading(false);
        return;
      }
      // Approve token if needed (handled outside or in parent)
      // await pepuToken.approve(CONTRACT_ADDRESS, ethers.parseUnits(amount, PEPU_DECIMALS));

      let tx;
      if (payToEscrow) {
        tx = await contract.payToEscrow(
          merchantAddress,
          ethers.parseUnits(amount, PEPU_DECIMALS),
          txId,
          metadata
        );
      } else {
        tx = await contract.pay(
          merchantAddress,
          ethers.parseUnits(amount, PEPU_DECIMALS),
          txId,
          metadata
        );
      }
      setTxHash(tx.hash);
      setTxStatus("pending");
      await tx.wait();
      setTxStatus("confirmed");
      toast.success("Payment confirmed!");
    } catch (err) {
      setTxStatus("failed");
      toast.error("Payment failed: " + (err.reason || err.message));
    }
    setLoading(false);
  };

  // Merchant withdraws escrow
  const handleWithdrawEscrow = async () => {
    setLoading(true);
    try {
      const contract = new ethers.Contract(CONTRACT_ADDRESS, PEPUPaymentABI, signer);
      const tx = await contract.withdrawEscrow();
      await tx.wait();
      toast.success("Escrow withdrawn!");
      setEscrowBalance(0);
    } catch (err) {
      toast.error("Withdraw failed: " + (err.reason || err.message));
    }
    setLoading(false);
  };

  return (
    <div
      className="pay-merchant"
      style={{
        minHeight: "100vh",
        width: "100vw",
        background: "#181c20",
        color: "#fff",
        fontFamily: "inherit",
        margin: 0,
        padding: 0,
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
          Pay Merchant
        </h2>
      </div>
      {isBlacklisted && (
        <div style={{ color: "#ff4d4f", fontWeight: 600 }}>
          This merchant is blacklisted. Payments are disabled.
        </div>
      )}
      <label>
        <input
          type="checkbox"
          checked={payToEscrow}
          onChange={e => setPayToEscrow(e.target.checked)}
          disabled={loading}
          style={{ marginRight: 8 }}
        />
        Pay to Escrow (merchant must withdraw)
      </label>
      <input
        type="number"
        placeholder="Amount (PEPU)"
        value={amount}
        min={0}
        onChange={e => setAmount(e.target.value)}
        style={{ marginBottom: 8 }}
        data-tooltip="Enter the amount in PEPU tokens"
        disabled={isBlacklisted}
      />
      {amount && (
        <div style={{ fontSize: "0.95em", marginBottom: 8 }}>
          Fee: <b>{fee} PEPU</b> ({feeBps / 100}%)
          <br />
          Merchant receives: <b>{payout} PEPU</b>
          <br />
          <span style={{ color: "#ffd700" }}>
            (~${(parseFloat(amount) * pepuUsdRate).toFixed(2)} USD)
          </span>
        </div>
      )}
      <input
        type="text"
        placeholder="Order ID / Memo (optional)"
        value={metadata}
        onChange={e => setMetadata(e.target.value)}
        style={{ marginBottom: 8 }}
        data-tooltip="Add a note or order ID for the merchant"
        disabled={isBlacklisted}
      />
      <button
        className="wallet-btn"
        onClick={handlePay}
        disabled={
          loading ||
          !amount ||
          (balance !== null && parseFloat(amount) > balance) ||
          isBlacklisted
        }
        aria-busy={loading}
      >
        {loading ? "Paying..." : payToEscrow ? "Pay to Escrow" : "Pay"}
      </button>
      <button
        className="wallet-btn"
        style={{ marginLeft: 8, background: "#ffd700", color: "#23272f" }}
        onClick={resetForm}
        disabled={loading}
      >
        Reset
      </button>
      {txStatus && (
        <div
          style={{
            marginTop: 12,
            color: txStatus === "confirmed" ? "#2e8b57" : "#ff4d4f",
            fontWeight: 600,
          }}
        >
          Status: {txStatus}
          {txHash && (
            <span>
              &nbsp;|&nbsp;
              <a
                href={`https://etherscan.io/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#ffd700" }}
              >
                View on Explorer
              </a>
            </span>
          )}
        </div>
      )}
      <div style={{ marginTop: 16, fontSize: "0.9em", color: "#888" }}>
        <b>txId:</b> {txId}
      </div>
      {balance !== null && (
        <div
          style={{
            fontSize: "0.9em",
            color: balance < parseFloat(amount || 0) ? "#ff4d4f" : "#2e8b57",
          }}
        >
          Your balance: {balance} PEPU
        </div>
      )}
      <div style={{ fontSize: "0.85em", color: "#888" }}>
        Fee recipient: {feeRecipient}
      </div>
      <div style={{ fontSize: "0.85em", color: "#888" }}>
        Merchant: {merchantAddress}
      </div>
      {isMerchant && escrowBalance !== null && (
        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: "0.9em", color: "#888" }}>
            Escrow balance: {escrowBalance} PEPU
          </div>
          <button
            className="wallet-btn"
            onClick={handleWithdrawEscrow}
            disabled={loading || !escrowBalance}
            style={{ marginTop: 4 }}
          >
            Withdraw Escrow
          </button>
        </div>
      )}
    </div>
  );
}