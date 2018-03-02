pragma solidity ^0.4.15;

import './deps/StandardToken.sol';
import './deps/Ownable.sol';

contract TestToken is StandardToken, Ownable {
    string public constant name = "TestToken";
    string public constant symbol = "TST";
    uint8 public constant decimals = 18;
    bool public mintingFinished = false;
    bool public transferEnabled = false;
    address public saleAddress;

    // only allow sales address to transfer tokens before ICO is finished
    modifier onlyWhenTransferEnabled() {
      require(transferEnabled || msg.sender == saleAddress);
      _;
    }

    function setSaleAddress(address _saleAddress)
      onlyOwner
      public
    {
      saleAddress = _saleAddress;
    }

    function setTotalSupply(uint _totalSupply)
      onlyOwner
      public
    {
      totalSupply = _totalSupply;
    }

    function allocateToSale()
      onlyOwner
      public
    {
      /* 80% of total supply goes to sale */
      uint saleSupply = totalSupply.div(100).mul(80);
      balances[saleAddress] = balances[saleAddress].add(saleSupply);
      Transfer(address(0), saleAddress, saleSupply);
    }

    function allocateToTeam(address _teamAddress)
      onlyOwner
      public
    {
      /* 20% of total supply goes to team */
      uint teamSupply = totalSupply.div(100).mul(20);
      balances[_teamAddress] = balances[_teamAddress].add(teamSupply);
      Transfer(address(0), _teamAddress, teamSupply);
    }

    // @dev allows the token owner to award tokens directly to an address
    function awardTokens(address _to, uint _amount)
      onlyOwner
      public
    {
      balances[_to] = balances[_to].add(_amount);
      Transfer(address(0), _to, _amount);
    }

    function enableTransfer()
      onlyOwner
      public
      returns (bool)
    {
      transferEnabled = true;
      return true;
    }

    function disableTransfer()
      onlyOwner
      public
      returns (bool)
    {
      transferEnabled = false;
      return true;
    }

    // freeze transfer and transferFrom until token is distributed
    function transfer(address _to, uint256 _value)
      public
      onlyWhenTransferEnabled
      returns (bool)
    {
      return super.transfer(_to, _value);
    }

    function transferFrom(address _from, address _to, uint256 _value)
      public
      onlyWhenTransferEnabled
      returns (bool)
    {
      return super.transferFrom(_from, _to, _value);
    }
}
