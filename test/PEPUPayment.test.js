const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PEPUPayment", function () {
  let owner, merchant, user, pepuToken, payment, txId;

  beforeEach(async () => {
    [owner, merchant, user] = await ethers.getSigners();

    // Deploy mock PEPU token
    const Token = await ethers.getContractFactory("MockERC20");
    pepuToken = await Token.deploy("PEPU", "PEPU", 18);

    // Mint tokens to user
    await pepuToken.mint(user.address, ethers.parseEther("1000"));

    // Deploy payment contract
    const Payment = await ethers.getContractFactory("PEPUPayment");
    payment = await Payment.deploy(pepuToken.target);

    // Add merchant
    await payment.connect(owner).addMerchant(merchant.address);

    // Approve payment contract
    await pepuToken.connect(user).approve(payment.target, ethers.parseEther("1000"));

    txId = ethers.keccak256(ethers.toUtf8Bytes("unique-txid-1"));
  });

  it("should allow payment to allowlisted merchant", async () => {
    await expect(
      payment.connect(user).pay(merchant.address, ethers.parseEther("10"), txId)
    ).to.emit(payment, "Payment");
    expect(await pepuToken.balanceOf(merchant.address)).to.equal(ethers.parseEther("10"));
  });

  it("should reject payment to non-merchant", async () => {
    await expect(
      payment.connect(user).pay(user.address, ethers.parseEther("10"), txId)
    ).to.be.revertedWith("Not an allowlisted merchant");
  });

  it("should prevent replay attacks (duplicate txId)", async () => {
    await payment.connect(user).pay(merchant.address, ethers.parseEther("10"), txId);
    await expect(
      payment.connect(user).pay(merchant.address, ethers.parseEther("10"), txId)
    ).to.be.revertedWith("txId already used");
  });

  it("should allow owner to add and remove merchants", async () => {
    await payment.connect(owner).removeMerchant(merchant.address);
    expect(await payment.isMerchant(merchant.address)).to.be.false;
    await payment.connect(owner).addMerchant(merchant.address);
    expect(await payment.isMerchant(merchant.address)).to.be.true;
  });

  it("should not allow non-owner to add merchants", async () => {
    await expect(
      payment.connect(user).addMerchant(user.address)
    ).to.be.revertedWith("Not owner");
  });

  it("should return correct canPay status", async () => {
    expect(await payment.canPay(merchant.address, txId)).to.be.true;
    await payment.connect(user).pay(merchant.address, ethers.parseEther("10"), txId);
    expect(await payment.canPay(merchant.address, txId)).to.be.false;
  });
});