import React, { useState } from "react";

const mockMerchants = [
  { name: "Amy's Coffee", code: "AMY123", location: "Downtown", wallet: "0x123...abcd" },
  { name: "Bob's Books", code: "BOB456", location: "Market St", wallet: "0x456...efgh" },
  { name: "Fresh Farm", code: "FARM789", location: "Farmers Market", wallet: "0x789...ijkl" },
];

export default function SendToMerchant() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [amount, setAmount] = useState("");
  const [step, setStep] = useState(1);

  // Filter merchants by name, code, or location
  const results = mockMerchants.filter(
    m =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.code.toLowerCase() === search.toLowerCase() ||
      m.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#181c20",
        color: "#fff",
        fontFamily: "inherit",
        padding: "0 0 80px 0",
      }}
    >
      <div style={{ fontWeight: 700, fontSize: 28, margin: "32px 0 18px 24px" }}>
        Pay a Merchant
      </div>

      {step === 1 && (
        <>
          <div style={{ margin: "0 24px 18px 24px" }}>
            <input
              type="text"
              placeholder="Search by name, code, or location"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: "100%",
                padding: "16px",
                borderRadius: 16,
                border: "none",
                background: "#23272f",
                color: "#fff",
                fontSize: 18,
                marginBottom: 12,
                outline: "none",
              }}
            />
          </div>
          <div style={{ margin: "0 24px" }}>
            {results.length === 0 && (
              <div style={{ color: "#aaa", textAlign: "center", marginTop: 24 }}>
                No merchants found.
              </div>
            )}
            {results.map(m => (
              <div
                key={m.code}
                style={{
                  background: "#23272f",
                  borderRadius: 16,
                  padding: "18px 16px",
                  marginBottom: 12,
                  cursor: "pointer",
                  boxShadow: "0 2px 8px #0002",
                  border: "2px solid transparent",
                  transition: "border 0.2s",
                }}
                onClick={() => {
                  setSelected(m);
                  setStep(2);
                }}
                onMouseOver={e => (e.currentTarget.style.border = "2px solid #6aff6a")}
                onMouseOut={e => (e.currentTarget.style.border = "2px solid transparent")}
              >
                <div style={{ fontWeight: 600, fontSize: 18 }}>{m.name}</div>
                <div style={{ color: "#6aff6a", fontSize: 15, margin: "4px 0" }}>
                  Code: {m.code}
                </div>
                <div style={{ color: "#aaa", fontSize: 14 }}>{m.location}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {step === 2 && selected && (
        <div style={{
          background: "#23272f",
          borderRadius: 20,
          margin: "32px 24px 0 24px",
          padding: "24px 20px",
          boxShadow: "0 2px 16px #0004",
        }}>
          <div style={{ fontWeight: 700, fontSize: 22, marginBottom: 8 }}>{selected.name}</div>
          <div style={{ color: "#6aff6a", fontSize: 16, marginBottom: 4 }}>Code: {selected.code}</div>
          <div style={{ color: "#aaa", fontSize: 15, marginBottom: 18 }}>{selected.location}</div>
          <input
            type="number"
            placeholder="Enter amount"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: 12,
              border: "none",
              background: "#181c20",
              color: "#fff",
              fontSize: 18,
              marginBottom: 18,
              outline: "none",
            }}
          />
          <button
            style={{
              width: "100%",
              background: "#6aff6a",
              color: "#23272f",
              border: "none",
              borderRadius: 16,
              padding: "16px 0",
              fontWeight: 700,
              fontSize: 18,
              cursor: "pointer",
              marginBottom: 8,
            }}
            disabled={!amount || Number(amount) <= 0}
            onClick={() => alert(`Paying ${amount} PEPU to ${selected.name}`)}
          >
            Pay {amount ? `${amount} PEPU` : ""}
          </button>
          <button
            style={{
              width: "100%",
              background: "none",
              color: "#fff",
              border: "1px solid #fff",
              borderRadius: 16,
              padding: "12px 0",
              fontWeight: 600,
              fontSize: 16,
              cursor: "pointer",
            }}
            onClick={() => setStep(1)}
          >
            Back
          </button>
        </div>
      )}
    </div>
  );
}