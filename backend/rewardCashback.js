try {
  const cashback = Math.floor(purchaseAmount * 0.03);
  await pepuTokenContract.rewardCashback(userAddress, cashback);
  console.log(`Cashback of ${cashback} PEPU sent to ${userAddress}`);
} catch (e) {
  console.error("Cashback error:", e);
}

try {
  if (Math.random() < 0.05) {
    await mintReceiptNFT(userAddress, { ...metadata, special: "Random Drop!" });
    console.log(`Random NFT drop sent to ${userAddress}`);
  }
} catch (e) {
  console.error("Random NFT drop error:", e);
}

try {
  if (userTotalSpend > 1000 && !hasGoldBadge(userAddress)) {
    await mintLoyaltyBadgeNFT(userAddress, "Gold");
    console.log(`Gold badge minted for ${userAddress}`);
  }
} catch (e) {
  console.error("Loyalty badge error:", e);
}

// Example Express route
router.get('/rewards', async (req, res) => {
  const { address } = req.query;
  // Fetch from DB: cashback, NFT drops, badges, etc.
  const rewards = await getUserRewards(address); // Implement this!
  res.json({ rewards });
});

// Reward object structure
/*
{
  type: "Cashback" | "NFT Drop" | "Loyalty Badge",
  amount: "12.5", // for cashback
  badge: "Gold", // for badge
  nftName: "Coffee Receipt", // for NFT
  icon: "/assets/pepu.svg" | "/assets/badge-gold.svg" | "/assets/nft.svg",
  description: "3% cashback for your last purchase",
  txHash: "0x123..."
}
*/