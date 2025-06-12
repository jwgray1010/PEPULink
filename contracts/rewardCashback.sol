function rewardCashback(address user, uint256 purchaseAmount) external onlyOwner {
    uint256 reward = (purchaseAmount * 3) / 100;
    _mint(user, reward); // or transfer if using an ERC20
}