import React from "react";

export default function SpendingLimitSetter({ categories, limits, onSetLimit }) {
  return (
    <div>
      <h3>Set Spending Limits</h3>
      {categories.map(cat => (
        <div key={cat} style={{ marginBottom: 8 }}>
          <label>
            {cat} limit: $
            <input
              type="number"
              value={limits[cat] || ""}
              onChange={e => onSetLimit(cat, Number(e.target.value))}
              min={0}
              style={{ width: 80, marginLeft: 8 }}
            />
          </label>
        </div>
      ))}
    </div>
  );
}