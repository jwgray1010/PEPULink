const { ethers } = require('ethers');
const ReceiptABI = require('../abi/ReceiptNFT.json');
const RECEIPT_ADDRESS = process.env.RECEIPT_ADDRESS;
const { Web3Storage, File } = require('web3.storage');

function makeStorageClient() {
  return new Web3Storage({ token: process.env.WEB3_STORAGE_TOKEN });
}

async function uploadMetadata(metadata) {
  const buffer = Buffer.from(JSON.stringify(metadata));
  const files = [new File([buffer], 'metadata.json')];
  const client = makeStorageClient();
  const cid = await client.put(files);
  return `https://${cid}.ipfs.dweb.link/metadata.json`;
}

async function mintReceiptNFT(to, metadata) {
  try {
    // Upload metadata to IPFS
    const uri = await uploadMetadata(metadata);

    // Mint NFT
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    const receipt = new ethers.Contract(RECEIPT_ADDRESS, ReceiptABI, wallet);
    const tx = await receipt.mintReceipt(to, uri);
    const receiptTx = await tx.wait();

    // Find the tokenId from the event logs
    const event = receiptTx.events.find(e => e.event === "Transfer");
    const tokenId = event ? event.args.tokenId.toString() : null;

    return {
      txHash: tx.hash,
      tokenId,
      uri
    };
  } catch (e) {
    console.error("Mint receipt NFT error:", e);
    throw e;
  }
}

module.exports = { mintReceiptNFT, uploadMetadata };