// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
}

contract PEPUPayment {
    event Payment(address indexed from, address indexed to, uint256 amount, bytes32 indexed txId, string metadata);
    event MerchantAdded(address indexed merchant);
    event MerchantRemoved(address indexed merchant);
    event Paused(bool status);
    event FeeChanged(uint256 feeBps, address feeRecipient);
    event Blacklisted(address indexed merchant, bool status);
    event EscrowPaid(address indexed from, address indexed merchant, uint256 amount, bytes32 indexed txId, string metadata);
    event EscrowWithdrawn(address indexed merchant, uint256 amount);

    IERC20 public pepuToken;
    address public owner;

    // Merchant allowlist
    mapping(address => bool) public isMerchant;

    // Used txIds for replay protection
    mapping(bytes32 => bool) public usedTxIds;

    // Platform fee (basis points, e.g. 100 = 1%)
    uint256 public feeBps = 100;
    address public feeRecipient;

    // Emergency pause
    bool public paused = false;

    // --- Blacklist ---
    mapping(address => bool) public isBlacklisted;
    function blacklistMerchant(address merchant, bool status) external onlyOwner {
        isBlacklisted[merchant] = status;
        emit Blacklisted(merchant, status);
    }

    // --- Escrow ---
    mapping(address => uint256) public merchantBalances;

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier onlyMerchant(address merchant) {
        require(isMerchant[merchant], "Not an allowlisted merchant");
        _;
    }

    modifier notPaused() {
        require(!paused, "Paused");
        _;
    }

    modifier notBlacklisted(address merchant) {
        require(!isBlacklisted[merchant], "Merchant blacklisted");
        _;
    }

    constructor(address _pepuToken) {
        pepuToken = IERC20(_pepuToken);
        owner = msg.sender;
        feeRecipient = msg.sender;
    }

    // --- Merchant Management ---
    function addMerchant(address merchant) external onlyOwner {
        isMerchant[merchant] = true;
        emit MerchantAdded(merchant);
    }

    function removeMerchant(address merchant) external onlyOwner {
        isMerchant[merchant] = false;
        emit MerchantRemoved(merchant);
    }

    // --- Fee Management ---
    function setFee(uint256 _feeBps, address _feeRecipient) external onlyOwner {
        require(_feeBps <= 1000, "Fee too high"); // Max 10%
        feeBps = _feeBps;
        feeRecipient = _feeRecipient;
        emit FeeChanged(_feeBps, _feeRecipient);
    }

    // --- Emergency Pause ---
    function setPaused(bool _paused) external onlyOwner {
        paused = _paused;
        emit Paused(_paused);
    }

    // --- Payment (Direct) ---
    function pay(
        address to,
        uint256 amount,
        bytes32 txId,
        string calldata metadata
    ) external onlyMerchant(to) notPaused notBlacklisted(to) {
        require(amount > 0, "No PEPU sent");
        require(!usedTxIds[txId], "txId already used");
        usedTxIds[txId] = true;

        uint256 fee = (amount * feeBps) / 10000;
        uint256 payout = amount - fee;

        require(pepuToken.transferFrom(msg.sender, to, payout), "Transfer to merchant failed");
        if (fee > 0) {
            require(pepuToken.transferFrom(msg.sender, feeRecipient, fee), "Transfer fee failed");
        }
        emit Payment(msg.sender, to, amount, txId, metadata);
    }

    // --- Payment (Escrow) ---
    function payToEscrow(
        address merchant,
        uint256 amount,
        bytes32 txId,
        string calldata metadata
    ) external onlyMerchant(merchant) notPaused notBlacklisted(merchant) {
        require(amount > 0, "No PEPU sent");
        require(!usedTxIds[txId], "txId already used");
        usedTxIds[txId] = true;
        require(pepuToken.transferFrom(msg.sender, address(this), amount), "Transfer to escrow failed");
        merchantBalances[merchant] += amount;
        emit EscrowPaid(msg.sender, merchant, amount, txId, metadata);
    }

    function withdrawEscrow() external notPaused notBlacklisted(msg.sender) {
        uint256 bal = merchantBalances[msg.sender];
        require(bal > 0, "No escrow balance");
        merchantBalances[msg.sender] = 0;
        require(pepuToken.transfer(msg.sender, bal), "Withdraw failed");
        emit EscrowWithdrawn(msg.sender, bal);
    }

    // --- Read-only Pre-check for Frontend ---
    function canPay(address to, bytes32 txId) external view returns (bool) {
        return isMerchant[to] && !usedTxIds[txId] && !paused && !isBlacklisted[to];
    }

    // --- Ownership Transfer (for multisig/DAO upgrade) ---
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Zero address");
        owner = newOwner;
    }
}