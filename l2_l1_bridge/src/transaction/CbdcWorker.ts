
import Allowance from "../functions/Allowance.js";
import Approve from "../functions/Approve.js";
import BalanceOf from "../functions/BalanceOf.js";
import CreateHTLC from "../functions/CreateHTLC.js";
import CreateHTLCFor from "../functions/CreateHTLCFor.js";
import Decimals from "../functions/Decimals.js";
import DecreaseAllowance from "../functions/DecreaseAllowance.js";
import GetActiveHTLCs from "../functions/GetActiveHTLCs.js";
import GetAllHTLCs from "../functions/GetAllHTLCs";
import GetInactiveHTLCs from "../functions/GetInactiveHTLCs.js";
import HtlcAmount from "../functions/HtlcAmount.js";
import HtlcBalance from "../functions/HtlcBalance.js";
import HtlcEnabled from "../functions/HtlcEnabled.js";
import HtlcHashLock from "../functions/HtlcHashLock.js";
import HtlcPreimage from "../functions/HtlcPreimage.js";
import HtlcReceiver from "../functions/HtlcReceiver.js";
import HtlcRefunded from "../functions/HtlcRefunded.js";
import HtlcSeized from "../functions/HtlcSeized.js";
import HtlcSender from "../functions/HtlcSender.js";
import HtlcTimeLock from "../functions/HtlcTimeLock.js";
import HtlcWithdrawn from "../functions/HtlcWithdrawn.js";
import IncreaseAllowance from "../functions/IncreaseAllowance.js";
import IsKYCed from "../functions/IsKYCed.js";
import Name from "../functions/Name.js";
import NumKYCs from "../functions/NumKYCs.js";
import RefundHTLC from "../functions/RefundHTLC.js";
import Symbol from "../functions/Symbol.js";
import TotalSupply from "../functions/TotalSupply.js";
import Transfer from "../functions/Transfer.js";
import TransferFrom from "../functions/TransferFrom.js";
import WithdrawHTLC from "../functions/WithdrawHTLC.js";


import { BigNumber, Contract, utils } from "ethers";
import { gConnectionInfo } from "../Connect.js"
import GrantKYC from "../functions/GrantKYC.js";
import RevokeKYC from "../functions/RevokeKYC.js";

import { Accnt, transferFundsFrom, transferFundsFromResp, transferFunds, transferFundsResp, accntBalance , MoneySupply} from "./Interface.js";
import { approveFunds, approveFundsResp} from "./Interface.js";
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
            let [result, err] =  await BalanceOf(gConnectionInfo.cbdc, addr);
            if (err.length != 0) {
                console.log(`getAccountBalance: failed to call to BalanceOf bank name ${bankName} with err ${err}`);
                return null;
            }
            console.log(`getAccountBalance:... ${bankName} => ${utils.formatUnits(result, 2).toString()}`);
            const resp: accntBalance = {
                acct: bankName,
                balance: result.toNumber()
            };
            console.log(`getAccountBalance: ${bankName} => ${resp.balance}`);
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
            let [result, err] = await TotalSupply(gConnectionInfo.cbdc);
            if (err.length != 0) {
                console.log(`getMoneySupply: failed to call to BalanceOf bank with err ${err}`);
                return null;
            }
            const resp: MoneySupply = {
                bal: result.toNumber()
            }
            return resp;
        } catch (error) {
            console.log(`getMoneySupply: call failed to TotalSupply`);
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

        let [result, _err] = await TransferFrom(gConnectionInfo.cbdc, saddr,raddr,a);
        if (_err.length != 0) {
            console.log(`transferFrom: failed to call to TransferFrom  to: sender  ${trans.from}  recv: ${trans.to} amt: ${trans.amount}  bal: ${amt.balance } with err ${_err}`);
            //return null;
        }
        const resp: transferFundsFromResp = {
            from: trans.from,
            to: trans.to,
            amount: trans.amount,
            err:_err,
            result: _err.length?false:true
        }
        return resp;
    } catch (error) {
        console.log(`transferFrom: failed to call TransferFrom  sender  ${trans.from}  recv: ${trans.to} amt: ${trans.amount} `);
        return null;
    }
    
};


