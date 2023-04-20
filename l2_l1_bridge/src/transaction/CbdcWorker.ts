import { Accnt, transferFundsFrom, transferFundsFromResp, accntBalance , MoneySupply} from "./Interface.js";
import { BalanceOf } from "../functions/BalanceOf.js"
import {TotalSupply} from "../functions/TotalSupply.js"
import { BigNumber, Contract, utils } from "ethers";
import {TransferFrom} from "../functions/TransferFrom.js"

import { gConnectionInfo } from "../Connect.js"


/**
 * Worker Methods
 */

export const getAccountBalance = async (bankName: string): Promise<accntBalance | null> => {
    //lookup the account name in our env table

    let wallet = gConnectionInfo.wallets.get(bankName);

    if (wallet === undefined) {
        console.log(`getAccountBalance: unknown bank name ${bankName}`);
        return null;
    }
    else {
        try {
            let addr = await wallet.getAddress();
            let [result, err] = BalanceOf(gConnectionInfo.cbdc, addr);
            if (err.length != 0) {
                console.log(`getAccountBalance: failed to call to BalanceOf bank name ${bankName} with err ${err}`);
                return null;
            }
            const resp: accntBalance = {
                acct: bankName,
                balance: result.toNumber()
            }
            return resp;
        } catch (error) {
            console.log(`getAccountBalance: failed to calle BalanceOf bank name ${bankName}`);
            return null;
        }
    }
};

export const getMoneySupply  = async (): Promise<MoneySupply | null> =>  {
    let cbdc = gConnectionInfo.cbdc;
    if(cbdc === undefined){
        console.log(`getMoneySupply: no contract exist`);
        return null;
    }
    else
    {
        try {       
            let [result, err] = TotalSupply(gConnectionInfo.cbdc);
            if (err.length != 0) {
                console.log(`getMoneySupply: failed to call to BalanceOf bank with err ${err}`);
                return null;
            }
            const resp: MoneySupply = {
                bal: result.toNumber()
            }
            return resp;
        } catch (error) {
            console.log(`getMoneySupply: failed to call TotalSupply`);
            return null;
        }
    }
};




export const transferFrom = async (trans:transferFundsFrom): Promise<transferFundsFromResp | null> => {
    //lookup the account name in our env table

    let sendWallet = gConnectionInfo.wallets.get(trans.from);
    let recvWallet = gConnectionInfo.wallets.get(trans.to);
   

    if(sendWallet ===  undefined ||  recvWallet  === undefined)
    {
        if(sendWallet ===  undefined){
            console.log(`transferFrom: unknown bank name ${trans.from}`);
        }

        if(recvWallet ===  undefined){
            console.log(`transferFrom: unknown bank name ${trans.to}`);
        }  
        return null;
    }

    //check if the sender has enough funds
    // should we lock the account?? Even though the transfer on the L1 will fail 
    // if there is in adequete balance in  the senders account, we need to check 
    // so we can report  accurately

    let bal:any = await getAccountBalance(trans.from);

    if(bal === undefined){
        console.log(`transferFrom: cannot get balance of bank name ${trans.from}`);
        return null;
    }
    let amt = bal as accntBalance;
    if (amt.balance < trans.amount)
    {
        console.log(`transferFrom: inadequete balance in account for transfer to: sender  ${trans.from} amt: ${trans.amount} < ${amt.balance }`);
        return null;
    }
  
    try {
        let saddr = await sendWallet.getAddress();
        let raddr = await recvWallet.getAddress();
        let a: BigNumber = utils.parseUnits(trans.amount.toString(), 2);

        let [result, err] = TransferFrom(gConnectionInfo.cbdc, saddr,raddr,a);
        if (err.length != 0) {
            console.log(`transferFrom: failed to call to TransferFrom  to: sender  ${trans.from}  recv: ${trans.to} amt: ${trans.amount}  bal: ${amt.balance } with err ${err}`);
            return null;
        }
        const resp: transferFundsFromResp = {
            from: trans.from,
            to: trans.to,
            amount: trans.amount,
            result: true
        }
        return resp;
    } catch (error) {
        console.log(`transferFrom: failed to call TransferFrom  sender  ${trans.from}  recv: ${trans.to} amt: ${trans.amount} `);
        return null;
    }
    
};
