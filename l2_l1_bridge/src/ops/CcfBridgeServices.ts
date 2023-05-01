import { BigNumber, utils, Wallet } from "ethers";
import { approvalLoanFees, loanDetails, loanResponse } from "./CcfInterface.js";
import { enInfo, gConnectionInfo } from "./CbdcConnect.js";
import { contractEvent } from "./CbdcEventInterface.js";

import fetch from "node-fetch";
import { CCF_CLIENT_CERT_BUFFER, CCF_CLIENT_KEY_BUFFER, CCF_CONFIRM_LOAN, CCF_CONFIRM_TRANSFER , 
         CCF_GET_LOAN, CCF_LOAN_LOCK, CCF_PORT, CCF_SERVER_PORT, CCF_SERVER_URL, CCF_SERVICE_CERT_BUFFER, CCF_URL} from "./Env.js";
import CreateHTLCFor from "../functions/CreateHTLCFor.js";

import * as htlcService from "../transaction/HtlcWorker.js";
import TransferFrom from "../functions/TransferFrom.js";
import * as acctWorker from "../transaction/CbdcWorker.js";
import { transferFundsFrom } from "../transaction/TransInterface.js";
import { addAccountToWatch, isAccountBridgeWatchList } from "../transaction/BridgeRouter.js";


import https from 'https';
import { prettyPrint } from "./CbdcEventListener.js";



function httpsReq({body, ...options}) {
    return new Promise<string| null>((resolve,reject) => {
        const req = https.request({
            ...options,
        }, res => {
            const chunks = [];
            res.on('data', data => chunks.push(data))
            res.on('end', () => {
                let resBody = Buffer.concat(chunks);
                switch(res.headers['content-type']) {
                    case 'application/json':
                        resBody = JSON.parse(resBody.toString());
                        break;
                }
                resolve(resBody.toString())
                //resolve(resBody)
            })
        })
        req.on('error',reject);
        if(body) {
            req.write(body);
        }
        req.end();
    })
}



async function ccf_call(path_url:string, meth:string, args:any):Promise <string| null> {
    var options = {
        key: CCF_CLIENT_KEY_BUFFER,  // Secret client key
        cert:CCF_CLIENT_CERT_BUFFER, // Public client key
        ca: CCF_SERVICE_CERT_BUFFER, //mutual TLS service cert 
        // rejectUnauthorized: false,              // Used for self signed server
        hostname: enInfo.get(CCF_SERVER_URL),         // Server hostname
        port: CCF_PORT,          // Server port
        method: meth,
        path:path_url,
    };

    return httpsReq({
        options,
        body:   JSON.stringify(args) 
    })
}

export async function test_ccf(): Promise<void>{ 
    try{
        console.log(' test_ccf...')
        await ccf_call("/app/balance/current_account",'GET',"");
    }catch(err){
        console.log(`test_ccf Error ${err}`);
    }
}

async function sendHtlcToCCF(data:loanResponse) : Promise<void>{

    let path = enInfo.get(CCF_LOAN_LOCK);

    ccf_call(path, 'POST',data)
            //.then(result => result.json())
            //the posted contents 
            .then(jsonformat => console.log(prettyPrint(jsonformat)))
            .catch(err => console.log(`Error ${err}`));

    /*
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
     */   
}

export const processTransfer = async (trans:contractEvent): Promise<boolean | null> => {

    const data  = {} as  approvalLoanFees;
    data.fees = trans.value.toNumber();
    data.from = trans.from_owner;
    data.to  =  trans.to_spender;


    //format to 2 places of decimal
    console.log(`processTransfer: from ${trans.from_owner} -> ${trans.to_spender} amt:${utils.formatUnits(trans.value, 2).toString()}  : data: ${JSON.stringify(data)}`);

    //see if the sender and reciever are wallets we own
    if(!isAccountBridgeWatchList(trans.from_owner)){

        console.log(`processTransfer: FROM is not a wallet  being watched ${trans.from_owner}`);
        return false;
    }

    if(!isAccountBridgeWatchList(trans.to_spender)){
        console.log(`processTransfer: TO is not a wallet  being watched  ${trans.to_spender}`);
        return false;
    }

    //call CCF with the informaton about 
    let path = enInfo.get(CCF_CONFIRM_TRANSFER);

    ccf_call(path, 'POST',data)
        //.then(result => result.json())
        //the posted contents 
        .then(jsonformat => console.log(prettyPrint(jsonformat)))
        .catch(err => {
            console.log(`Error ${err}`);
            return false;
        });

    /*    
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
    */

    return true;
}



export const processApproval = async (trans:contractEvent): Promise<boolean | null> => {

    const  data = {} as approvalLoanFees;
    data.fees = trans.value.toNumber();
    data.from = trans.from_owner;
    data.to  =  trans.to_spender;

    //format to 2 places of decimal
    console.log(`processApproval: from ${trans.from_owner} -> ${trans.to_spender} amt:${utils.formatUnits(trans.value, 2).toString()} :  data: ${JSON.stringify(data)}`);

    //see if the sender and reciever are wallets we own
    if(!isAccountBridgeWatchList(trans.from_owner)){

        console.log(`processApproval: FROM is not a wallet  being watched  ${trans.from_owner}`);
        return false;
    }

    if(!isAccountBridgeWatchList(trans.to_spender)){
        console.log(`processApproval: TO is not a wallet  being watched ${trans.to_spender}`);
        return false;
    }

    //call CCF with the informaton about 
    
    let path = enInfo.get(CCF_CONFIRM_LOAN);

    ccf_call(path, 'POST',data)
        //.then(result => result.json())
        //the posted contents 
        .then(jsonformat => console.log(prettyPrint(jsonformat)))
        .catch(err => {
            console.log(`Error ${err}`);
            return false;
        });

    /*
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
    */

    return true;
}

let errCnt:number =0;
export const pullNewTransaction = async (): Promise<boolean | null> => {

    let path = enInfo.get(CCF_GET_LOAN);

    test_ccf();

    ccf_call(path, 'GET','')
        //then() function is used to convert the posted contents to the website into json format
        .then(async result => {

            errCnt =0;
            let trans = JSON.parse(result) as unknown as loanDetails;
            
            console.log(`New transaction`, prettyPrint(trans));

            //get the contract for the senders account
            //create the HTLC for
            let a: BigNumber = utils.parseUnits(trans.collateral.toString(), 2);
            let [htlock, err] = await htlcService.createHTLCFor( trans.from, trans.to, trans.secret,  trans.duration.toString(),a );
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
            sendHtlcToCCF(r);            
        })
        //the posted contents to the website in json format is displayed as the output on the screen
        //.then(jsonformat => console.log(jsonformat))
        .catch(err => {
            //if(errCnt==0)
                console.log(`Error ${err}`);
            errCnt++;    
        });

    return true;
}


