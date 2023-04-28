
import process from 'process'
import Web3 from 'web3'
import util  from 'util'

import * as cbdcLib from './Connect.js';
import * as envLib from './Env.js';
import { Contract, ethers, Wallet } from 'ethers';
import { contractEvent } from './EventInterface.js';
import { enInfo, gConnectionInfo } from './Connect.js';
import { CCF_POLL_NEW_TRANS } from './Env.js';
import { processApproval, processTransfer, pullNewTransaction } from './BridgeServices.js';

export function programRunMode (){  
    return envLib.envRunMode();
}


const signTx = async (fromAccount: any, tx: any) => {
    const signedTx = await fromAccount.signTransaction(tx)
    return signedTx.rawTransaction // hex string
}

type NewTypeT = [face: Web3, netid: Number, addr: string, contract: Contract, wal: Wallet];

const setup = async (): Promise<NewTypeT> => {

    let iface = await cbdcLib.setupConnection();
    let networkId:any;

    let cbdc = gConnectionInfo.cbdc;
    let contractAddress = cbdc.address;

    //which wallet do we want to watch?
    console.log("setup done...");
    return [ iface.web3, networkId, contractAddress, cbdc, iface.wallet ]
}

const prettyPrint = (o:any) => {
   return util.inspect(o, {showHidden: false, depth: null, colors: true})
}

const recordWrite = async () : Promise<number> => {
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
};


const logSubscribe = async (): Promise<any> => {
    return new Promise((resolve, reject) => {
        setup().then(([web3, chainId, contractAddress, contract, account]) => {
            let eventCount = 0
            console.log('contractAddress:', contractAddress)
            //console.log('contract.options.jsonInterface:', prettyPrint(contract.options.jsonInterface))
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
};

const eventSubscribe = async (): Promise<any> => {
    return new Promise((resolve, reject) => {
        setup().then(([web3, chainId, contractAddress, contract, account]) => {
           
            console.log('contractAddress:', contractAddress);
            // change 'Record' to the desired event from your contract
            contract.events.Record({}).on('data', (ev) => {
                console.log('Record:', prettyPrint(ev))
            }).on('changed', (ev) => {
                 console.log('event removed:', prettyPrint(ev))
            }).on('error', console.error)
        })
    })

};


const eventTransferSubScribe = async (): Promise<any> => {
    return new Promise((resolve, reject) => {
        setup().then(([web3, chainId, contractAddress, contract, account]) => {
        console.log(`eventTransferSubScribe ....`);
        contract.on("Transfer", (from, to, value, event)=>{
                let transferEvent ={
                    from: from,
                    to: to,
                    value: value,
                    eventData: event,
                }
                //look for address and call back to 
                console.log(JSON.stringify(transferEvent, null, 4))

                let v:contractEvent;
                v.from_owner = from;
                v.to_spender = to;
                v.value = value;

                processTransfer(v);
        })
    })
  })
};

const eventApprovalSubScribe = async (): Promise<any> => {
    return new Promise((resolve, reject) => {
        setup().then(([web3, chainId, contractAddress, contract, account]) => {
        console.log(`eventApprovalSubScribe ....`);
        contract.on("Approval", (owner, spender, value, event)=>{
                let approvalEvent ={
                    spender: spender,
                    owner: owner,
                    value: value,
                    eventData: event,
                }
                //look for address and call back to 
                console.log(JSON.stringify(approvalEvent, null, 4));

                let v:contractEvent;
                v.from_owner = owner;
                v.to_spender = spender;
                v.value = value;
                
                processApproval(v);
        })
    })
  })
};


const pollForTransactions =  async () : Promise<any> => {
    let n = parseInt(enInfo.get(CCF_POLL_NEW_TRANS),10);
    //conver to ms 
    n = n * 1000;
    return new Promise((resolve, reject) => {
        setInterval(() => {
            console.log("Checking for transaction...");
            pullNewTransaction();
          }, n);
    })
};


function handleRejection(p) {
    console.log("handleRejection >=");
    return p.catch((error)=>({
        error
    }))
}

function waitForAll(...ps) {
    console.log('started...')
    return Promise.all(ps.map(handleRejection))
}

async function  _eventListener(){
    //waitForAll(pollForTransactions(), eventTransferSubScribe(), logSubscribe(),eventSubscribe()).then(results=>console.log('done', results));
    waitForAll(pollForTransactions(), eventTransferSubScribe(), eventApprovalSubScribe()).then(results=>console.log('_eventListener done', results));
};

export  function  eventListener2(){
    _eventListener().then( res => { console.log("done")});
}

