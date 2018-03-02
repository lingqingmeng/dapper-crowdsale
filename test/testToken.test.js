import ether from "./helpers/ether";
import EVMRevert from "./helpers/EVMRevert";

const BigNumber = web3.BigNumber;

const should = require("chai")
  .use(require("chai-as-promised"))
  .use(require("chai-bignumber")(BigNumber))
  .should();

let TestToken = artifacts.require("./TestToken.sol");

contract("Token", accounts => {
  const owner = accounts[0];
  const spender = accounts[1];
  const destination = accounts[1];
  const value = ether(2);
  var token;

  beforeEach(async () => {
    token = await TestToken.new({ from: owner });
    // total supply is one billion tokens, using the ether helper here because decimals is 18
    const totalSupply = ether(100000000);
    await token.setTotalSupply(totalSupply);
    await token.awardTokens(destination, value, { from: owner });
  });

  it("can be transferred when transfer is enabled", async () => {
    assert.ok(token);
    await token.enableTransfer();
    await token.transfer(destination, value, { from: spender });
    var destinationBalance = await token.balanceOf(destination);
    destinationBalance.should.be.deep.equal(new BigNumber(value));
  });

  it("cannot be transferred when transfer is disabled", async () => {
    assert.ok(token);
    await token.disableTransfer();
    await token
      .transfer(destination, value, { from: spender })
      .should.be.rejectedWith(EVMRevert);
  });
});
