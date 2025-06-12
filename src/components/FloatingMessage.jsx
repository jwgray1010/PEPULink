import React from "react";

export default function FloatingMessage({ message, onClose }) {
  if (!message) return null;
  return (
    <div style={{
      position: "fixed",
      bottom: 32,
      right: 32,
      background: "#23272f",
      color: "#fff",
      padding: "18px 28px",
      borderRadius: 16,
      boxShadow: "0 4px 24px #0008",
      zIndex: 2000,
      fontSize: 18,
      maxWidth: 320,
      display: "flex",
      alignItems: "center",
      gap: 16,
      animation: "fadeIn 0.5s"
    }}>
      <span>{message}</span>
      <button
        onClick={onClose}
        style={{
          background: "none",
          border: "none",
          color: "#fff",
          fontSize: 22,
          marginLeft: 8,
          cursor: "pointer"
        }}
        aria-label="Close"
      >×</button>
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(40px);}
            to { opacity: 1; transform: translateY(0);}
          }
        `}
      </style>
    </div>
  );
}