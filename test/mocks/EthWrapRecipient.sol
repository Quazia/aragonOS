pragma solidity 0.4.18;

import "../../contracts/lib/erc777/ITokenRecipient.sol";
import "../../contracts/lib/eip820/EIP820ImplementerInterface.sol";


contract EthWrapRecipient is ITokenRecipient, EIP820ImplementerInterface {
    address public mToken;
    address public mFrom;
    address public mTo;
    address public mOperator;
    uint256 public mAmount;
    bytes public mData;

    function canImplementInterfaceForAddress(address addr, bytes32 interfaceHash) view public returns(bool){
        if (interfaceHash == keccak256("ITokenRecipient") ) {
            return true;
        }
    }

    function tokensReceived(
        address from,
        address to,
        uint amount,
        bytes userData,
        address operator,
        bytes operatorData
    ) public {
        mToken = msg.sender;
        mFrom = from;
        mAmount = amount;
        mData = operatorData;
        mTo = to;
        mOperator = operator;
    }

}
