//#!/usr/bin/env node
//const Accounts = require('web3-eth-accounts')

import process from 'process'
import Web3 from 'web3'
import util  from 'util'

import * as cbdcLib from './Connect.js';
import * as envLib from './Env.js';


export function programRunMode (){
    
    return envLib.envRunMode();
}


const signTx = async (fromAccount, tx) => {
    const signedTx = await fromAccount.signTransaction(tx)
    return signedTx.rawTransaction // hex string
}

const setup = async () => {

    let iface = await cbdcLib.setupConnection();
  
    const networkId = await iface.w3.eth.net.getId()
    let contractAddress = iface.cbdc.address;

    /*
    let contractAddress,  deployedNetwork
    try {
         deployedNetwork = cbdc['networks'][networkId]
         contractAddress = deployedNetwork['address']
    } catch (err) {
        msg = `error getting deployedNetwork: ${err}`
        throw new Error(msg)
    }
    */
    //which wallet do we want to watch?
    console.log("setup done...");
    return [ iface.w3, networkId, contractAddress, iface.cbdc, iface.wallets ]
}

const prettyPrint = (o) => {
   return util.inspect(o, {showHidden: false, depth: null, colors: true})
}

const recordWrite = async () => {
    const [web3, chainId, contractAddress, contract, fromAccount] = await setup()

    const txnData = contract.methods.write().encodeABI()
    console.log('account.address:', fromAccount.address)
    const promiseResults = await Promise.all([
        web3.eth.getTransactionCount(fromAccount.address),
        web3.eth.getGasPrice(),
    ])
    const nonce = promiseResults[0]
    const gasPrice = promiseResults[1]
    const tx = {
        'gasLimit': 0,
        'chainId': chainId,
        'gasPrice': gasPrice,
        'nonce': Web3.utils.toHex(nonce),
        'from': fromAccount.address,
        'to': contractAddress,
        'value': 0xbeef,
        'data': txnData,
    }
    const gasMultiple = 2.0
    tx.gasLimit = (await web3.eth.estimateGas(tx)) * gasMultiple
    console.log('tx:', prettyPrint(tx))
    const rawTxStr = await signTx(fromAccount, tx)
    const r = await web3.eth.sendSignedTransaction(rawTxStr)
    console.log('sendTransaction: receipt:', prettyPrint(r))
    return 0
}

const eventSubscribe = () => {
    return new Promise((resolve, reject) => {
        setup().then(([web3, chainId, contractAddress, contract, account]) => {
            console.log('contractAddress:', contractAddress)
            // change 'Record' to the desired event from your contract
            contract.events.Record({}).on('data', (ev) => {
                console.log('Record:', prettyPrint(ev))
            }).on('changed', (ev) => {
                 console.log('event removed:', prettyPrint(ev))
            }).on('error', console.error)
        })
    })
}

const logSubscribe = () => {
    return new Promise((resolve, reject) => {
        setup().then(([web3, chainId, contractAddress, contract, account]) => {
            let eventCount = 0
            console.log('contractAddress:', contractAddress)
            console.log('contract.options.jsonInterface:', prettyPrint(contract.options.jsonInterface))
            const eventAbis = contract.options.jsonInterface.filter((abiObj) => abiObj.type === 'event')
            web3.eth.subscribe('logs', { address: contractAddress }, (err, log) => {
                console.log('eth.subscribe("logs") callback')
                if (err) {
                    console.log('logs callback, err:', err)
                    reject(err)
                    return
                }
                eventCount++
                console.log(`log[${eventCount}]:`, log)
                const eventSig = log.topics[0]
                for (let abi of eventAbis) {
                    if (eventSig === abi.signature) {
                        const decoded = web3.eth.abi.decodeLog(abi.inputs, log.data, log.topics.slice(1))
                        console.log('Decoded Event:', prettyPrint(abi), '\n', prettyPrint(decoded))

                        //issue callback to banking app
                        resolve(0)
                        return
                    }
                }
            })
        })
    })
}

 async function  _eventListener(){
    let n = programRunMode();
    if (n == envLib.AppRunMode.TX_EVENT_WRITER) {
        process.exit(await recordWrite())
    } else if (n == envLib.AppRunMode.EVENT_SUBSCRIBER) {
        process.exit(await eventSubscribe())
    } else if (n == envLib.AppRunMode.LOG_SUBSCRIBER) {
        //process.exit(await logSubscribe())
        await logSubscribe();
    } else {
        console.error(`unsupported program name: "${programName()}"`)
        process.exit(2)
    }
}

export  function  eventListener(){
    _eventListener().then( res => { console.log("done")});
}

