pragma solidity ^0.4.18;

import "./deps/Ownable.sol";
import "./deps/SafeMath.sol";
import "./TestToken.sol";

contract TokenSale is Ownable {
  using SafeMath for uint256;

  // token address
  TestToken public token;
  

}
