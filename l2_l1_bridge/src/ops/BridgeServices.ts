import { BigNumber, utils, Wallet } from "ethers";
import { approvalLoanFees, loanDetails, loanResponse } from "./CcfInterface.js";
import { enInfo, gConnectionInfo } from "./Connect.js";
import { contractEvent } from "./EventInterface.js";

import {
    JSONRPC,
    JSONRPCClient,
    JSONRPCRequest,
    JSONRPCResponse
} from "json-rpc-2.0";

import fetch from "node-fetch";
import { CCF_CONFIRM_LOAN, CCF_CONFIRM_TRANSFER , CCF_GET_LOAN, CCF_LOAN_LOCK} from "./Env.js";
import CreateHTLCFor from "../functions/CreateHTLCFor.js";

import * as htlcService from "../transaction/HtlcWorker.js";
import TransferFrom from "../functions/TransferFrom.js";
import * as acctWorker from "../transaction/CbdcWorker.js";
import { transferFundsFrom } from "../transaction/TransInterface.js";
import { addAccountToWatch, isAccountBridgeWatchList } from "../transaction/BridgeRouter.js";



async function sendHtlcLockToCCF(data:loanResponse) : Promise<void>{

    let url = enInfo.get(CCF_LOAN_LOCK);

    fetch(url, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' }
    })
        //then() function is used to convert the posted contents to the website into json format
        .then(result => result.json())
        //the posted contents to the website in json format is displayed as the output on the screen
        .then(jsonformat => console.log(jsonformat))
        .catch(err => console.log(`Error ${err}`));
}

export const processTransfer = async (trans:contractEvent): Promise<boolean | null> => {

    //see if the sender and reciever are wallets we own
    if(!isAccountBridgeWatchList(trans.from_owner)){

        console.log(`processTransfer: FROM is not my wallet ${trans.from_owner}`);
        return false;
    }

    if(!isAccountBridgeWatchList(trans.to_spender)){
        console.log(`processTransfer: TO is not my account ${trans.to_spender}`);
        return false;
    }

    //call CCF with the informaton about 
    let data:approvalLoanFees;

    data.fees = trans.value.toNumber();
    data.from = trans.from_owner;
    data.to  =  trans.to_spender;
    
    let url = enInfo.get(CCF_CONFIRM_TRANSFER);

    fetch(url, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' }
    })
        //then() function is used to convert the posted contents to the website into json format
        .then(result => result.json())
        //the posted contents to the website in json format is displayed as the output on the screen
        .then(jsonformat => console.log(jsonformat))
        .catch(err => console.log(`Error ${err}`));

    return true;
}



export const processApproval = async (trans:contractEvent): Promise<boolean | null> => {

    //see if the sender and reciever are wallets we own
    if(!isAccountBridgeWatchList(trans.from_owner)){

        console.log(`processTransfer: FROM is not my wallet ${trans.from_owner}`);
        return false;
    }

    if(!isAccountBridgeWatchList(trans.to_spender)){
        console.log(`processTransfer: TO is not my wallet ${trans.to_spender}`);
        return false;
    }

    //call CCF with the informaton about 
    let data:approvalLoanFees;

    data.fees = trans.value.toNumber();
    data.from = trans.from_owner;
    data.to  =  trans.to_spender;
    
    let url = enInfo.get(CCF_CONFIRM_LOAN);

    fetch(url, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' }
    })
        //then() function is used to convert the posted contents to the website into json format
        .then(result => result.json())
        //the posted contents to the website in json format is displayed as the output on the screen
        .then(jsonformat => console.log(jsonformat))
        .catch(err => console.log(`Error ${err}`));

    return true;
}

let errCnt:number =0;
export const pullNewTransaction = async (): Promise<boolean | null> => {

    let url = enInfo.get(CCF_GET_LOAN);

    fetch(url)
        //then() function is used to convert the posted contents to the website into json format
        .then(async result => {

            errCnt =0;
            let trans = result.json() as unknown as loanDetails;
            
            console.log(`New transaction ${trans}`);

            //get the contract for the senders account
            //create the HTLC for
            let a: BigNumber = utils.parseUnits(trans.collateral.toString(), 2);
            let [htlock, err] = await htlcService.createHTLCFor( trans.to,  trans.secret,  trans.duration.toString(),a );
            let r:loanResponse;

            r.secret = trans.secret;
            
            if (err.length) {
                console.log(`Unable to createHTLOCK for ${trans}`);
                //posrt failure to ccf
                //return false;
                r.err = err;
            }else{
                r.htlc = htlock;

                //add the account to watch for approval and transfer
                addAccountToWatch(trans.to);
                addAccountToWatch(trans.from);
            }
            
            //send the htlock back
            sendHtlcLockToCCF(r);            
        })
        //the posted contents to the website in json format is displayed as the output on the screen
        .then(jsonformat => console.log(jsonformat))
        .catch(err => {
            if(errCnt==0)
                console.log(`Error ${err}`);
            errCnt++;    
        });

    return true;
}


