import React, { useState } from "react";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

// Helper to call your backend AI endpoint
async function getSmartSpendingInsights({ txHistory, question, goals = [], categories = [] }) {
  const res = await fetch('/api/ai/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ txHistory, question, goals, categories }),
  });
  return await res.json();
}

export default function SmartSpendingAIChat({ txHistory = [], goals = [], categories = [] }) {
  const [userQuestion, setUserQuestion] = useState('');
  const [aiData, setAiData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleAskAI() {
    setLoading(true);
    setError('');
    setAiData(null);
    try {
      const data = await getSmartSpendingInsights({ txHistory, question: userQuestion, goals, categories });
      setAiData(data);
    } catch (e) {
      setError('AI service error. Please try again later.');
    }
    setLoading(false);
  }

  // Prepare chart data if available
  let pieData, pieOptions;
  if (aiData && aiData.categories && Object.keys(aiData.categories).length > 0) {
    const labels = Object.keys(aiData.categories);
    const values = Object.values(aiData.categories).map(Number);
    pieData = {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: [
            "#6aff6a", "#ffd700", "#ff4d4f", "#36a2eb", "#a259ff", "#ffb86c", "#50fa7b"
          ],
        },
      ],
    };
    pieOptions = {
      plugins: {
        legend: { position: "bottom", labels: { color: "#fff" } },
      },
    };
  }

  return (
    <div style={{ maxWidth: 600, margin: "32px auto", background: "#23272f", color: "#fff", borderRadius: 16, padding: 24 }}>
      <h2 style={{ color: "#6aff6a" }}>Smart Spending AI</h2>
      <input
        value={userQuestion}
        onChange={e => setUserQuestion(e.target.value)}
        placeholder="Ask about your spending, e.g. 'How much did I spend on food?'"
        style={{ width: "100%", padding: 12, borderRadius: 8, border: "none", marginBottom: 12 }}
      />
      <button onClick={handleAskAI} disabled={loading || !userQuestion} style={{ padding: "10px 24px", borderRadius: 8, background: "#6aff6a", color: "#23272f", fontWeight: 700 }}>
        {loading ? "Thinking..." : "Ask AI"}
      </button>
      {error && <div style={{ color: "#ff4d4f", marginTop: 12 }}>{error}</div>}
      {aiData && (
        <div style={{ marginTop: 24 }}>
          <h3 style={{ color: "#ffd700" }}>AI Insights</h3>
          <div>
            <b>Summary:</b> {aiData.answer}
          </div>
          {pieData && (
            <div style={{ marginTop: 24 }}>
              <b>Spending by Category:</b>
              <Pie data={pieData} options={pieOptions} />
            </div>
          )}
          {aiData.anomalies && aiData.anomalies.length > 0 && (
            <div style={{ marginTop: 24, background: "#ff4d4f22", borderRadius: 8, padding: 12 }}>
              <b style={{ color: "#ff4d4f" }}>Anomalies Detected:</b>
              <ul>
                {aiData.anomalies.map((a, i) => (
                  <li key={i}>{a}</li>
                ))}
              </ul>
            </div>
          )}
          {aiData.goals && aiData.goals.length > 0 && (
            <div style={{ marginTop: 24 }}>
              <b>Goals Progress:</b>
              <ul style={{ listStyle: "none", padding: 0 }}>
                {aiData.goals.map((g, i) => (
                  <li key={i} style={{ marginBottom: 8 }}>
                    <div>{g}</div>
                    {/* Example: extract % from string and show progress bar */}
                    {/\d+%/.test(g) && (
                      <div style={{ background: "#333", borderRadius: 6, overflow: "hidden", height: 12, marginTop: 2 }}>
                        <div
                          style={{
                            width: g.match(/(\d+)%/)[1] + "%",
                            background: "#6aff6a",
                            height: "100%",
                          }}
                        />
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {aiData.recurring && (
            <div style={{ marginTop: 24 }}>
              <b>Recurring Payments:</b>
              <div>{aiData.recurring}</div>
            </div>
          )}
          {aiData.recommendations && (
            <div style={{ marginTop: 24, background: "#ffd70022", borderRadius: 8, padding: 12 }}>
              <b style={{ color: "#ffd700" }}>Recommendations:</b>
              <div>{aiData.recommendations}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
