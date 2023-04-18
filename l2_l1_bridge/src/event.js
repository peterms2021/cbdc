#!/usr/bin/env node

const process = require('process')
const path = require('path')
const fs = require('fs')
const Web3 = require('web3')
const Accounts = require('web3-eth-accounts')
const util = require('util')

// truffle migrate --reset --network thunder-mainnet
const thunderWsUrl = 'wss://mainnet-ws.thundercore.com'
// truffle migrate --reset --network thunder-testnet
//const thunderWsUrl = 'wss://testnet-ws.thundercore.com'

const programName = () => {
    return path.basename(process.argv[1])
}

const web3Url = () => {
    let u = process.env['WEB3_PROVIDER_URI']
    if (u === undefined) {
        u = thunderWsUrl
    }
    return u
}

const signTx = async (fromAccount, tx) => {
    const signedTx = await fromAccount.signTransaction(tx)
    return signedTx.rawTransaction // hex string
}

const setup = async () => {
    const privateKeys = fs.readFileSync(path.join(__dirname, '..', '.private-keys'), {encoding: 'ascii'}).split('\n').filter(x => x.length > 0)
    const accounts = new Accounts()
    const account = accounts.privateKeyToAccount('0x' + privateKeys[0])
  
    const jsonBuf = fs.readFileSync(path.join(__dirname, '..', 'build', 'contracts', 'SimpleRecord.json'))
    const contractData = JSON.parse(jsonBuf)
    const contractAbi = contractData['abi']

    const web3ProviderUrl = web3Url()
    const web3 = new Web3(web3ProviderUrl)
    const networkId = await web3.eth.net.getId()

    let deployedNetwork, contractAddress
    try {
        deployedNetwork = contractData['networks'][networkId]
        contractAddress = deployedNetwork['address']
    } catch (err) {
        msg = `error getting deployedNetwork: ${err}`
        throw new Error(msg)
    }
    const contract = new web3.eth.Contract(contractAbi, contractAddress)
    return [ web3ProviderUrl, web3, networkId, contractAddress, contract, account ]
}

const prettyPrint = (o) => {
   return util.inspect(o, {showHidden: false, depth: null, colors: true})
}

const recordWrite = async () => {
    const [web3ProviderUrl, web3, chainId, contractAddress, contract, fromAccount] = await setup()
    console.log('web3ProviderUrl:', web3ProviderUrl)
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
        setup().then(([web3ProviderUrl, web3, chainId, contractAddress, contract, account]) => {
            console.log('web3ProviderUrl:', web3ProviderUrl)
            console.log('contractAddress:', contractAddress)
            // change 'Record' to the desired event from your contract
            contract.events.Record({}).on('data', (ev) => {
                console.log('Record:', prettyPrint(ev))
            }).on('changed', (ev) => { console.log('event removed:', prettyPrint(ev))
            }).on('error', console.error)
        })
    })
}

const logSubscribe = () => {
    return new Promise((resolve, reject) => {
        setup().then(([web3ProviderUrl, web3, chainId, contractAddress, contract, account]) => {
            let eventCount = 0
            console.log('web3ProviderUrl:', web3ProviderUrl)
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
                        resolve(0)
                        return
                    }
                }
            })
        })
    })
}

(async () => {
    if (programName().endsWith('-write')) {
        process.exit(await recordWrite())
    } else if (programName().endsWith('-event-subscribe')) {
        process.exit(await eventSubscribe())
    } else if (programName().endsWith('-log-subscribe')) {
        process.exit(await logSubscribe())
    } else {
        console.error(`unsupported program name: "${programName()}"`)
        process.exit(2)
    }
})()