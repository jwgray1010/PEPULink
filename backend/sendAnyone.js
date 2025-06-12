const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { ethers } = require('ethers');
const EscrowABI = require('../abi/SendAnyoneEscrow.json');
const ESCROW_ADDRESS = process.env.ESCROW_ADDRESS;
const nodemailer = require('nodemailer');

// Install: npm install twilio
const twilio = require('twilio');
const twilioClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);

// Email/SMS setup (see below)

router.post('/send-anyone', async (req, res) => {
  const { amount, recipient, sender } = req.body;
  const claimCode = uuidv4();
  const claimHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(claimCode));

  // 1. Lock funds in escrow contract
  // You must have a funded backend wallet for this, or instruct the frontend to call deposit()
  // Example (backend signs tx):
  // const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
  // const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  // const escrow = new ethers.Contract(ESCROW_ADDRESS, EscrowABI, wallet);
  // await escrow.deposit(claimHash, { value: ethers.utils.parseEther(amount) });

  // 2. Save claimCode, recipient, sender, claimed=false to DB (not shown here)
  // 3. Generate claim link
  const claimLink = `https://yourapp.com/claim/${claimCode}`;

  // 4. Send email/SMS
  if (recipient.includes('@')) {
    await sendEmail(recipient, claimLink);
  } else {
    await sendSMS(recipient, claimLink);
  }

  res.json({ claimLink });
});

async function sendEmail(recipient, claimLink) {
  let transporter = nodemailer.createTransport({
    service: 'gmail', // or your provider
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  await transporter.sendMail({
    from: '"PEPULink" <no-reply@pepulink.com>',
    to: recipient,
    subject: "You've received funds on PEPULink!",
    text: `Claim your funds here: ${claimLink}`,
    html: `<p>Claim your funds here: <a href="${claimLink}">${claimLink}</a></p>`,
  });
}

async function sendSMS(recipient, claimLink) {
  await twilioClient.messages.create({
    body: `You've received funds on PEPULink! Claim here: ${claimLink}`,
    from: process.env.TWILIO_PHONE,
    to: recipient,
  });
}

router.post('/claim', async (req, res) => {
  const { claimCode, recipientAddress } = req.body;
  const claimHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(claimCode));
  // 1. Check DB: not already claimed, exists, etc.
  // 2. Call escrow.claim(claimHash, recipientAddress)
  // 3. Mark as claimed in DB
  res.json({ success: true });
});

module.exports = router;