pragma solidity 0.4.18;

import "./erc777/ERC777Token.sol";


contract EtherToken is ERC777Token {
    using SafeMath for uint256;

    string public name = "Ether";
    string public symbol = "ETH";
    uint8 public decimals = 18;

    function wrap() payable public {
        setInterfaceImplementation("ITokenRecipient", msg.sender,)
        _mint(msg.sender, msg.value);
        send(_receiver, msg.value);
    }

    function wrapAndCall(address _receiver, bytes _data) payable public {
        _mint(_receiver, msg.value);
        send(_receiver, msg.value, _data);
    }

    function unwrap() public {
        withdraw(msg.sender, balances[msg.sender]);
    }

    function withdraw(address _recipient, uint256 _amount) public {
        require(_amount > 0);
        require(balances[msg.sender] >= _amount);

        totalSupply = totalSupply.sub(_amount);
        balances[msg.sender] = balances[msg.sender].sub(_amount); // fails if no balance

        Burn(msg.sender, _amount);
        Transfer(msg.sender, 0, _amount);

        _recipient.transfer(_amount);
    }

    function _mint(uint256 _amount) internal {
        require(_amount > 0);

        totalSupply = totalSupply.add(_amount);
        balances[this] += balances[this].add(_amount);

        Mint(this, _amount);
    }

    event Mint(address indexed actor, uint value);
    event Burn(address indexed actor, uint value);
}
