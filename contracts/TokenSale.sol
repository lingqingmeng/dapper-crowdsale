pragma solidity ^0.4.18;

import "./deps/Ownable.sol";
import "./deps/SafeMath.sol";
import "./TestToken.sol";

contract TokenSale is Ownable {
  using SafeMath for uint256;

  // token address
  TestToken public token;
  // flag to turn sale on and off
  bool public saleEnabled = false;
  // address where funds are collected
  address public wallet;
  // how many token units a buyer gets per wei
  uint256 public rate = 1000;
  // amount of raised money in wei
  uint256 public weiRaised;

  // only whitelisted address are allowed to participate
  mapping (address => bool) public whitelist;

  /**
   * event for token purchase logging
   * @param purchaser who paid for the tokens
   * @param beneficiary who got the tokens
   * @param value weis paid for purchase
   * @param amount amount of tokens purchased
   */
  event TokenPurchase(address indexed purchaser, address indexed beneficiary, uint256 value, uint256 amount);

  modifier onlyWhenSaleEnabled() {
    require(saleEnabled);
    _;
  }

  modifier onlyWhitelisted(address _purchaser) {
    require(whitelist[_purchaser] == true);
    _;
  }

  function TokenSale(address _token, address _wallet)
    public
  {
    token = TestToken(_token);
    wallet = _wallet;
  }

  /* owner functions */

  // allow owner to start the sale
  function enableSale()
    onlyOwner
    public
  {
    saleEnabled = true;
  }

  // allow owner to stop the sale
  function disableSale()
    onlyOwner
    public
  {
    saleEnabled = false;
  }

  // allow owner to set rate of conversion
  function setRate(uint _rate)
    onlyOwner
    public
  {
    rate = _rate;
  }

  function addToWhitelist (address[] purchasers)
    onlyOwner
    public
  {
       for (uint i = 0; i < purchasers.length; i++) {
           whitelist[purchasers[i]] = true;
       }
   }

  // low level token purchase function
  function buyTokens(address _beneficiary)
    onlyWhenSaleEnabled
    onlyWhitelisted(msg.sender)
    onlyWhitelisted(_beneficiary)
    public
    payable
  {
    require(_beneficiary != address(0));
    require(msg.value >= 0);

    uint256 weiAmount = msg.value;

    // calculate token amount to be created
    uint256 tokenAmount = weiAmount.mul(rate);

    // update state
    weiRaised = weiRaised.add(weiAmount);

    token.transfer(_beneficiary, tokenAmount);
    TokenPurchase(msg.sender, _beneficiary, weiAmount, tokenAmount);

    forwardFunds();
  }

  // send ether to the fund collection wallet
  // override to create custom fund forwarding mechanisms
  function forwardFunds()
    internal
  {
    wallet.transfer(msg.value);
  }

  // fallback function can be used to buy tokens
  function ()
    external
    payable
  {
    buyTokens(msg.sender);
  }

}
