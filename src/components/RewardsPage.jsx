import React, { useEffect, useState } from "react";
import rewardsIcon from "../assets/rewards.svg";

const demoRewards = [
	{
		icon: rewardsIcon,
		type: "Cashback",
		amount: 12.5,
		description: "Earned 1% cashback on purchases.",
		txHash: "0x1234abcd",
	},
	{
		icon: rewardsIcon,
		type: "NFT Badge",
		badge: "Early Adopter",
		description: "Awarded for being one of the first 100 users.",
		txHash: null,
	},
	{
		icon: rewardsIcon,
		type: "Milestone",
		amount: 100,
		description: "Spent over 100 PEPU in a month.",
		txHash: "0x5678efgh",
	},
];

export default function RewardsPage() {
	return (
		<div
			style={{
				padding: 24,
				minHeight: "100vh",
				background:
					"linear-gradient(180deg, #2e8b57 0%, #f6f5ef 120%)",
				color: "#23272f",
			}}
		>
			<h2>
				<img
					src={rewardsIcon}
					alt="Rewards"
					style={{
						width: 32,
						verticalAlign: "middle",
						marginRight: 8,
					}}
				/>
				Demo Rewards
			</h2>
			<div style={{ color: "#aaa", marginBottom: 16 }}>
				This is a demo rewards page for developers. No wallet required.
			</div>
			<div
				style={{
					display: "flex",
					flexWrap: "wrap",
					gap: 24,
					marginTop: 24,
				}}
			>
				{demoRewards.map((reward, i) => (
					<div
						key={i}
						style={{
							background: "#23272f",
							borderRadius: 16,
							padding: 18,
							minWidth: 220,
							maxWidth: 260,
							boxShadow: "0 2px 12px #0004",
						}}
					>
						<div style={{ marginBottom: 12 }}>
							{reward.icon && (
								<img
									src={reward.icon}
									alt=""
									style={{ width: 40, height: 40 }}
								/>
							)}
							<b style={{ marginLeft: 8 }}>{reward.type}</b>
						</div>
						<div
							style={{
								color: "#6aff6a",
								fontWeight: 700,
								fontSize: 18,
							}}
						>
							{reward.amount
								? `${reward.amount} PEPU`
								: reward.badge}
						</div>
						<div
							style={{
								color: "#aaa",
								fontSize: 14,
								marginTop: 8,
							}}
						>
							{reward.description}
						</div>
						{reward.txHash && (
							<div style={{ fontSize: 12, marginTop: 8 }}>
								<a
									href={`https://explorer.pepeunchained.com/tx/${reward.txHash}`}
									target="_blank"
									rel="noopener noreferrer"
									style={{ color: "#6aff6a" }}
								>
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