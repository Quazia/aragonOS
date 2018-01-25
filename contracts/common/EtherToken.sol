pragma solidity 0.4.18;

import "./erc777/ERC777.sol";

contract EtherToken is ERC777 {

    using SafeMath for uint256;
    string public name = "Ether";

    string public symbol = "ETH";
    uint8 public decimals = 18;

    function wrap() payable public {
        setInterfaceImplementation("ITokenRecipient", msg.sender);
        ownerMint(msg.sender, msg.value, "0x0");
    }

    function wrapAndCall(address _receiver, bytes _data) payable public {
        setInterfaceImplementation("ITokenRecipient", msg.sender);
        ownerMint(msg.sender, msg.value, _data);
    }

    function unwrap() public {
        withdraw(msg.sender, balanceOf(msg.sender));
    }

    function withdraw(address _recipient, uint256 _amount) public {
        require(_amount > 0);
        require(balanceOf(msg.sender) >= _amount);

        burn(msg.sender, balanceOf(msg.sender));

        Burn(msg.sender, _amount);
        Transfer(msg.sender, 0, _amount);

        _recipient.transfer(_amount);
    }

    event Mint(address indexed actor, uint value);
    event Burn(address indexed actor, uint value);
}
