import ether from "./helpers/ether";
import EVMRevert from "./helpers/EVMRevert";

const BigNumber = web3.BigNumber;

const should = require("chai")
  .use(require("chai-as-promised"))
  .use(require("chai-bignumber")(BigNumber))
  .should();

let TokenSale = artifacts.require("./TokenSale.sol");
let TestToken = artifacts.require("./TestToken.sol");

contract("Sale", accounts => {
  const owner = accounts[0];
  const collectionWallet = owner;
  const purchaser = accounts[1];
  const beneficiary = accounts[2];
  const value = ether(2);
  const rate = 1500;
  const expectedTokenAmount = new BigNumber(rate * value);
  var token, sale;

  beforeEach(async () => {
    token = await TestToken.new({ from: owner });
    // total supply is one billion tokens, using the ether helper here because decimals is 18
    const totalSupply = ether(100000000);
    await token.setTotalSupply(totalSupply);
    // set sales address
    sale = await TokenSale.new(token.address, owner, {
      from: owner
    });
    await token.setSaleAddress(sale.address, { from: owner });
    await token.allocateToSale({ from: owner });
    await sale.setRate(rate, { from: owner });
  });

  describe("The setup", function() {
    it("sales has the allocated sale supply of the token contract", async () => {
      const totalSupply = await token.totalSupply();
      const saleSupply = totalSupply * 0.8;
      const salesTokenBalance = await token.balanceOf(sale.address);
      salesTokenBalance.should.be.bignumber.equal(saleSupply);
    });
  });

  describe("The buyToken function", function() {
    it("should accept payments if sale is enabled and purchaser is whitelisted", async () => {
      await sale.enableSale({ from: owner });
      await sale.addToWhitelist([purchaser, beneficiary], { from: owner });
      await sale.buyTokens(beneficiary, {
        value,
        from: purchaser
      }).should.be.fulfilled;
    });

    it("successful transactions should be logged", async () => {
      await sale.enableSale({ from: owner });
      await sale.addToWhitelist([purchaser, beneficiary], { from: owner });
      const { logs } = await sale.buyTokens(beneficiary, {
        value,
        from: purchaser
      });

      const event = logs.find(e => e.event === "TokenPurchase");

      should.exist(event);
      event.args.purchaser.should.equal(purchaser);
      event.args.beneficiary.should.equal(beneficiary);
      event.args.value.should.be.bignumber.equal(value);
      event.args.amount.should.be.bignumber.equal(expectedTokenAmount);
    });

    it("token balance of beneficiary after purchase should be as expected", async () => {
      await sale.enableSale({ from: owner });
      await sale.addToWhitelist([purchaser, beneficiary], { from: owner });
      var balanceBefore = await token.balanceOf(beneficiary);
      var balanceETHBefore = await web3.eth.getBalance(purchaser);
      await sale.buyTokens(beneficiary, { value, from: purchaser });
      var balanceETHAfter = await web3.eth.getBalance(purchaser);
      var balanceAfter = await token.balanceOf(beneficiary);
      balanceAfter.should.be.deep.equal(expectedTokenAmount);
    });

    it("should reject transaction if sale is disabled even if purchaser is whitelisted", async () => {
      await sale.disableSale({ from: owner });
      await sale.addToWhitelist([purchaser, beneficiary], { from: owner });
      await sale
        .buyTokens(beneficiary, { value, from: purchaser })
        .should.be.rejectedWith(EVMRevert);
    });

    it("should reject transaction if purchaser is not whitelisted even if sale is enabled", async () => {
      await sale.enableSale({ from: owner });
      await sale
        .buyTokens(beneficiary, { value, from: purchaser })
        .should.be.rejectedWith(EVMRevert);
    });

    it("should forward funds to collection wallet", async () => {
      await sale.enableSale({ from: owner });
      await sale.addToWhitelist([purchaser, beneficiary], { from: owner });
      const balanceETHBefore = await web3.eth.getBalance(collectionWallet);
      await sale.buyTokens(beneficiary, { value, from: purchaser }).should.be
        .fulfilled;
      const balanceETHAfter = await web3.eth.getBalance(collectionWallet);
      await sale.sendTransaction({ value, from: beneficiary });
      balanceETHAfter.minus(balanceETHBefore).should.be.bignumber.equal(value);
    });
  });

  describe("The fallback function", function() {
    it("should accept payments if sale is enabled and purchaser is whitelisted", async () => {
      await sale.enableSale({ from: owner });
      await sale.addToWhitelist([purchaser, beneficiary], { from: owner });
      await sale.sendTransaction({
        value,
        from: purchaser
      }).should.be.fulfilled;
    });

    it("successful transactions should be logged", async () => {
      await sale.enableSale({ from: owner });
      await sale.addToWhitelist([purchaser, beneficiary], { from: owner });
      const { logs } = await sale.sendTransaction({
        value,
        from: beneficiary
      });

      const event = logs.find(e => e.event === "TokenPurchase");

      should.exist(event);
      event.args.purchaser.should.equal(beneficiary);
      event.args.beneficiary.should.equal(beneficiary);
      event.args.value.should.be.bignumber.equal(value);
      event.args.amount.should.be.bignumber.equal(expectedTokenAmount);
    });

    it("token balance of beneficiary after purchase should be as expected", async () => {
      await sale.enableSale({ from: owner });
      await sale.addToWhitelist([purchaser, beneficiary], { from: owner });
      await sale.sendTransaction({ value, from: beneficiary }).should;
    });

    it("should reject transaction if sale is disabled even if purchaser is whitelisted", async () => {
      await sale.disableSale({ from: owner });
      await sale.addToWhitelist([purchaser, beneficiary], { from: owner });
      await sale
        .sendTransaction({ value, from: purchaser })
        .should.be.rejectedWith(EVMRevert);
    });

    it("should reject transaction if purchaser is not whitelisted even if sale is enabled", async () => {
      await sale.enableSale({ from: owner });
      await sale
        .sendTransaction({ value, from: purchaser })
        .should.be.rejectedWith(EVMRevert);
    });

    it("should forward funds to collection wallet", async () => {
      await sale.enableSale({ from: owner });
      await sale.addToWhitelist([purchaser, beneficiary], { from: owner });
      const balanceETHBefore = await web3.eth.getBalance(collectionWallet);
      await sale.sendTransaction({ value, from: purchaser }).should.be
        .fulfilled;
      const balanceETHAfter = await web3.eth.getBalance(collectionWallet);
      await sale.sendTransaction({ value, from: beneficiary });
      balanceETHAfter.minus(balanceETHBefore).should.be.bignumber.equal(value);
    });
  });
});
