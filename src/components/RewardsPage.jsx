import React, { useEffect, useState } from "react";
import rewardsIcon from "../assets/rewards.svg";

export default function RewardsPage({ userAddress }) {
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRewards() {
      // Replace with your real API endpoint
      const res = await fetch(`/api/rewards?address=${userAddress}`);
      const data = await res.json();
      setRewards(data.rewards || []);
      setLoading(false);
    }
    if (userAddress) fetchRewards();
  }, [userAddress]);

  if (loading) return <div style={{ padding: 32 }}>Loading rewards...</div>;

  return (
    <div style={{ padding: 24 }}>
      <h2>
        <img src={rewardsIcon} alt="Rewards" style={{ width: 32, verticalAlign: "middle", marginRight: 8 }} />
        Your Rewards
      </h2>
      {rewards.length === 0 && <div>No rewards yet. Start spending to earn cashback, NFTs, and badges!</div>}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 24, marginTop: 24 }}>
        {rewards.map((reward, i) => (
          <div key={i} style={{
            background: "#23272f",
            borderRadius: 16,
            padding: 18,
            minWidth: 220,
            maxWidth: 260,
            boxShadow: "0 2px 12px #0004"
          }}>
            <div style={{ marginBottom: 12 }}>
              {reward.icon && <img src={reward.icon} alt="" style={{ width: 40, height: 40 }} />}
              <b style={{ marginLeft: 8 }}>{reward.type}</b>
            </div>
            <div style={{ color: "#6aff6a", fontWeight: 700, fontSize: 18 }}>
              {reward.amount ? `${reward.amount} PEPU` : reward.badge || reward.nftName}
            </div>
            <div style={{ color: "#aaa", fontSize: 14, marginTop: 8 }}>
              {reward.description}
            </div>
            {reward.txHash && (
              <div style={{ fontSize: 12, marginTop: 8 }}>
                <a href={`https://explorer.pepeunchained.com/tx/${reward.txHash}`} target="_blank" rel="noopener noreferrer" style={{ color: "#6aff6a" }}>
                  View on Explorer
                </a>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}