// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
}

contract PEPUCard {
    IERC20 public pepuToken;
    address public admin;

    mapping(address => uint256) public cardBalances;

    event CardPreloaded(address indexed user, uint256 amount);
    event CardSpent(address indexed user, address indexed merchant, uint256 amount, string reference);
    event CardWithdrawn(address indexed user, uint256 amount);
    event CardFrozen(address indexed user, bool frozen);

    mapping(address => bool) public frozen;

    modifier notFrozen(address user) {
        require(!frozen[user], "Card is frozen");
        _;
    }

    constructor(address _pepuToken) {
        pepuToken = IERC20(_pepuToken);
        admin = msg.sender;
    }

    // User preloads tokens onto their card
    function preload(uint256 amount) external notFrozen(msg.sender) {
        require(amount > 0, "Amount must be > 0");
        require(pepuToken.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        cardBalances[msg.sender] += amount;
        emit CardPreloaded(msg.sender, amount);
    }

    // User spends from card to merchant
    function spend(address merchant, uint256 amount, string calldata reference) external notFrozen(msg.sender) {
        require(cardBalances[msg.sender] >= amount, "Insufficient card balance");
        cardBalances[msg.sender] -= amount;
        require(pepuToken.transfer(merchant, amount), "Transfer to merchant failed");
        emit CardSpent(msg.sender, merchant, amount, reference);
    }

    // User withdraws from card back to wallet
    function withdraw(uint256 amount) external notFrozen(msg.sender) {
        require(cardBalances[msg.sender] >= amount, "Insufficient card balance");
        cardBalances[msg.sender] -= amount;
        require(pepuToken.transfer(msg.sender, amount), "Withdraw failed");
        emit CardWithdrawn(msg.sender, amount);
    }

    // Admin can freeze/unfreeze cards (for compliance, lost card, etc.)
    function setFrozen(address user, bool status) external {
        require(msg.sender == admin, "Not admin");
        frozen[user] = status;
        emit CardFrozen(user, status);
    }

    // Admin can withdraw tokens (for fiat settlement, optional)
    function adminWithdraw(address to, uint256 amount) external {
        require(msg.sender == admin, "Not admin");
        require(pepuToken.transfer(to, amount), "Admin withdraw failed");
    }

    // Ownership transfer
    function transferAdmin(address newAdmin) external {
        require(msg.sender == admin, "Not admin");
        require(newAdmin != address(0), "Zero address");
        admin = newAdmin;
    }
}