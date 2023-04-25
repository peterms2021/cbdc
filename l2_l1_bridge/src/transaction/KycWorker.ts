import { Accnt, transferFundsFrom, transferFundsFromResp, accntBalance , MoneySupply} from "./Interface.js";
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



// KYC functions

export const checkKyc  = async (bankName: string): Promise<boolean | null> =>  {

    let bankWallet = gConnectionInfo.wallets.get(bankName);

    if(bankWallet ===  undefined)
    {
        console.log(`checkKyc: unknown bank name ${bankName}`);
        return null;
    }

    let cbdc = gConnectionInfo.cbdc;
    if(cbdc === undefined){
        console.log(`checkKyc: no contract exist`);
        return null;
    }
    else
    {
        try {       
            let saddr = await bankWallet.getAddress();
            let [result, err] = await IsKYCed(gConnectionInfo.cbdc, saddr);
            if (err.length != 0) {
                console.log(`checkKyc: failed to call to BalanceOf bank with err ${err}`);
                return null;
            }            
            return result;
        } catch (error) {
            console.log(`checkKyc: call failed`);
            return null;
        }
    }
};


export const grantKyc  = async (bankName: string): Promise<boolean | null> =>  {

    let bankWallet = gConnectionInfo.wallets.get(bankName);

    if(bankWallet ===  undefined)
    {
        console.log(`grantKyc: unknown bank name ${bankName}`);
        return null;
    }

    let cbdc = gConnectionInfo.cbdc;
    if(cbdc === undefined){
        console.log(`grantKyc: no contract exist`);
        return null;
    }
    else
    {
        try {       
            let saddr = await bankWallet.getAddress();
            let [result, err] = await GrantKYC(gConnectionInfo.cbdc, saddr);
            if (err.length != 0) {
                console.log(`grantKyc: failed to call to BalanceOf bank with err ${err}`);
                return null;
            }            
            return result;
        } catch (error) {
            console.log(`grantKyc: failed`);
            return null;
        }
    }
};

export const numKyc  = async (bankName: string): Promise<BigNumber | null> =>  {

    let bankWallet = gConnectionInfo.wallets.get(bankName);

    if(bankWallet ===  undefined)
    {
        console.log(`numKyc: unknown bank name ${bankName}`);
        return null;
    }

    let cbdc = gConnectionInfo.cbdc;
    if(cbdc === undefined){
        console.log(`numKyc: no contract exist`);
        return null;
    }
    else
    {
        try {       
            let saddr = await bankWallet.getAddress();
            let [result, err] = await NumKYCs(gConnectionInfo.cbdc, saddr);
            if (err.length != 0) {
                console.log(`numKyc: failed to call to BalanceOf bank with err ${err}`);
                return null;
            }            
            return result;
        } catch (error) {
            console.log(`numKyc: failed`);
            return null;
        }
    }
};


export const revokeKyc  = async (bankName: string): Promise<boolean | null> =>  {

    let bankWallet = gConnectionInfo.wallets.get(bankName);

    if(bankWallet ===  undefined)
    {
        console.log(`revokeKyc: unknown bank name ${bankName}`);
        return null;
    }

    let cbdc = gConnectionInfo.cbdc;
    if(cbdc === undefined){
        console.log(`revokeKyc: no contract exist`);
        return null;
    }
    else
    {
        try {       
            let saddr = await bankWallet.getAddress();
            let [result, err] = await RevokeKYC(gConnectionInfo.cbdc, saddr);
            if (err.length != 0) {
                console.log(`revokeKyc: failed to call to BalanceOf bank with err ${err}`);
                return null;
            }            
            return result;
        } catch (error) {
            console.log(`revokeKyc: failed`);
            return null;
        }
    }
};

