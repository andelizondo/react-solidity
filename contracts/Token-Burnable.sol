pragma solidity ^0.4.15;

import './Token-Basic.sol';

contract Burnable is Token {
	/* This notifies clients about the amount burnt */
	event Burn(address indexed _from, uint256 _value);

	/// @notice Remove `_value` tokens from the system irreversibly
	/// @param _value the amount of money to burn
	function burn(uint256 _value) onlyOwner returns (bool success) {
		require (balanceOf[owner] >= _value);			 // Check if the sender has enough
		require (totalSupply - _value >= 0); 			 // Check if there's enough supply
		balanceOf[owner] -= _value;						 // Subtract from the owner
		totalSupply -= _value;							 // Updates totalSupply
		Burn(owner, _value);
		return true;
	}
}
