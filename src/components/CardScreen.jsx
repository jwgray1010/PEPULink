import React from "react";

const card = {
  number: "4242 4242 4242 4242",
  name: "PEPU DEMO",
  expiry: "12/34",
  balance: 123.45,
  status: "Active"
};

const boxes = [
  {
    title: "Savings",
    icon: "💰",
    color: "#fff",
    subtitle: "Up to 4% interest"
  },
  {
    title: "Ethereum",
    icon: "Ξ",
    color: "#00b0ff",
    subtitle: "ETH: $3,500"
  },
  {
    title: "Taxes",
    icon: "🏛️",
    color: "#a259ff",
    subtitle: "Tax tips & tools"
  },
  {
    title: "Learn to Save",
    icon: "📚",
    color: "#ffd700",
    subtitle: "Smart saving guides"
  },
  {
    title: "Order Physical Card",
    icon: "💳",
    color: "#ff7043",
    subtitle: "Get a real PEPU card"
  },
  {
    title: "Understanding Crypto",
    icon: "🧠",
    color: "#29b6f6",
    subtitle: "Crypto basics explained"
  },
  {
    title: "Create Meme Coin",
    icon: "🐸",
    color: "#81c784",
    subtitle: "Launch on PepeUnchained"
  },
  {
    title: "Bank Transfer",
    icon: "🏦",
    color: "#4dd0e1",
    subtitle: "Send or receive funds"
  }
];

export default function CardScreen() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #2e8b57 0%, #f6f5ef 120%)",
        fontFamily: "system-ui, sans-serif",
        color: "#fff",
        margin: 0,
        padding: 0
      }}
    >
      {/* Green background header */}
      <div
        style={{
          background: "linear-gradient(135deg, #2e8b57 80%, #181c20 100%)",
          height: 180,
          borderBottomLeftRadius: 32,
          borderBottomRightRadius: 32,
          position: "relative"
        }}
      >
        {/* Card - overlaps the green header */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: 60, // moved up!
            transform: "translateX(-50%)",
            width: 320,
            background: "#23272f",
            borderRadius: 20,
            boxShadow: "0 4px 24px #0004",
            padding: 24,
            zIndex: 2
          }}
        >
          <div style={{ fontSize: 22, letterSpacing: 2, marginBottom: 12 }}>
            {card.number}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 16 }}>
            <span>{card.name}</span>
            <span>{card.expiry}</span>
          </div>
          <div style={{ marginTop: 18, fontSize: 18 }}>
            <b>Balance:</b> ${card.balance}
          </div>
          <div style={{ fontSize: 15, color: "#2e8b57", marginTop: 4 }}>
            Status: <b>{card.status}</b>
          </div>
        </div>
      </div>

      {/* Spacer for card overlap */}
      <div style={{ height: 110 }} />

      {/* Grid of boxes */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 20,
          padding: "0 20px",
          marginTop: 10
        }}
      >
        {boxes.map((box, i) => (
          <div
            key={box.title}
            style={{
              background: "#23272f",
              borderRadius: 20,
              padding: "24px 18px",
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              minHeight: 110,
              boxShadow: "0 2px 8px #0002"
            }}
          >
            <div
              style={{
                background: box.color,
                borderRadius: "50%",
                width: 38,
                height: 38,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 22,
                marginBottom: 12
              }}
            >
              {box.icon}
            </div>
            <div style={{ fontWeight: 600, fontSize: 17, marginBottom: 4 }}>
              {box.title}
            </div>
            <div style={{ color: "#aaa", fontSize: 14 }}>{box.subtitle}</div>
          </div>
        ))}
      </div>
      <div style={{ background: "#2e8b57", color: "#fff", padding: "0px" }}>
        {/* all text here will be white */}
      </div>
    </div>
  );
}
