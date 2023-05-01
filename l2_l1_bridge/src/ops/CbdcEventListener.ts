
import process from 'process'
import Web3 from 'web3'
import util  from 'util'

import * as cbdcLib from './CbdcConnect.js';
import * as envLib from './Env.js';
import { BigNumber, Contract, ethers, Wallet } from 'ethers';
import { contractEvent } from './CbdcEventInterface.js';
import { enInfo, gConnectionInfo } from './CbdcConnect.js';
import { CCF_POLL_NEW_TRANS, loadCcfBridgeData } from './Env.js';
import { processApproval, processTransfer, pullNewTransaction } from './CcfBridgeServices.js';

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
    //console.log("setup done...");
    return [ iface.web3, networkId, contractAddress, cbdc, iface.wallet ]
}

export const prettyPrint = (o:any) => {
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
                console.log( JSON.stringify(transferEvent, null, 4));

                const  v = {} as contractEvent;
                v.from_owner = from as string;
                v.to_spender = to as string;
                v.value = value as BigNumber;

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
                //console.log( prettyPrint(JSON.stringify(approvalEvent, null, 4)));
                console.log( JSON.stringify(approvalEvent, null, 4));

                const  v = {} as contractEvent;
                v.from_owner = approvalEvent.owner as string;
                v.to_spender = approvalEvent.spender as string;
                v.value = approvalEvent.value as BigNumber;
                
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
            //console.log("Checking for transaction...");
            pullNewTransaction();
          }, n);
    })
};


async function  _eventListener(){
    let [pt, et, ea] =  await Promise.all([pollForTransactions(), eventTransferSubScribe(), eventApprovalSubScribe()]);
};

export  function  bridgeEventListener(){
    loadCcfBridgeData();
    _eventListener().then( res => { console.log(" bridgeEventListener done")});
}

