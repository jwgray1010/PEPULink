import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import PEPUCardABI from "../abi/PEPUCard.json";
import homeIcon from "../assets/home.svg";
import { useNavigate } from "react-router-dom";

const CARD_CONTRACT_ADDRESS = process.env.REACT_APP_CARD_CONTRACT_ADDRESS;
const PEPU_DECIMALS = 18;
const AUTO_PRELOAD_AMOUNT = 100; // PEPU tokens to preload if needed

export default function SeamlessPayment({ signer, merchantAddress, purchaseAmount, reference }) {
  const [cardBalance, setCardBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("Starting payment...");
  const navigate = useNavigate();

  useEffect(() => {
    if (!signer) return;
    (async () => {
      try {
        const contract = new ethers.Contract(CARD_CONTRACT_ADDRESS, PEPUCardABI, signer);
        const address = await signer.getAddress();
        let bal = await contract.cardBalances(address);
        bal = Number(ethers.formatUnits(bal, PEPU_DECIMALS));
        setCardBalance(bal);

        const amountToPay = Number(purchaseAmount);

        // If not enough, preload only the needed amount (or AUTO_PRELOAD_AMOUNT, whichever is higher)
        if (bal < amountToPay) {
          setStatus("Preloading card...");
          const preloadAmount = Math.max(amountToPay - bal, AUTO_PRELOAD_AMOUNT);
          const tx1 = await contract.preload(ethers.parseUnits(preloadAmount.toString(), PEPU_DECIMALS));
          await tx1.wait();
        }
        setStatus("Paying merchant...");
        const tx2 = await contract.spend(
          merchantAddress,
          ethers.parseUnits(amountToPay.toString(), PEPU_DECIMALS),
          reference || ""
        );
        await tx2.wait();
        setStatus("Payment complete!");
      } catch (err) {
        setStatus("Payment failed: " + (err.reason || err.message));
      }
      setLoading(false);
    })();
    // eslint-disable-next-line
  }, [signer, merchantAddress, purchaseAmount, reference]);

  return (
    <div>
      {/* Logo as Home button */}
      <div style={{
        display: "flex",
        alignItems: "center",
        padding: 18,
        gap: 12
      }}>
        <img
          src={homeIcon}
          alt="Home"
          aria-label="Go to Dashboard"
          style={{ width: 40, height: 40, cursor: "pointer" }}
          onClick={() => navigate("/")}
          title="Go to Dashboard"
        />
        <h2 style={{ margin: 0 }}>Seamless Payment</h2>
      </div>
      <div style={{ marginBottom: 16 }}>
        {cardBalance !== null && (
          <div>
            Card Balance: <b>{cardBalance} PEPU</b>
          </div>
        )}
        <div>
          Amount to Pay: <b>{purchaseAmount} PEPU</b>
        </div>
      </div>
      <div style={{ fontWeight: 600, color: loading ? "#ffd700" : "#6aff6a" }}>
        {status}
      </div>
    </div>
  );
}