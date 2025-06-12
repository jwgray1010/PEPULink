import React, { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import jsPDF from "jspdf";

ChartJS.register(ArcElement, Tooltip, Legend);

function categorize(tx) {
  // Simple categorization logic; replace with your own or use AI for more accuracy
  const desc = (tx.description || "").toLowerCase();
  if (desc.includes("coffee") || desc.includes("cafe")) return "Food & Drink";
  if (desc.includes("uber") || desc.includes("lyft") || desc.includes("taxi")) return "Transport";
  if (desc.includes("rent") || desc.includes("apartment")) return "Housing";
  if (desc.includes("grocery") || desc.includes("market")) return "Groceries";
  if (desc.includes("subscription") || desc.includes("netflix") || desc.includes("spotify")) return "Subscriptions";
  if (desc.includes("utility") || desc.includes("electric") || desc.includes("water")) return "Utilities";
  return "Other";
}

const CARD_BG = "#f6f5ef";
const CARD_TEXT = "#23272f";
const BUTTON_BG = "#22543d";
const BUTTON_TEXT = "#fff";
const BUTTON_RADIUS = 16;

export default function SmartSpendingAI({ txHistory = [], goals = [], spendingLimits = {} }) {
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState(null);
  const [anomalyFeedback, setAnomalyFeedback] = useState({});

  useEffect(() => {
    if (!txHistory || txHistory.length === 0) {
      setInsights({
        optimization: "No transactions found. Start spending to get insights!",
        savingsGoal: "Set a savings goal to begin.",
        recurring: "No recurring payments detected yet.",
        categories: {},
        anomalies: [],
        goalsProgress: [],
      });
      setLoading(false);
      return;
    }

    // --- Categorization ---
    let categories = {};
    let totalSpent = 0;
    let recurring = {};
    let anomalies = [];
    let lastMonth = Date.now() - 30 * 24 * 60 * 60 * 1000;

    // --- Recurring detection ---
    let recurringCandidates = {};

    txHistory.forEach((tx) => {
      if (tx.type === "debit" && tx.timestamp > lastMonth) {
        totalSpent += Number(tx.amount);
        // Categorize
        const cat = categorize(tx);
        categories[cat] = (categories[cat] || 0) + Number(tx.amount);

        // Recurring detection by merchant+amount
        const key = `${tx.merchant || "unknown"}:${tx.amount}`;
        recurringCandidates[key] = (recurringCandidates[key] || 0) + 1;

        // Simple anomaly: large transactions
        if (Number(tx.amount) > 500) {
          anomalies.push(`Large transaction: $${tx.amount} to ${tx.merchant || "unknown"} on ${new Date(tx.timestamp).toLocaleDateString()}`);
        }
      }
    });

    // Find most recurring
    const recurringSorted = Object.entries(recurringCandidates).sort((a, b) => b[1] - a[1]);
    const mostRecurring = recurringSorted[0];

    // --- Goals Progress ---
    let goalsProgress = [];
    goals.forEach(goal => {
      // Example goal: { type: "save", target: 200, period: "month" }
      if (goal.type === "save") {
        const saved = goal.target - totalSpent;
        const percent = Math.max(0, Math.min(100, ((saved / goal.target) * 100)));
        goalsProgress.push(`Saved $${saved > 0 ? saved.toFixed(2) : 0} of $${goal.target} (${percent.toFixed(0)}%)`);
      }
    });

    setInsights({
      optimization:
        totalSpent > 0
          ? `You spent $${totalSpent.toFixed(2)} in the last 30 days. Consider consolidating small payments for lower fees.`
          : "No spending detected in the last 30 days.",
      savingsGoal:
        totalSpent > 0
          ? `If you save 10% of your spending, you'll have $${(totalSpent * 0.1).toFixed(2)} extra next month.`
          : "Set a savings goal to start building your future.",
      recurring:
        mostRecurring && mostRecurring[1] > 1
          ? `Recurring payment detected: ${mostRecurring[0].split(":")[0]} ($${mostRecurring[0].split(":")[1]}, ${mostRecurring[1]} times). Consider pre-converting PEPU for this.`
          : "No recurring payments detected yet.",
      categories,
      anomalies,
      goalsProgress,
    });
    setLoading(false);
  }, [txHistory, goals]);

  if (loading) return <div>Analyzing your spending patterns...</div>;

  // Prepare pie chart data
  const pieData = {
    labels: Object.keys(insights.categories),
    datasets: [
      {
        data: Object.values(insights.categories),
        backgroundColor: [
          "#6aff6a", "#ffd700", "#ff4d4f", "#36a2eb", "#a259ff", "#ffb86c", "#50fa7b"
        ],
      },
    ],
  };

  function markAnomaly(anomaly, status) {
    setAnomalyFeedback(fb => ({ ...fb, [anomaly]: status }));
    // Optionally, send feedback to backend for future learning
  }

  function exportCSV() {
    const rows = [
      ["Category", "Amount"],
      ...Object.entries(insights.categories || {})
    ];
    const csvContent = rows.map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "spending_report.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportPDF() {
    const doc = new jsPDF();
    doc.text("Spending Report", 10, 10);
    let y = 20;
    Object.entries(insights.categories || {}).forEach(([cat, amt]) => {
      doc.text(`${cat}: $${amt}`, 10, y);
      y += 10;
    });
    doc.save("spending_report.pdf");
  }

  return (
    <div
      style={{
        color: CARD_TEXT,
        background: CARD_BG,
        borderRadius: 24,
        padding: 28,
        maxWidth: 420,
        margin: "32px auto",
        boxShadow: "0 4px 24px #0001",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif"
      }}
    >
      <h3 style={{ color: "#22543d", marginBottom: 24 }}>AI Smart Spending Insights</h3>
      <ul style={{ textAlign: "left", margin: "1em 0" }}>
        <li>
          <b>Optimize:</b> {insights.optimization}
        </li>
        <li>
          <b>Savings Goal:</b> {insights.savingsGoal}
        </li>
        <li>
          <b>Recurring:</b> {insights.recurring}
        </li>
      </ul>
      {Object.keys(insights.categories).length > 0 && (
        <div style={{ margin: "24px 0" }}>
          <b>Spending by Category:</b>
          <Pie data={pieData} options={{
            plugins: {
              legend: { position: "bottom", labels: { color: "#23272f" } },
            },
          }} />
        </div>
      )}
      {insights.goalsProgress && insights.goalsProgress.length > 0 && (
        <div style={{ margin: "24px 0" }}>
          <b>Goals Progress:</b>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {insights.goalsProgress.map((g, i) => (
              <li key={i} style={{ marginBottom: 8 }}>
                <div>{g}</div>
                {/* Extract % from string and show progress bar */}
                {/\d+%/.test(g) && (
                  <div style={{ background: "#eee", borderRadius: 6, overflow: "hidden", height: 12, marginTop: 2 }}>
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
      {insights.anomalies && insights.anomalies.length > 0 && (
        <div style={{ margin: "24px 0", background: "#ff4d4f22", borderRadius: 8, padding: 12 }}>
          <b style={{ color: "#ff4d4f" }}>Anomalies Detected:</b>
          <ul>
            {insights.anomalies.map((a, i) => (
              <li key={i}>
                {a}
                <button style={{ marginLeft: 8 }} onClick={() => markAnomaly(a, "safe")}>Mark Safe</button>
                <button style={{ marginLeft: 4 }} onClick={() => markAnomaly(a, "fraud")}>Report Fraud</button>
                {anomalyFeedback[a] && (
                  <span style={{ marginLeft: 8, color: anomalyFeedback[a] === "safe" ? "green" : "red" }}>
                    {anomalyFeedback[a] === "safe" ? "Marked Safe" : "Reported Fraud"}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
      {Object.entries(insights.categories || {}).map(([cat, amt]) => {
        const limit = spendingLimits[cat];
        if (limit && amt >= 0.9 * limit) {
          return (
            <div key={cat} style={{ color: "#ff4d4f", margin: "8px 0" }}>
              ⚠️ You’ve spent {Math.round((amt / limit) * 100)}% of your {cat} limit (${amt} / ${limit})
            </div>
          );
        }
        return null;
      })}
      {insights.recurringPayments && insights.recurringPayments.length > 0 && (
        <div style={{ margin: "24px 0" }}>
          <b>Recurring Payments:</b>
          <ul>
            {insights.recurringPayments.map((rec, i) => (
              <li key={i}>
                {rec.merchant} — ${rec.amount} every {rec.frequency}
                <button onClick={() => handleEditRecurring(rec)}>Edit</button>
                <button onClick={() => handleCancelRecurring(rec)}>Cancel</button>
              </li>
            ))}
          </ul>
        </div>
      )}
      <button
        onClick={exportCSV}
        style={{
          background: BUTTON_BG,
          color: BUTTON_TEXT,
          border: "none",
          borderRadius: BUTTON_RADIUS,
          padding: "14px 0",
          width: "100%",
          fontWeight: 600,
          fontSize: 18,
          marginBottom: 16,
          marginTop: 16,
          cursor: "pointer",
          boxShadow: "0 2px 8px #0001"
        }}
      >
        Export Spending by Category (CSV)
      </button>
      <button
        onClick={exportPDF}
        style={{
          background: BUTTON_BG,
          color: BUTTON_TEXT,
          border: "none",
          borderRadius: BUTTON_RADIUS,
          padding: "14px 0",
          width: "100%",
          fontWeight: 600,
          fontSize: 18,
          marginBottom: 16,
          marginTop: 0,
          cursor: "pointer",
          boxShadow: "0 2px 8px #0001"
        }}
      >
        Export Spending by Category (PDF)
      </button>
      <div style={{ fontSize: 13, color: "#888", marginTop: 16 }}>
        Powered by PEPULink AI. No personal data leaves your wallet.
      </div>
    </div>
  );
}

