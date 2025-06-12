// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SendAnyoneEscrow {
    struct Escrow {
        address sender;
        uint256 amount;
        bool claimed;
    }

    mapping(bytes32 => Escrow) public escrows;

    event Deposited(bytes32 claimCode, address indexed sender, uint256 amount);
    event Claimed(bytes32 claimCode, address indexed recipient);

    function deposit(bytes32 claimCode) external payable {
        require(msg.value > 0, "No value sent");
        require(escrows[claimCode].amount == 0, "Already exists");
        escrows[claimCode] = Escrow(msg.sender, msg.value, false);
        emit Deposited(claimCode, msg.sender, msg.value);
    }

    function claim(bytes32 claimCode, address recipient) external {
        Escrow storage e = escrows[claimCode];
        require(!e.claimed, "Already claimed");
        require(e.amount > 0, "No escrow found");
        e.claimed = true;
        (bool sent, ) = recipient.call{value: e.amount}("");
        require(sent, "Transfer failed");
        emit Claimed(claimCode, recipient);
    }
}