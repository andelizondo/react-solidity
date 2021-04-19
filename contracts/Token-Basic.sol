pragma solidity ^0.4.21;

import './Token-ERC20.sol';
import './Utils-Ownable.sol';
import './Utils-SafeMath.sol';

contract Token is ERC20, Ownable {
    using SafeMath for uint256;
    
    uint256 internal tokenSupply;
    mapping(address => uint256) internal balances;
    mapping(address => mapping (address => uint256)) private allowed;
    
	/* Initializes contract with initial supply tokens to the creator of the contract */
	function Token(
		bytes32 _version,
		bytes32 _name,
		bytes32 _symbol,
		uint8  _decimals,
		uint256 _totalSupply
		) public {
		version = _version;									// Set the version for display purposes
		name = _name;                                   	// Set the name for display purposes
		symbol = _symbol;                               	// Set the symbol for display purposes
		decimals = _decimals;                           	// Amount of decimals for display purposes
		tokenSupply = _totalSupply;                         // Update total supply
		balances[msg.sender] = _totalSupply;                // Give the creator all initial tokens
	}
	

    // @dev total number of tokens in existence
    function totalSupply() public view returns (uint256) {
        return tokenSupply;
    }
    
    /// @dev Gets the balance of the specified address.
    /// @param _who The address to query the the balance of.
    function balanceOf(address _who) public view returns (uint256) {
        return balances[_who];
    }

	/// @notice Send `_value` tokens to `_to` from your account
	/// @param _to The address of the recipient
	/// @param _value the amount to send
	function transfer(address _to, uint256 _value) public returns (bool) {
	    _transfer(msg.sender, _to, _value);
		return true;
	}

	/// @notice Send `_value` tokens to `_to` in behalf of `_from`
	/// @param _from The address of the sender
	/// @param _to The address of the recipient
	/// @param _value the amount to send
	function transferFrom(address _from, address _to, uint256 _value) public returns (bool) {
		require(_value <= allowed[_from][msg.sender]);	  // Check allowance
        
        allowed[_from][msg.sender] = allowed[_from][msg.sender].sub(_value);
		_transfer(_from, _to, _value);
		return true;
	}

	/* Internal transfer, only can be called by this or inherited contracts  */
	function _transfer(address _from, address _to, uint _value) internal {
		require(_to != address(0));						    // Prevent transfer to 0x0 address. Use burn() instead
		require(_value <= balances[msg.sender]);			// Check if the sender has enough
		
		balances[_from] = balances[_from].sub(_value);      // Subtract from the sender
        balances[_to] = balances[_to].add(_value);          // Add the same to the recipient
        						
		emit Transfer(_from, _to, _value);					// Notify anyone listening that this transfer took place
	}

    /// @dev Function to check the amount of tokens that an owner allowed to a spender.
    /// @param _owner address The address which owns the funds.
    /// @param _spender address The address which will spend the funds.
    /// @return A uint256 specifying the amount of tokens still available for the spender.
    function allowance(address _owner, address _spender) public view returns (uint256) {
        return allowed[_owner][_spender];
    }
    
	/// @notice Allows `_spender` to spend no more than `_value` tokens in your behalf
	/// @param _spender The address authorized to spend
	/// @param _value the max amount they can spend
	function approve(address _spender, uint256 _value) public returns (bool success) {
		allowed[msg.sender][_spender] = _value;
		
		emit Approval(msg.sender, _spender, _value);
		return true;
	}
    
    /// @dev Increase the amount of tokens that an owner allowed to a spender.
    /// @param _spender The address which will spend the funds.
    /// @param _addedValue The amount of tokens to increase the allowance by.
    function increaseApproval(address _spender, uint _addedValue) public returns (bool) {
        allowed[msg.sender][_spender] = allowed[msg.sender][_spender].add(_addedValue);
        
        emit Approval(msg.sender, _spender, allowed[msg.sender][_spender]);
        return true;
    }
    
    /// @dev Decrease the amount of tokens that an owner allowed to a spender.
    /// @param _spender The address which will spend the funds.
    /// @param _subtractedValue The amount of tokens to decrease the allowance by.
    function decreaseApproval(address _spender, uint _subtractedValue) public returns (bool) {
        uint oldValue = allowed[msg.sender][_spender];
        if (_subtractedValue > oldValue) {
            allowed[msg.sender][_spender] = 0;
        } else {
            allowed[msg.sender][_spender] = oldValue.sub(_subtractedValue);
        }
        
        emit Approval(msg.sender, _spender, allowed[msg.sender][_spender]);
        return true;
    }
}