export const transfer = async (trans:transferFunds): Promise<transferFundsResp | null> => {

    let recvWallet = gConnectionInfo.wallets.get(trans.to);

    if(recvWallet  === undefined)
    {
        if(recvWallet ===  undefined){
            console.log(`transferFrom: unknown bank name ${trans.to}`);
        }  
        return null;
    }

    try {
        let raddr = await recvWallet.getAddress();
        let a: BigNumber = utils.parseUnits(trans.amount.toString(), 2);

        let [result, _err] = await Transfer(gConnectionInfo.cbdc,raddr,a);
        if (_err.length != 0) {
            console.log(`transferFrom: failed to call to Transfer  recv: ${trans.to} amt: ${trans.amount}  with err ${_err}`);
            //return null;
        }
        const resp: transferFundsResp = {
            to: trans.to,
            amount: trans.amount,
            err: _err,
            result: _err.length?false:true
        }
        return resp;
    } catch (error) {
        console.log(`transferFrom: failed to call Transfer recv: ${trans.to} amt: ${trans.amount} `);
        return null;
    }
    
};


export const approve = async (trans:approveFunds): Promise<approveFundsResp | null> => {

    let recvWallet = gConnectionInfo.wallets.get(trans.spender);

    if(recvWallet  === undefined)
    {
        if(recvWallet ===  undefined){
            console.log(`approve: unknown bank name ${trans.spender}`);
        }  
        return null;
    }

    try {
        let raddr = await recvWallet.getAddress();
        let a: BigNumber = utils.parseUnits(trans.amount.toString(), 2);

        let [result, _err] = await Transfer(gConnectionInfo.cbdc,raddr,a);
        if (_err.length != 0) {
            console.log(`approve: failed to call to approve  spender: ${trans.spender} amt: ${trans.amount}  with err ${_err}`);
            //return null;
        }
        const resp: approveFundsResp = {
            spender: trans.spender,
            amount: trans.amount,
            err: _err,
            result: _err.length?false:true
        }
        return resp;
    } catch (error) {
        console.log(`approve: failed to call approve spender: ${trans.spender} amt: ${trans.amount} `);
        return null;
    } 
};



export const increaseAllowance = async (trans:approveFunds): Promise<approveFundsResp | null> => {

    let recvWallet = gConnectionInfo.wallets.get(trans.spender);

    if(recvWallet  === undefined)
    {
        if(recvWallet ===  undefined){
            console.log(`increaseAllowance: unknown bank name ${trans.spender}`);
        }  
        return null;
    }

    try {
        let raddr = await recvWallet.getAddress();
        let a: BigNumber = utils.parseUnits(trans.amount.toString(), 2);

        let [result, _err] = await IncreaseAllowance(gConnectionInfo.cbdc,raddr,a);
        if (_err.length != 0) {
            console.log(`increaseAllowance: failed to call to approve  spender: ${trans.spender} amt: ${trans.amount}  with err ${_err}`);
            //return null;
        }
        const resp: approveFundsResp = {
            spender: trans.spender,
            amount: trans.amount,
            err: _err,
            result: _err.length?false:true
        }
        return resp;
    } catch (error) {
        console.log(`increaseAllowance: failed to call approve spender: ${trans.spender} amt: ${trans.amount} `);
        return null;
    } 
};


export const decreaseAllowance = async (trans:approveFunds): Promise<approveFundsResp | null> => {

    let recvWallet = gConnectionInfo.wallets.get(trans.spender);

    if(recvWallet  === undefined)
    {
        if(recvWallet ===  undefined){
            console.log(`decreaseAllowance: unknown bank name ${trans.spender}`);
        }  
        return null;
    }

    try {
        let raddr = await recvWallet.getAddress();
        let a: BigNumber = utils.parseUnits(trans.amount.toString(), 2);

        let [result, _err] = await DecreaseAllowance(gConnectionInfo.cbdc,raddr,a);
        if (_err.length != 0) {
            console.log(`decreaseAllowance: failed to call to approve  spender: ${trans.spender} amt: ${trans.amount}  with err ${_err}`);
            //return null;
        }
        const resp: approveFundsResp = {
            spender: trans.spender,
            amount: trans.amount,
            err: _err,
            result: _err.length?false:true
        }
        return resp;
    } catch (error) {
        console.log(`decreaseAllowance: failed to call approve spender: ${trans.spender} amt: ${trans.amount} `);
        return null;
    } 
};


