import React from "react";
import { useNavigate } from "react-router-dom";
import homeIcon from "../assets/home.svg";
import logo from "../assets/logo.png";

export default function WhatIsPepu() {
  const navigate = useNavigate();

  return (
    <div style={{
      maxWidth: 600,
      margin: "40px auto",
      background: "#23272f",
      color: "#fff",
      borderRadius: 16,
      padding: 32,
      boxShadow: "0 8px 32px #0008",
      textAlign: "center"
    }}>
      <img src={logo} alt="PEPU Logo" style={{ width: 80, marginBottom: 16 }} />
      <h1 style={{ color: "#ffd700" }}>What is PEPU?</h1>
      <p>
        <b>PEPU</b> is a decentralized payment token designed for fast, low-fee transactions on the PepeUnchained network.<br /><br />
        Use PEPU to pay merchants, tip creators, and access exclusive features in the PEPULink ecosystem.<br /><br />
        <span style={{ color: "#6aff6a" }}>Secure, instant, and community-powered.</span>
      </p>
      <p style={{ marginTop: 32, color: "#aaa" }}>
        Learn more at <a href="https://pepeunchained.com" target="_blank" rel="noopener noreferrer" style={{ color: "#ffd700" }}>pepeunchained.com</a>
      </p>
      <img
        src={homeIcon}
        alt="Home"
        aria-label="Go to Dashboard"
        style={{ width: 40, height: 40, cursor: "pointer" }}
        onClick={() => navigate("/")}
        title="Go to Dashboard"
      />
    </div>
  );
}