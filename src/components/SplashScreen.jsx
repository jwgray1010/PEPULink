import React from "react";
import logo from "../assets/logo.png";

export default function SplashScreen() {
  return (
    <div
      style={{
        background: "#000",
        width: "100vw",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <img
        src={logo}
        alt="PEPULink Logo"
        style={{
          width: 120,
          height: 120,
          animation: "pulse 1.5s infinite",
        }}
      />
      <style>
        {`
          @keyframes pulse {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.15); opacity: 0.7; }
            100% { transform: scale(1); opacity: 1; }
          }
        `}
      </style>
    </div>
  );
}