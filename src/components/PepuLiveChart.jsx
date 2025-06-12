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
        background: "linear-gradient(135deg, #181c20 0%, #23272b 100%)",
        padding: 0,
        margin: 0,
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
      }}
    >
      <div
        style={{
          background: "#23272b",
          borderRadius: 24,
          boxShadow: "0 8px 32px #000a",
          maxWidth: 480,
          width: "100%",
          margin: "32px auto 0 auto",
          padding: "32px 24px 24px 24px",
          color: "#fff",
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
              color: "#ffd700",
            }}
          >
            PEPU Live Price Chart
          </span>
        </div>
        <iframe
          src="https://www.geckoterminal.com/eth/pools/0xb1b10b05aa043dd8d471d4da999782bc694993e3ecbe8e7319892b261b412ed5?embed=1"
          height="420"
          style={{
            width: "100%",
            border: 0,
            borderRadius: 16,
            background: "#181c20",
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
            style={{ color: "#ffd700", textDecoration: "underline" }}
          >
            CoinGecko
          </a>
        </div>
      </div>
    </div>
  );
}