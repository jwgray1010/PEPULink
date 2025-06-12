const express = require('express');
const router = express.Router();
const { mintReceiptNFT } = require('./receipt');
const { isAddress } = require('ethers').utils;
const rateLimit = require('express-rate-limit');
const ReceiptLog = require('./models/ReceiptLog');

const mintLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // limit each IP to 5 requests per windowMs
  message: { error: "Too many mint requests, please try again later." }
});

router.post('/mint-receipt', mintLimiter, async (req, res) => {
  const { to, metadata } = req.body;

  // Validate recipient address
  if (!to || !isAddress(to)) {
    return res.status(400).json({ error: "Invalid recipient address" });
  }

  // Validate metadata (example: require name, amount, merchant)
  if (
    !metadata ||
    typeof metadata !== "object" ||
    !metadata.name ||
    !metadata.amount ||
    !metadata.merchant
  ) {
    return res.status(400).json({ error: "Invalid or incomplete metadata" });
  }

  metadata.loyaltyLevel = metadata.loyaltyLevel || "None";
  metadata.warrantyPeriod = metadata.warrantyPeriod || "None";
  metadata.qrCode = `https://yourapp.com/receipt/${result.tokenId}`;

  try {
    const result = await mintReceiptNFT(to, metadata);
    await ReceiptLog.create({
      to,
      metadata,
      txHash: result.txHash,
      tokenId: result.tokenId,
      uri: result.uri,
      timestamp: new Date()
    });
    res.json({
      ...result,
      metadata,
      message: "Receipt NFT minted successfully!"
    });
  } catch (e) {
    console.error("Mint receipt NFT error:", e);
    res.status(500).json({ error: "Failed to mint receipt NFT" });
  }
});

module.exports = router;