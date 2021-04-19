pragma solidity ^0.4.21;

import './Token-Basic.sol';

contract Burnable is Token {
	/* This notifies clients about the amount burnt */
	event Burn(address indexed _burner, uint256 _value);

	/// @notice Remove `_value` tokens from the system irreversibly
	/// @param _value the amount of money to burn
	function burn(uint256 _value) public returns (bool) {
		require(_value <= balances[msg.sender]);		  // Check if the sender has enough
		require(tokenSupply - _value >= 0); 		      // Check if there's enough supply
		
		address burner = msg.sender;
		balances[burner] = balances[burner].sub(_value);  // Subtract from the owner
		tokenSupply = tokenSupply.sub(_value);		      // Updates totalSupply
		
		emit Burn(burner, _value);
        emit Transfer(burner, address(0), _value);
		return true;
	}
}
