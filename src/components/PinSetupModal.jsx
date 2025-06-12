import React, { useState } from "react";

export default function PinSetupModal({ onClose, onSetPin }) {
  const [pin, setPin] = useState("");

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Set Your PIN</h2>
        <input
          type="password"
          value={pin}
          onChange={e => setPin(e.target.value)}
          maxLength={6}
          placeholder="Enter PIN"
        />
        <button onClick={() => onSetPin(pin)}>Set PIN</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}