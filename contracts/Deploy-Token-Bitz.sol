pragma solidity ^0.4.21;

import './Token-Basic.sol';
import './Token-Burnable.sol';
import './Token-Mintable.sol';
import './Token-Frozable.sol';

contract BitzToken is Token, Mintable, Burnable, Frozable {
    
    // Basic Token Properties
    bytes32 private _version = '0.1.2';
    bytes32 private _name = 'TestBitz';
    bytes32 private _symbol = 'btz';
    uint8  private _decimals = 0;
    uint256 private _totalSupply = 0;

    function BitzToken () public Token (
        _version,
        _name,
        _symbol,
        _decimals,
        _totalSupply
    ) {}
}
