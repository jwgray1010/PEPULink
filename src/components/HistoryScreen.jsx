import React, { useEffect, useState } from 'react';

const demoHistory = [
	{
		date: '2025-06-13',
		type: 'topup',
		amount: 100,
		hash: '0xabc123...',
	},
	{
		date: '2025-06-12',
		type: 'payment',
		amount: -25,
		hash: '0xdef456...',
	},
	{
		date: '2025-06-11',
		type: 'reward',
		amount: 5,
		hash: '0xghi789...',
	},
];

const transactions = [
	{ icon: '🏪', title: 'BURGER PALACE', time: 'Just now', amount: -8.5 },
	{ icon: '🏦', title: 'BANK', time: 'Today', amount: 125000 },
	{ icon: '☕️', title: 'COFFEE SHOP', time: 'Yesterday', amount: -4.5 },
	{ icon: '💸', title: 'REQUEST FROM ALICE', time: '1 min ago', amount: 50 },
	{ icon: '💳', title: 'CARD LOAD', time: 'Today', amount: 100 },
	{ icon: '🍔', title: 'FAST FOOD', time: 'Yesterday', amount: -12 },
	{ icon: '🎁', title: 'GIFT RECEIVED', time: '3 days ago', amount: 20 },
];

export default function HistoryScreen() {
	const [history, setHistory] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error] = useState(null);

	useEffect(() => {
		// For demo: always use demoHistory
		setHistory(demoHistory);
		setLoading(false);
	}, []);

	if (loading)
		return <div className="history-screen loading">Loading history...</div>;
	if (error) return <div className="history-screen error">{error}</div>;

	return (
		<div
			className="history-screen"
			style={{
				width: '100vw',
				minHeight: '100vh',
				background: "linear-gradient(180deg, #2e8b57 0%, #f6f5ef 120%)",
				color: "#23272f",
				margin: 0,
				padding: 0,
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
			}}
		>
			<div
				style={{
					background: "#174c31",
					borderRadius: 50,
					boxShadow: "0 4px 16px #0002",
					margin: "80px auto 0 auto",
					maxWidth: 420,
					width: "90vw",
					padding: "40px 24px 24px 24px",
				}}
			>
				<div
					style={{
						fontWeight: 900,
						fontSize: 28,
						marginBottom: 18,
						color: "#fff",
						textAlign: "center",
						letterSpacing: 1,
					}}
				>
					Transaction History
				</div>
				<div>
					{transactions.map((a, i) => (
						<div
							key={i}
							style={{
								background: "#181c20",
								borderRadius: 14,
								boxShadow: "0 2px 8px #0006",
								padding: "16px 18px",
								display: "flex",
								alignItems: "center",
								justifyContent: "space-between",
								marginBottom: 16,
							}}
						>
							<div style={{ display: "flex", alignItems: "center", gap: 12 }}>
								<span
									style={{
										fontSize: 26,
										background: "#23272f",
										borderRadius: "50%",
										width: 38,
										height: 38,
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
									}}
								>
									{a.icon}
								</span>
								<div>
									<div style={{ fontWeight: 600, color: "#fff" }}>{a.title}</div>
									<div style={{ color: "#aaa", fontSize: 13 }}>{a.time}</div>
								</div>
							</div>
							<div
								style={{
									fontWeight: 700,
									color: a.amount > 0 ? "#00e676" : "#ff4d4f",
									fontSize: 20,
									minWidth: 80,
									textAlign: "right",
								}}
							>
								{a.amount > 0 ? "+" : ""}
								${Math.abs(a.amount).toLocaleString()}
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}