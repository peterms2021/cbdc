
import Allowance from "../functions/Allowance.js";
import Approve from "../functions/Approve.js";
import BalanceOf from "../functions/BalanceOf.js";
import CreateHTLC from "../functions/CreateHTLC.js";
import CreateHTLCFor from "../functions/CreateHTLCFor.js";
import Decimals from "../functions/Decimals.js";
import DecreaseAllowance from "../functions/DecreaseAllowance.js";
import GetActiveHTLCs from "../functions/GetActiveHTLCs.js";
import GetAllHTLCs from "../functions/GetAllHTLCs.js";
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

import { Accnt, transferFundsFrom, transferFundsFromResp, transferFunds, transferFundsResp, accntBalance , MoneySupply} from "./TransInterface.js";
import { approveFunds, approveFundsResp} from "./TransInterface.js";



export const createHTLC = async (receiver: string, hashlock:string, timelock: string, amount:BigNumber ): Promise<[htclock: string, err: string] | null> => {

    try {
        let cbdc = gConnectionInfo.cbdc;
        let [htlock, err] =  await CreateHTLC(cbdc, receiver, hashlock, timelock,amount);
        if (err.length != 0) {
            console.log(`worker createHTLC: failed to call to createHTLC account ${receiver} with err ${err}`);
            //return null;
        }else{
            console.log(`createHTLC:... ${receiver} => ${htlock}`);
        }
        return [htlock, err];
    } catch (error) {
        console.log(`createHTLC: failed on account receiver:${receiver}`);
        return null;
    }
    
};



export const createHTLCFor = async ( sender: string, receiver: string, hashlock:string, timelock: string, amount:BigNumber ): Promise<[htclock: string, err: string] | null> => {
 
    try {
        console.log(`worker createHTLCFor: sender:${sender} receiver:${receiver} hashlock:${hashlock}  timelock:${timelock} : amount:${amount}`)
        
        let cbdc = gConnectionInfo.cbdc;
        let [htlock, err] =  await CreateHTLCFor(cbdc, sender, receiver, hashlock, timelock,amount);
        if (err.length != 0) {
            console.log(`createHTLCFor: failed to call to createHTLCFor account  ${receiver} with err ${err}`);
            //return null;
        }else{
            console.log(`createHTLCFor:... ${receiver} => ${htlock}`);
        }
        return [htlock, err];
    } catch (error) {
        console.log(`createHTLCFor: failed to called on account ${receiver}`);
        return null;
    }
    
};


export const getActiveHTLCs = async (): Promise<[result: Array<string>, err: string] | null> => {

    try {
        
        let cbdc = gConnectionInfo.cbdc;
        let [htlock, err] = await GetActiveHTLCs(cbdc);
        if (err.length != 0) {
            console.log(`getActiveHTLCs: failed with err ${err}`);
            //return null;
        } else {
            //const myJSON = JSON.stringify(htlock)
            //console.log(`getActiveHTLCs:... => ${myJSON}`);
        }
        return [htlock, err];
    } catch (error) {
        console.log(`getActiveHTLCs: failed `);
        return null;
    }
};

export const getInactiveHTLCs = async (): Promise<[result: Array<string>, err: string] | null> => {

    try {
        
        let cbdc = gConnectionInfo.cbdc;
        let [htlock, err] = await GetInactiveHTLCs(cbdc);
        if (err.length != 0) {
            console.log(`getInactiveHTLCs: failed with err ${err}`);
            //return null;
        } else {
            console.log(`getInactiveHTLCs:... => ${htlock}`);
        }
        return [htlock, err];
    } catch (error) {
        console.log(`getInactiveHTLCs: failed `);
        return null;
    }
};


export const getAllHTLCs = async (): Promise<[result: Array<string>, err: string] | null> => {

    try {

        let cbdc = gConnectionInfo.cbdc;
        let [htlock, err] = await GetAllHTLCs(cbdc);
        if (err.length != 0) {
            console.log(`getAllHTLCs: failed with err ${err}`);
            //return null;
        } else {
            console.log(`getAllHTLCs:... => ${htlock}`);
        }
        return [htlock, err];
    } catch (error) {
        console.log(`getAllHTLCs: failed `);
        return null;
    }
};



export const getHtlcAmount = async (htlc:string): Promise<[result:number, err: string] | null> => {
  
    try {

        let cbdc = gConnectionInfo.cbdc;
        let [htlock, err] = await HtlcAmount(cbdc, htlc);
        if (err.length != 0) {
            console.log(`getHtlcAmount: failed with err ${err}`);
            //return null;
        } else {
            console.log(`getHtlcAmount:... => ${htlock}`);
        }
        return [htlock, err];
    } catch (error) {
        console.log(`getHtlcAmount: failed `);
        return null;
    }
    
};


export const getHtlcBalance = async (htlc:string): Promise<[result:number, err: string] | null> => {
  
    try {

        let cbdc = gConnectionInfo.cbdc;
        let [htlock, err] = await HtlcBalance(cbdc, htlc);
        if (err.length != 0) {
            console.log(`getHtlcBalance: failed with err ${err}`);
            //return null;
        } else {
            console.log(`getHtlcBalance:... => ${htlock}`);
        }
        return [htlock, err];
    } catch (error) {
        console.log(`getHtlcBalance: failed `);
        return null;
    }
    
};

export const getHtlcEnabled = async (htlc:string): Promise<[result:boolean, err: string] | null> => {
  
    try {

        let cbdc = gConnectionInfo.cbdc;
        let [htlock, err] = await HtlcEnabled(cbdc, htlc);
        if (err.length != 0) {
            console.log(`getHtlcEnabled: failed with err ${err}`);
            //return null;
        } else {
            console.log(`getHtlcEnabled:... => ${htlock}`);
        }
        return [htlock, err];
    } catch (error) {
        console.log(`getHtlcEnabled: failed `);
        return null;
    }
    
};



