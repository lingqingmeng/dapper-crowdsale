const TokenSale = artifacts.require("./TokenSale.sol");
const TestToken = artifacts.require("./TestToken.sol");

module.exports = function(deployer, network, accounts) {
  setupContracts(deployer, accounts);
};

async function setupContracts(deployer, accounts) {
  const owner = accounts[0];
  // const owner = "0x11f0cdddd75259b02418e5c116d904621632a590";
  const token = await TestToken.deployed();
  const sale = await TokenSale.deployed();
  const totalSupply = new web3.BigNumber(web3.toWei(100000000, "ether"));
  await token.setTotalSupply(totalSupply);
  await token.setSaleAddress(sale.address, { from: owner });
  await token.allocateToSale({ from: owner });
}
