// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ReceiptNFT is ERC721URIStorage, Ownable {
    uint256 public nextTokenId;

    constructor() ERC721("PEPULink Receipt", "PEPURECEIPT") {}

    function mintReceipt(address to, string memory uri) external onlyOwner returns (uint256) {
        uint256 tokenId = nextTokenId++;
        _mint(to, tokenId);
        _setTokenURI(tokenId, uri);
        return tokenId;
    }
}