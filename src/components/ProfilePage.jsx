import React, { useState } from "react";

export default function ProfilePage() {
  const [limits, setLimits] = useState({});

  const handleSetLimit = (category, value) => {
    setLimits(prevLimits => ({ ...prevLimits, [category]: value }));
  };

  const categories = ["Food", "Transport", "Entertainment"]; // Example categories

  return (
    <div style={{ padding: 32 }}>
      <h2>Profile / Settings</h2>
      <div>
        <h3>Set Spending Limits</h3>
        {categories.map(cat => (
          <div key={cat}>
            <label>
              {cat} limit: $
              <input
                type="number"
                value={limits[cat] || ""}
                onChange={e => handleSetLimit(cat, Number(e.target.value))}
                min={0}
                style={{ width: 80, marginLeft: 8 }}
              />
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}