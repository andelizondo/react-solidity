var TokenFiets = artifacts.require("./TokenFiets.sol");
var CrowdsaleFiets = artifacts.require("./CrowdsaleFiets.sol");

module.exports = function(deployer) {
  deployer.deploy(TokenFiets).then(function() {
    return deployer.deploy(CrowdsaleFiets, TokenFiets.address);
  });
};
