const TokenSale = artifacts.require("./TokenSale.sol");
const TestToken = artifacts.require("./TestToken.sol");

// testrpc
// (0) 0x00d1ae0a6fc13b9ecdefa118b94cf95ac16d4ab0
// (1) 0x1daa654cfbc28f375e0f08f329de219fff50c765
// (2) 0xc2dbc0a6b68d6148d80273ce4d6667477dbf2aa7

module.exports = function() {
  setRate(2000);
};

async function setRate(rate) {
  // test rpc
  // const owner = "0x00d1ae0a6fc13b9ecdefa118b94cf95ac16d4ab0";
  // rinkeby
  const owner = "0x11f0cdddd75259b02418e5c116d904621632a590";
  const sale = await TokenSale.deployed();
  console.log("old rate", await sale.rate());
  await sale.setRate(rate, { from: owner });
  console.log("new rate", await sale.rate());
}
