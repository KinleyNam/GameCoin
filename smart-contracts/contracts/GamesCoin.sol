// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

error OwnableNotOwner();

contract GamesCoin is ERC20, Ownable {
    constructor() ERC20("GamesCoin", "GC") Ownable(msg.sender){
        _mint(msg.sender, 0 * 10 ** decimals());
    }

    function rewardPlayer(address to, uint256 amount) external {
        if (msg.sender != owner()) revert OwnableNotOwner();
        _mint(to, amount);
    }

    function burn(uint256 amount) external {
        _burn(_msgSender(), amount);
    }

    function burnFrom(address account, uint256 amount) external {
        uint256 currentAllowance = allowance(account, _msgSender());
        require(currentAllowance >= amount, "ERC20: burn amount exceeds allowance");
        _approve(account, _msgSender(), currentAllowance - amount);
        _burn(account, amount);
    }
}