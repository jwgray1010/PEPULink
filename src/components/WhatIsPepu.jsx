import React from "react";

export default function WhatIsPepu() {
  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100vw",
        background: "linear-gradient(180deg, #2e8b57 0%, #f6f5ef 120%)",
        color: "#23272f",
        margin: 0,
        padding: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
      }}
    >
      {/* Your What is PEPU content here */}
      <div style={{
        background: "#fff",
        borderRadius: 20,
        boxShadow: "0 4px 24px #0001",
        margin: "48px auto 0 auto",
        padding: "32px 24px",
        maxWidth: 420,
        width: "90%",
        textAlign: "center"
      }}>
        <h1 style={{ color: "#2e8b57", fontWeight: 700 }}>What is PEPU?</h1>
        <p style={{ fontSize: 18, marginTop: 18 }}>
          PEPU is a fast, low-fee payment platform designed for modern digital finance. 
          Instantly send, receive, and manage your money with ease, security, and transparency.
        </p>
        <ul style={{ textAlign: "left", margin: "24px auto 0 auto", maxWidth: 340, color: "#23272f" }}>
          <li>⚡ Instant transactions</li>
          <li>🔒 Secure and private</li>
          <li>💸 Low fees</li>
          <li>🌍 Global access</li>
        </ul>
      </div>
    </div>
  );
}