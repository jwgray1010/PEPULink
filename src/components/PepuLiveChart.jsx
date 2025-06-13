import React from "react";
import { useNavigate } from "react-router-dom";
import homeIcon from "../assets/home.svg";

export default function PepuLiveChart() {
  const navigate = useNavigate();

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
      <div
        style={{
          background: "#ffffff",
          borderRadius: 32,
          boxShadow: "0 8px 32px #000a",
          maxWidth: 900, // increased from 480
          width: "95vw",
          margin: "32px auto 0 auto",
          padding: "32px 24px 24px 24px",
          color: "#23272f",
          textAlign: "center",
        }}
      >
        {/* Logo as Home button */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 12,
          }}
        >
          <img
            src={homeIcon}
            alt="Home"
            aria-label="Go to Dashboard"
            style={{ width: 40, height: 40, cursor: "pointer" }}
            onClick={() => navigate("/")}
            title="Go to Dashboard"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") navigate("/");
            }}
          />
          <span
            style={{
              fontSize: "2.1em",
              fontWeight: 800,
              letterSpacing: "-1px",
              color: "#2e8b57",
            }}
          >
            PEPU Live Price Chart
          </span>
        </div>
        <iframe
          src="https://www.geckoterminal.com/eth/pools/0xb1b10b05aa043dd8d471d4da999782bc694993e3ecbe8e7319892b261b412ed5?embed=1"
          height="600" // increased from 420
          style={{
            width: "100%",
            minHeight: 400,
            border: 0,
            borderRadius: 24,
            background: "#f6f5ef",
            boxShadow: "0 2px 12px #0006",
          }}
          title="PEPU Live Chart"
          allowFullScreen={true}
        />
        <div
          style={{
            textAlign: "center",
            marginTop: 18,
            fontSize: "1em",
            color: "#aaa",
          }}
        >
          Powered by{" "}
          <a
            href="https://www.coingecko.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#2e8b57", textDecoration: "underline" }}
          >
            CoinGecko
          </a>
        </div>
      </div>
    </div>
  );
}