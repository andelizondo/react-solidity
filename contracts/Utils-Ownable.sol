pragma solidity ^0.4.21;

contract Ownable {
	// Makes the token ownable to provide security features

	// Account-Address that owns the contract
	address public owner;

	/* This notifies clients about a change of ownership */
	event OwnershipChange(address indexed _owner);

	// Initializes the contract and sets the owner to the contract creator
	function Ownable() public {
		owner = msg.sender;
	}

	// This modifier is used to execute functions only by the owner of the contract
	modifier onlyOwner {
		require(msg.sender == owner);
		_;
	}

	// Transfers the ownership of the contract to another address
	function transferOwnership(address _newOwner) public onlyOwner returns (bool success) {
		require(_newOwner != address(0));
		owner = _newOwner;
		emit OwnershipChange(owner);
		return true;
	}
}
