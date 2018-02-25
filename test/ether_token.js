const { assertRevert } = require('./helpers/assertThrow')
const { getBalance, sendTransaction, sendSignedTransaction } = require('./helpers/web3')
const ETHWrapper = artifacts.require('ETHWrapper')
const Registry = artifacts.require('EIP820Registry')
const EthWrapRecipient = artifacts.require('EthWrapRecipient')
const Web3 = require('web3');


contract('EtherToken', accounts => {
  let token = {}  
  let interfaceImplementationRegistry
  const from = accounts[0]
  const to = accounts[1]
  const withdrawAddr = '0x0000000000000000000000000000000000001234'
  const deployedAddr = '0x1e9f423db6b0c5e2b7caa49555962bd97e98a75f'
  const deployedGas = 8990341999999958000
  const value = 1000000000000000000

  before( async () => {
    await sendTransaction({from: from, to: deployedAddr, value:deployedGas})
    await sendSignedTransaction('0xf9051b8085174876e800830c35008080b904c86060604052341561000f57600080fd5b6104aa8061001e6000396000f30060606040526004361061006c5763ffffffff7c010000000000000000000000000000000000000000000000000000000060003504166329965a1d81146100715780633d5840631461009c5780635df8122f146100d757806365ba36c1146100fc578063aabbb8ca1461015f575b600080fd5b341561007c57600080fd5b61009a600160a060020a036004358116906024359060443516610181565b005b34156100a757600080fd5b6100bb600160a060020a03600435166102ec565b604051600160a060020a03909116815260200160405180910390f35b34156100e257600080fd5b61009a600160a060020a0360043581169060243516610338565b341561010757600080fd5b61014d60046024813581810190830135806020601f820181900481020160405190810160405281815292919060208401838380828437509496506103f395505050505050565b60405190815260200160405180910390f35b341561016a57600080fd5b6100bb600160a060020a0360043516602435610458565b8233600160a060020a0316610195826102ec565b600160a060020a0316146101a857600080fd5b600160a060020a038216158015906101d2575033600160a060020a031682600160a060020a031614155b156102735781600160a060020a031663f008325085856000604051602001526040517c010000000000000000000000000000000000000000000000000000000063ffffffff8516028152600160a060020a0390921660048301526024820152604401602060405180830381600087803b151561024d57600080fd5b6102c65a03f1151561025e57600080fd5b50505060405180519050151561027357600080fd5b600160a060020a0384811660008181526020818152604080832088845290915290819020805473ffffffffffffffffffffffffffffffffffffffff191693861693841790558591907f93baa6efbd2244243bfee6ce4cfdd1d04fc4c0e9a786abd3a41313bd352db153905160405180910390a450505050565b600160a060020a038082166000908152600160205260408120549091161515610316575080610333565b50600160a060020a03808216600090815260016020526040902054165b919050565b8133600160a060020a031661034c826102ec565b600160a060020a03161461035f57600080fd5b82600160a060020a031682600160a060020a03161461037e5781610381565b60005b600160a060020a0384811660008181526001602052604090819020805473ffffffffffffffffffffffffffffffffffffffff191694841694909417909355908416917f605c2dbf762e5f7d60a546d42e7205dcb1b011ebc62a61736a57c9089d3a4350905160405180910390a3505050565b6000816040518082805190602001908083835b602083106104255780518252601f199092019160209182019101610406565b6001836020036101000a038019825116818451161790925250505091909101925060409150505180910390209050919050565b600160a060020a03918216600090815260208181526040808320938352929052205416905600a165627a7a723058205b4403251cca7ea41667bb21ed92b7b6b52d87068e201fbe5456b663e1faf72900291ba079be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798a00aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa')
    registry = Registry.at('0x4b3b1c4850EEB21ee224f05a2C27F9F3CB620f6a')
  })

  beforeEach(async () => {
    token = await ETHWrapper.new()
  })



  it('can wrap and call', async () => {
      await sendTransaction({ from: from, to: token.address, value:value, gas: 7000000 })
  })

  context('wrapping eth', () => {
      beforeEach(async () => {
        await sendTransaction({ from: from, to: token.address, value:value, gas: 7000000 })
      })

      it('wraps ETH into token adding balance to sender', async () => {
        assert.equal(await getBalance(token.address), value, 'ETH should be held inside token contract')
        assert.equal(await token.balanceOf(from), value, 'Sender should have correct token balance')
      })

      it('unwraps ETH burning tokens and sending ETH', async () => {
        const withdrawAmount = 500000000000000000

        const prevBalanceTokens = await token.balanceOf(from)
        const prevTokenContractBalance = await getBalance(token.address)
        const prevBalanceEther = await getBalance(from)
        let currentTx = await token.transfer(token.address, withdrawAmount, {from:from, gas:1000000})
        const postBalanceTokens = await token.balanceOf(from)
        const postTokenContractBalance = await getBalance(token.address)
        const postBalanceEther = await getBalance(from)
        

        console.log(prevTokenContractBalance.toNumber())
        console.log(postTokenContractBalance.toNumber())
        
        console.log(prevBalanceEther.toNumber())
        console.log(postBalanceEther.toNumber())
        console.log(currentTx.receipt.gasUsed)
        let gasUsed = currentTx.receipt.gasUsed
        console.log(gasUsed)

        assert.equal(prevBalanceTokens.minus(postBalanceTokens).toNumber(), withdrawAmount.toNumber, 'Token balance should change by the amount withdrawn')
        assert.equal(await getBalance(token.address), BN(value).minus(withdrawAmount), 'Remaining ETH should be held inside token contract after withdraw')
        assert.equal(await postBalanceEther.toNumber(), prevBalanceEther.plus(withdrawAmount).minus(gasUsed), 'Sender should have correct ETH balance after withdraw')
      })

      it('unwraps entire amount to sender', async () => {
          await token.unwrap()
          assert.equal(await getBalance(token.address), 0, 'token should have 0 eth')
          assert.equal(await token.balanceOf(from), 0, 'token balance should be 0')
      })

      it('can transfer and call', async () => {
          const stub = await EthWrapRecipient.new()
          await registry.setInterfaceImplementer(to, "ITokenRecipient", stub.address, {from:to})
          const data = '0x12'

          await token.send(to, value, data)

          assert.equal(await stub.mToken(), token.address, 'token should be correct')
          assert.equal(await stub.mFrom(), from, 'from should be correct')
          assert.equal(await stub.mData(), from, 'data should be correct')
          assert.equal(await stub.mAmount(), value, 'value should be correct')
          assert.equal(await stub.mData(), data, 'value should be correct')

          assert.equal(await token.balanceOf(from), 0, 'from should have 0 token balance')
          assert.equal(await token.balanceOf(stub.address), value, 'receiver should have correct token balance')
      })
  })
})
