pragma solidity ^0.4.15;

import './Crowdsale-Token.sol';

contract TokenFiets is CrowdsaleToken {
  // Crowdsale Token Properties
	// Basic Token Properties
	string private _version = '0.12';
	string private _name = 'Fiets';
	string private _symbol = hex"F09F9AB2";
	uint8  private _decimals = 0;
	uint256 private _totalSupply = 0;
	uint256 _tokenPrice = 210;
	uint256 _etherPrice = 270;

  function TokenFiets ()
  CrowdsaleToken (
    _version,
  	_name,
  	_symbol,
    _decimals,
  	_totalSupply,
  	_tokenPrice,
  	_etherPrice
  ) {}
}
