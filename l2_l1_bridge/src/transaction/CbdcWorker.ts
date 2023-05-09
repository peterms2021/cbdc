
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
import { enInfo, gConnectionInfo } from "../ops/CbdcConnect.js"
import GrantKYC from "../functions/GrantKYC.js";
import RevokeKYC from "../functions/RevokeKYC.js";

import { Accnt, transferFundsFrom, transferFundsFromResp, transferFunds, transferFundsResp, accntBalance , MoneySupply, allowAnce, allowAnceResp} from "./TransInterface.js";
import { approveFunds, approveFundsResp} from "./TransInterface.js";
/**
 * Worker Methods
 */

export const getAccountBalance = async (): Promise<accntBalance | null> => {
    //lookup the account name in our env table

    let addr = await gConnectionInfo.wallet.getAddress();
    try {      
        let cbdc = gConnectionInfo.cbdc;
        let [result, err] =  await BalanceOf(cbdc, addr);
        if (err.length != 0) {
            console.log(`getAccountBalance: failed to call to BalanceOf bank name ${addr} with err ${err}`);
            return null;
        }
        console.log(`getAccountBalance:... ${addr} => ${utils.formatUnits(result, 2).toString()}`);

        let n = utils.formatUnits(result, 2).toString();
        const resp: accntBalance = {
            acct: addr,
            balance: Number.parseFloat(n)
        };
        console.log(`getAccountBalance: ${addr} => ${resp.balance}`);
        return resp;
    } catch (error) {
        console.log(`getAccountBalance: failed to calle BalanceOf for address name ${addr}`);
        return null;
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
            let cbdc = gConnectionInfo.cbdc;
            let [result, err] = await TotalSupply(cbdc);
            if (err.length != 0) {
                console.log(`getMoneySupply: failed to call to TotalSupply bank with err ${err}`);
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


export const allowance = async (trans:allowAnce): Promise<allowAnceResp | null> => {
 
    console.log(`allowance: ${JSON.stringify(trans)}`);
    try {       
        let cbdc = gConnectionInfo.cbdc;
        let [_result, _err] = await Allowance(cbdc, trans.owner,trans.spender);
        if (_err.length != 0) {
            console.log(`allowance: failed to call to Allowance  to: sender  ${trans.owner}  recv: ${trans.spender} amt: with err ${_err}`);
            return null;
        }
        //convert to two decimal places
        let a =  parseFloat( utils.formatUnits(_result, 2));

        const resp: allowAnceResp = {
            owner: trans.owner,
            spender: trans.spender,
            amt:  a,
            err:_err,
            result: _err.length?false:true
        }
        return resp;
    } catch (error) {
        console.log(`allowance: failed to call Allowance  sender  ${trans.owner}  recv: ${trans.spender} `);
        return null;
    }
    
};


export const transferFrom = async (trans:transferFundsFrom): Promise<transferFundsFromResp | null> => {
 
    try {
        
        let a: BigNumber = utils.parseUnits(trans.amount.toString(), 2);

        console.log(`transferFrom req:  sender  ${trans.from}  recv: ${trans.to} amt: ${trans.amount} => ${a.toString()}`);

        let cbdc = gConnectionInfo.cbdc;
        let [result, _err] = await TransferFrom(cbdc, trans.from,trans.to,a);
        if (_err.length != 0) {
            console.log(`transferFrom: failed to call to TransferFrom  to: sender  ${trans.from}  recv: ${trans.to} amt: ${trans.amount}  with err ${_err}`);
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
 
    try {

        let a: BigNumber = utils.parseUnits(trans.amount.toString(), 2);

        console.log(`transfer req:   recv: ${trans.to} amt: ${trans.amount} => ${a.toString()}`);

        //use the 
        let cbdc = gConnectionInfo.cbdc;
        let [result, _err] = await Transfer(cbdc,trans.to,a);
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

    try {
        let a: BigNumber = utils.parseUnits(trans.amount.toString(), 2);

        let cbdc = gConnectionInfo.cbdc;
        let [result, _err] = await Approve(cbdc,trans.spender,a);
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

    try {
       
        let a: BigNumber = utils.parseUnits(trans.amount.toString(), 2);
        console.log(`increaseAllowance amnt: ${trans.amount} => ${a}`);

        let cbdc = gConnectionInfo.cbdc;
        let [result, _err] = await IncreaseAllowance(cbdc,trans.spender,a);
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

    try {
        let a: BigNumber = utils.parseUnits(trans.amount.toString(), 2);
        console.log(`decreaseAllowance amnt: ${trans.amount} => ${a}`);

        let cbdc = gConnectionInfo.cbdc;
        let [result, _err] = await DecreaseAllowance(cbdc,trans.spender,a);
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




