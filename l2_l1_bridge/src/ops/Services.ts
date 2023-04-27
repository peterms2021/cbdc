import { Wallet } from "ethers";
import { approvalLoanFees } from "./CcfInterface";
import { gConnectionInfo } from "./Connect";
import { contractEvent } from "./EventInterface";

import {
    JSONRPC,
    JSONRPCClient,
    JSONRPCRequest,
    JSONRPCResponse
} from "json-rpc-2.0";

import fetch from "node-fetch";


function isMyAccount(addr:string): boolean{
    return gConnectionInfo.wallByAddrMap.has(addr);
}
function getBankNameFromAddress(v:string): string | null {

    gConnectionInfo.walByNameMap.forEach((value: Wallet, key: string) => {
        if(value.address == v){
            return key;
        }
    });

    console.log("bank name not found");
    return null;
}

export const processTransfer = async (trans:contractEvent): Promise<boolean | null> => {

    //see if the sender and reciever are wallets we own
    if(!isMyAccount(trans.from_owner)){

        console.log(`processTransfer: FROM is not my wallet ${trans.from_owner}`);
        return false;
    }

    if(!isMyAccount(trans.to_spender)){
        console.log(`processTransfer: TO is not my wallet ${trans.to_spender}`);
        return false;
    }

    //call CCF with the informaton about 
    let r:approvalLoanFees;

    r.fees = trans.value.toNumber();
    r.from = getBankNameFromAddress(trans.from_owner);
    r.to  =  getBankNameFromAddress(trans.to_spender);
    
    let url = 
    fetch('https://jsonplaceholder.typicode.com/todos', {
        method: 'POST',
        body: JSON.stringify(r),
        headers: { 'Content-Type': 'application/json' }
    })
        //then() function is used to convert the posted contents to the website into json format
        .then(result => result.json())
        //the posted contents to the website in json format is displayed as the output on the screen
        .then(jsonformat => console.log(jsonformat))
        .catch


    return false;
}


