const starkwareCrypto = require('@starkware-industries/starkware-crypto-utils');
const StarkExAPI = require('@starkware-industries/starkex-js/browser');
const Web3 = require('web3')
const axios = require('axios')
const web3 = new Web3(new Web3.providers.HttpProvider('https://goerli.infura.io/v3/2ff47e51ff1f4804865ba892c7efc70c'));
// const perpetualMsgs = require("./starkEx-perpetual/src/services/perpetual/public/js/perpetual_messages");
// const sigLib = require("./starkEx-perpetual/src/starkware/crypto/signature/src/js/signature")
const {ec} = require("starknet");

const starkExAPI = new StarkExAPI({
    endpoint: 'https://perpetual-playground-v3.starkex.co'
  });

exports.isAlive = async () => {
    const isAlive = await starkExAPI.gateway.isAlive();
    return isAlive
}

exports.getFirstUnusedTxId = async () => {
    const txId = await starkExAPI.gateway.getFirstUnusedTxId();
    return txId;
}

exports.deposit = async (txId,amount,starkKey,postionId) => {
    const request = {
        tx_id: txId,
        amount: amount,
        public_id: starkKey,
        postion_id: postionId
      };
      console.log(request)
     const response = await axios.post('https://perpetual-playground-v3.starkex.co/add_transaction', {
            tx_id: txId,
            tx: {
            position_id: postionId.toString(),
            public_key: starkKey,
            amount: amount.toString(),
            type: 'DEPOSIT',
            },
        })
  console.log(response)
    //   const response = await starkExAPI.gateway.deposit(request);
      return response;
}

exports.withdraw = async (txId,amount,starkKey,positionId,eth_address,timestamp,nonce,sign_r,sign_s) => {
    const request = {
        tx_id: txId,
        amount: amount,
        eth_address: eth_address,
        expiration_timestamp: timestamp,
        nonce: nonce,
        position_id: positionId,
        public_key: starkKey,
        signature: {
            r: sign_r,
            s: sign_s
        }
    }
      const response = await starkExAPI.gateway.withdraw(request);
      return response;
}

exports.trade = async (request) => {
    const response = await starkExAPI.gateway.trade(request);
    return response;
}

exports.getBatchInfo = async (batchId) => {
    const batchInfo = await starkExAPI.feederGateway.getBatchInfo(batchId);
    return batchInfo
}

exports.getStarkKey = async (sign_r) => {
    console.log("signature",sign_r)
    const grinded = starkwareCrypto.keyDerivation.grindKey(sign_r, starkwareCrypto.ec.n)
    console.log("grind Key :", grinded)
    let datas = starkwareCrypto.ec.keyFromPrivate(grinded, 'hex');
    const publicKey1 = starkwareCrypto.ec.keyFromPublic(datas.getPublic(true, 'hex'), 'hex');
    const pkey1 = datas.getPrivate('hex');                               //grindkey is nothing but privatekey//
    console.log("private Key :", pkey1);
    const publicKey1X = publicKey1.pub.getX();
    console.log("public Key :", publicKey1X.toString(16))
    return publicKey1X.toString(16);
}

exports.getPrivateKey = async (sign_r) => {
    const grinded = starkwareCrypto.keyDerivation.grindKey(sign_r, starkwareCrypto.ec.n)
    console.log("grind Key :", grinded)
    let datas = starkwareCrypto.ec.keyFromPrivate(grinded, 'hex');
    const pkey1 = datas.getPrivate('hex');                     
    console.log("private Key :", pkey1);
    return pkey1;
}

// exports.getTransferSignature = async (data,privateKey) => {
//     const msgHash = perpetualMsgs.getPerpetualTransferMessage(data)
//     console.log("msgHash",msgHash)
//     const keyPair = ec.getKeyPair(privateKey)
//     sig = sigLib.sign(keyPair, msgHash)
//     let r = await web3.utils.toHex(sig.r)
//     let s = await web3.utils.toHex(sig.s)
//     console.log("sig",r,s,sig)
//     sigLib.verify(keyPair, msgHash, sig)
//     console.log("done")
//     return r,s;
// }

// exports.getWithdrawSignature = async (data,privateKey) => {
//     const msgHash = perpetualMsgs.getPerpetualWithdrawalMessage(data)
//     console.log("msgHash",msgHash)
//     const keyPair = ec.getKeyPair(privateKey)
//     sig = sigLib.sign(keyPair, msgHash)
//     let r = await web3.utils.toHex(sig.r)
//     let s = await web3.utils.toHex(sig.s)
//     console.log("sig",r,s,sig)
//     sigLib.verify(keyPair, msgHash, sig)
//     console.log("done")
//     return r,s;
// }

// exports.getLimitOrderSignature = async (data,privateKey) => {
//     const msgHash = perpetualMsgs.getPerpetualLimitOrderMessage(data)
//     console.log("msgHash",msgHash)
//     const keyPair = ec.getKeyPair(privateKey)
//     sig = sigLib.sign(keyPair, msgHash)
//     let r = await web3.utils.toHex(sig.r)
//     let s = await web3.utils.toHex(sig.s)
//     console.log("sig",r,s,sig)
//     sigLib.verify(keyPair, msgHash, sig)
//     console.log("done")
//     return r,s;
// }

exports.liquidation = async () => {
    // {
    //     "actual_collateral": "7758176404715800194",
    //     "actual_liquidator_fee": "8791662011684601223",
    //     "actual_synthetic": "15308084094301570617",
    //     "liquidated_position_id": "15419682365516802845",
    //     "liquidator_order": {
    //         "amount_collateral": "8187132600743567510",
    //         "amount_fee": "11081939229867047606",
    //         "amount_synthetic": "16558026091473266411",
    //         "asset_id_collateral": "0x57d05d11b570fd197b55746070ee051c731ee109b07255eab3c9cf8b6c579d",
    //         "asset_id_synthetic": "0x2",
    //         "expiration_timestamp": "1430804514",
    //         "is_buying_synthetic": false,
    //         "nonce": "3900315155",
    //         "order_type": "LIMIT_ORDER_WITH_FEES",
    //         "position_id": "11534118754833929857",
    //         "public_key": "0x5db665983e23607de57d6dc068797336bfdcb954238044688bec922ca296d3e",
    //         "signature": {
    //             "r": "0x4ac8a77f5863238a8bfb8a2e7f2dcc70cb8cad7b45692497b4b2c3ff06f6c94",
    //             "s": "0x6fd86c349a6c6266d34c11da0ff8c0cf211cafbadc39ba4a4c38124344f3bb1"
    //         }
    //     },
    //     "type": "LIQUIDATE"
    // }
}