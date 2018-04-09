pragma solidity ^0.4.21;

import './Token-Basic.sol';

contract Mintable is Token {
    /* If minting is disabled no more tokens can be created */
    bool public mintingEnabled = true;
    
    /** List of agents that are allowed to create new tokens */
    mapping (address => bool) public mintAgents;
    
    /* This notifies clients about the amount minted */
    event Mint(address indexed _to, uint256 _value);
    event MintDisabled(address indexed _from);
    event MintEnabled(address indexed _from);
    event MintingAgentApproved(address indexed _agentAddress, bool _approved);

    // Initializes the contract and sets the owner as minting agent
	function Mintable() public {
		mintAgents[owner] = true;
	}

    // Only crowdsale contracts are allowed to mint new tokens
    modifier onlyMintAgent() {
        require(mintAgents[msg.sender]);
        _;
    }
    // Make sure minting is still possible.
    modifier canMint() {
        require(mintingEnabled);
        _;
    }

	/* Creates more token supply and sends it to the specified account */
	function mint(address _to, uint256 _value) public onlyMintAgent canMint returns (bool success) {
		tokenSupply = tokenSupply.add(_value);                // Updates totalSupply
        balances[_to] = balances[_to].add(_value);            // Add to the _receiver
		
        // This will make the mint transaction apper in EtherScan.io
        // We can remove this after there is a standardized minting event
		emit Mint(_to, _value);
        emit Transfer(address(0), _to, _value);
		return true;
	}

	// Owner can allow a crowdsale contract to mint new tokens.
    function approveMintAgent(address _agentAddress, bool _approved) public onlyOwner canMint {
        mintAgents[_agentAddress] = _approved;
        emit MintingAgentApproved(_agentAddress, _approved);
    }

    // Owner can disable minting of new tokens
    function disableMinting() public onlyOwner {
        mintingEnabled = false;
        emit MintDisabled(owner);
    }
    
    // ONLY FOR DEBUG
    // Owner can enable minting of new tokens
    function enableMinting() public onlyOwner {
        mintingEnabled = true;
        emit MintEnabled(owner);
    }
}
