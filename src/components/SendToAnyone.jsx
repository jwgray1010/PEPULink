import React, { useState } from "react";

export default function SendToAnyone({ signer }) {
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [status, setStatus] = useState("");
  const [claimLink, setClaimLink] = useState("");

  async function handleSend() {
    setStatus("Processing...");
    const res = await fetch("/api/send-anyone", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount, recipient, sender: signer?.address }),
    });
    const data = await res.json();
    if (data.claimLink) {
      setClaimLink(data.claimLink);
      setStatus("Success! Share this link with the recipient.");
    } else {
      setStatus("Failed: " + (data.error || "Unknown error"));
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <h2>Send to Anyone</h2>
      <input
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={e => setAmount(e.target.value)}
        style={{ marginBottom: 12, width: "100%" }}
      />
      <input
        type="text"
        placeholder="Recipient email or phone"
        value={recipient}
        onChange={e => setRecipient(e.target.value)}
        style={{ marginBottom: 12, width: "100%" }}
      />
      <button onClick={handleSend} style={{ width: "100%" }}>
        Send
      </button>
      {status && <div style={{ marginTop: 12 }}>{status}</div>}
      {claimLink && (
        <div style={{ marginTop: 12, wordBreak: "break-all" }}>
          <b>Claim Link:</b> <a href={claimLink}>{claimLink}</a>
        </div>
      )}
    </div>
  );
}