export const htlcHashLock = async (htlc:string): Promise<[result:string, err: string] | null> => {
  
    try {
        let cbdc = gConnectionInfo.cbdc;
        let [htlock, err] = await HtlcHashLock(cbdc, htlc);
        if (err.length != 0) {
            console.log(`htlcHashLock: failed with err ${err}`);
            //return null;
        } else {
            console.log(`htlcHashLock:... => ${htlock}`);
        }
        return [htlock, err];
    } catch (error) {
        console.log(`htlcHashLock: failed `);
        return null;
    }
    
};


export const htlcPreimage = async (htlc:string): Promise<[result:string, err: string] | null> => {
  
    try {
        let cbdc = gConnectionInfo.cbdc;
        let [htlock, err] = await HtlcPreimage(cbdc, htlc);
        if (err.length != 0) {
            console.log(`htlcPreimage: failed with err ${err}`);
            //return null;
        } else {
            console.log(`htlcPreimage:... => ${htlock}`);
        }
        return [htlock, err];
    } catch (error) {
        console.log(`htlcPreimage: failed `);
        return null;
    }
    
};

export const htlcReceiver = async (htlc:string): Promise<[result:string, err: string] | null> => {
  
    try {
        let cbdc = gConnectionInfo.cbdc;
        let [htlock, err] = await HtlcReceiver(cbdc, htlc);
        if (err.length != 0) {
            console.log(`htlcReceiver: failed with err ${err}`);
            //return null;
        } else {
            console.log(`htlcReceiver:... => ${htlock}`);
        }
        return [htlock, err];
    } catch (error) {
        console.log(`htlcReceiver: failed `);
        return null;
    }
    
};

export const htlcRefunded = async (htlc:string): Promise<[result:boolean, err: string] | null> => {
  
    try {
        let cbdc = gConnectionInfo.cbdc;
        let [htlock, err] = await HtlcRefunded(cbdc, htlc);
        if (err.length != 0) {
            console.log(`htlcRefunded: failed with err ${err}`);
            //return null;
        } else {
            console.log(`htlcRefunded:... => ${htlock}`);
        }
        return [htlock, err];
    } catch (error) {
        console.log(`htlcRefunded: failed `);
        return null;
    }
    
};

export const htlcSeized = async (htlc:string): Promise<[result:boolean, err: string] | null> => {
  
    try {
        let cbdc = gConnectionInfo.cbdc;
        let [htlock, err] = await HtlcSeized(cbdc, htlc);
        if (err.length != 0) {
            console.log(`htlcSeized: failed with err ${err}`);
            //return null;
        } else {
            console.log(`htlcSeized:... => ${htlock}`);
        }
        return [htlock, err];
    } catch (error) {
        console.log(`htlcSeized: failed `);
        return null;
    }
    
};

export const htlcSender = async (htlc:string): Promise<[result:string, err: string] | null> => {
  
    try {
        let cbdc = gConnectionInfo.cbdc;
        let [htlock, err] = await HtlcSender(cbdc, htlc);
        if (err.length != 0) {
            console.log(`htlcSender: failed with err ${err}`);
            //return null;
        } else {
            console.log(`htlcSender:... => ${htlock}`);
        }
        return [htlock, err];
    } catch (error) {
        console.log(`htlcSender: failed `);
        return null;
    }
    
};


export const htlcTimeLock = async (htlc:string): Promise<[result:BigNumber, err: string] | null> => {
  
    try {
        let cbdc = gConnectionInfo.cbdc;
        let [htlock, err] = await HtlcTimeLock(cbdc, htlc);
        if (err.length != 0) {
            console.log(`htlcSender: failed with err ${err}`);
            //return null;
        } else {
            console.log(`htlcSender:... => ${htlock}`);
        }
        return [htlock, err];
    } catch (error) {
        console.log(`htlcSender: failed `);
        return null;
    }
    
};

export const htlcWithdrawn = async (htlc:string): Promise<[result:boolean, err: string] | null> => {
  
    try {
        let cbdc = gConnectionInfo.cbdc;
        let [htlock, err] = await HtlcWithdrawn(cbdc, htlc);
        if (err.length != 0) {
            console.log(`htlcWithdrawn: failed with err ${err}`);
            //return null;
        } else {
            console.log(`htlcWithdrawn:... => ${htlock}`);
        }
        return [htlock, err];
    } catch (error) {
        console.log(`htlcWithdrawn: failed `);
        return null;
    }
    
};


export const htlcRefund = async (htlc:string): Promise<[result:string, err: string] | null> => {
  
    try {
        let cbdc = gConnectionInfo.cbdc;
        let [htlock, err] = await RefundHTLC(cbdc, htlc);
        if (err.length != 0) {
            console.log(`htlcRefund: failed with err ${err}`);
            //return null;
        } else {
            console.log(`htlcRefund:... => ${htlock}`);
        }
        return [htlock, err];
    } catch (error) {
        console.log(`htlcRefund: failed `);
        return null;
    }  
};

export const htlcWithdraw = async (htlc: string,  preimage: string): Promise<[result:string, err: string] | null> => {
  
    try {
        let cbdc = gConnectionInfo.cbdc;
        let [htlock, err] = await WithdrawHTLC(cbdc, htlc, preimage);
        if (err.length != 0) {
            console.log(`htlcWithdraw: failed with err ${err}`);
            //return null;
        } else {
            console.log(`htlcWithdraw:... => ${htlock}`);
        }
        return [htlock, err];
    } catch (error) {
        console.log(`htlcWithdraw: failed `);
        return null;
    }  
};




