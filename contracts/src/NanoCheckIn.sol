// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract NanoCheckIn {
    string public constant appName = "Nano English";
    
    event PlayerCheckIn(address indexed player, string category, uint256 indexed stageId, uint256 timestamp);

    function checkIn(string calldata category, uint256 stageId) external {
        emit PlayerCheckIn(msg.sender, category, stageId, block.timestamp);
    }
}
