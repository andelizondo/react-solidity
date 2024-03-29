pragma solidity ^0.4.21;

contract ERC20 {
	// ERC Token Standard #20 Interface
	// https://github.com/ethereum/EIPs/issues/20
	// https://github.com/OpenZeppelin/zeppelin-solidity/blob/master/contracts/token/ERC20
	
	// Readable properties of the token
	bytes32 internal version;
	bytes32 public name;
	bytes32 public symbol;
	uint8 public decimals;
	
	// Get the total token supply
    function totalSupply() public view returns (uint256);

	// Get the account balance of an account
    function balanceOf(address _who) public view returns (uint256);

	// Send _value amount of tokens to address _to
	function transfer(address _to, uint256 _value) public returns (bool);

	// Send _value amount of tokens from address _from to address _to
	function transferFrom(address _from, address _to, uint256 _value) public returns (bool);

	// Returns the amount which _spender is still allowed to withdraw from _owner
	function allowance(address _owner, address _spender) public view returns (uint256);

	// Allow _spender to withdraw from your account, multiple times, up to the _value amount.
	// If this function is called again it overwrites the current allowance with _value.
	function approve(address _spender, uint256 _value) public returns (bool);

    // Events 
	// Triggered when tokens are transferred.
	event Transfer(address indexed _from, address indexed _to, uint256 _value);

	// Triggered whenever approve(address _spender, uint256 _value) is called.
	event Approval(address indexed _owner, address indexed _spender, uint256 _value);
}
