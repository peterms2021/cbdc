import { BigNumber, utils, Wallet } from "ethers";
/*
import {
  pendingTransactionsTypeCreateHtlcFor,
  pendingTransactionsTypeCreateHtlcForResp,
  pendingTransactionsTypeWaitForAllowance,
  AWAIT_ALLOWANCE,
  CREATE_HTLC_FOR,
  CLOSE_LOAN,
  REFUND_HTLC,
  WITHDRAW_HTLC,
} from "./CcfInterface.js";
*/
import * as WorkerService from "../transaction/CbdcWorker.js";

import { enInfo, gConnectionInfo } from "./CbdcConnect.js";
import { contractEvent } from "./CbdcEventInterface.js";
import {
  CCF_CLIENT_CERT_BUFFER,
  CCF_CLIENT_KEY_BUFFER,
  CCF_CONFIRM_LOAN,
  CCF_CONFIRM_TRANSFER,
  CCF_GET_LOAN,
  CCF_LOAN_LOCK,
  CCF_PORT,
  CCF_SERVER_PORT,
  CCF_SERVER_NAME,
  CCF_SERVICE_CERT_BUFFER,
  CCF_HOST_NAME,
} from "./Env.js";
import CreateHTLCFor from "../functions/CreateHTLCFor.js";
import * as htlcService from "../transaction/HtlcWorker.js";
import TransferFrom from "../functions/TransferFrom.js";
import * as acctWorker from "../transaction/CbdcWorker.js";
import { allowAnce, transferFundsFrom } from "../transaction/TransInterface.js";

import https from "https";
import { prettyPrint } from "./Env.js";
import { IAwaitAllowancePayload, ICloseLoanPayload, ICreateHtlcForPayload, IRefundHtlcPayload, IWithdrawHtlcPayload, TransactionType } from "./bank_interface.js";

function httpsReq(body: any, _options: any) {
  return new Promise<any | null>((resolve, reject) => {
    const req = https.request(_options, (res) => {
      const chunks = [];
      res.on("data", (data) => chunks.push(data));
      res.on("end", () => {
        let resBody = Buffer.concat(chunks);
        switch (res.headers["content-type"]) {
          case "application/json":
            //console.log(`resp data: ${resBody.toString()}`);
            //let jSonResBody = JSON.parse(resBody.toString());
            //resolve(jSonResBody);
            break;            
        }
        resolve(resBody);
      });
    });
    req.on("error", reject);

    if (body) {
      req.write(body);
    }
    req.end();
  });
}

async function ccf_post_call(path_url: string, args: any): Promise<any | null> {
  const options = {
    key: CCF_CLIENT_KEY_BUFFER, // Secret client key
    cert: CCF_CLIENT_CERT_BUFFER, // Public client key
    ca: [CCF_SERVICE_CERT_BUFFER], //mutual TLS service cert
    //rejectUnauthorized: false,              // Used for self signed server
    hostname: enInfo.get(CCF_SERVER_NAME), // Server hostname
    method: "POST",
    path: path_url,
    headers: {
      "Content-Type": "application/json",
      "Content-Length": JSON.stringify(args).length,
    },
  };
  return httpsReq(JSON.stringify(args), options);
}

async function ccf_get_call(path_url: string, args: any): Promise<any | null> {
  const options = {
    key: CCF_CLIENT_KEY_BUFFER, // Secret client key
    cert: CCF_CLIENT_CERT_BUFFER, // Public client key
    ca: [CCF_SERVICE_CERT_BUFFER], //mutual TLS service cert
    //rejectUnauthorized: false,              // Used for self signed server
    hostname: enInfo.get(CCF_SERVER_NAME), // Server hostname
    method: "GET",
    path: path_url,
  };

  // console.log(`ccf_call: ${JSON.stringify(options)}`);
  return httpsReq(JSON.stringify(args), options);
}

export async function test_ccf(): Promise<void> {
  try {
    console.log(" test_ccf...");
    let path = "/app/pendingtransactions";
    //let path = "/app/";
    await ccf_get_call(path, "")
      .then(async (jsonformat) => console.log(prettyPrint(jsonformat)))
      .catch((err) => console.log(`Error ${err}`));
  } catch (err) {
    console.log(`test_ccf Error ${err}`);
  }
}
var bCALL_PROCESS_NEW_TRANACTION_ON_EVENT=false;

export const processTransfer = async (trans: contractEvent): Promise<void> => {
  //format to 2 places of decimal
  console.log(
    `processTransfer: from ${trans.from_owner} -> ${
      trans.to_spender
    } amt:${utils.formatUnits(trans.value, 2).toString()}`
  );

  //we use the tranfer event to check for pending transactions on the bridge
  if(bCALL_PROCESS_NEW_TRANACTION_ON_EVENT){
    pullNewTransaction();
  }
};

export const processApproval = async (trans: contractEvent): Promise<void> => {
  //format to 2 places of decimal
  console.log(
    `processApproval: from ${trans.from_owner} -> ${
      trans.to_spender
    } amt:${utils.formatUnits(trans.value, 2).toString()} :`
  );

  //we use the approval event to check for pending transactions on the bridge
  if(bCALL_PROCESS_NEW_TRANACTION_ON_EVENT){
    pullNewTransaction();
  }
};

let errCnt: number = 0;

 const _pullNewTransaction = async (): Promise<boolean | null> => {
  let path = "/app/pendingtransactions";

  //test_ccf(); return null;

  await ccf_get_call(path, "")
    //then() function is used to convert the posted contents to the website into json format
    .then(async (result) => {
      errCnt = 0;
      try {
        
        let trans = JSON.parse(result);
        if (trans.pendingTransactions.length) {
          console.log(`New transaction`, prettyPrint(trans));
          for (var i = 0; i < trans.pendingTransactions.length; i++) {
            let tran = trans.pendingTransactions[i];
            //console.log(`Trans: ${i} => `, prettyPrint(tran));

            if ((tran.transactionType as string) === TransactionType.AWAIT_ALLOWANCE) {
              processPendingTransctionWaitingForAllowance(tran as IAwaitAllowancePayload);
            } else if ((tran.transactionType as string) === TransactionType.CREATE_HTLC_FOR) {
              processPendingTransctionCreateHtlcFor(tran as ICreateHtlcForPayload);
            }
            else if ((tran.transactionType as string) === TransactionType.CLOSE_LOAN) {
              processCloseLoan(tran as ICloseLoanPayload);
            }
            else if ((tran.transactionType as string) === TransactionType.REFUND_HTLC) {
              processRefundLoan(tran as IRefundHtlcPayload);
            }
            else if ((tran.transactionType as string) === TransactionType.WITHDRAW_HTLC) {
              processWithDraw(tran as IWithdrawHtlcPayload);
            }
            else {
              console.log(
                `Unknown transaction ${tran.transactionType as string}`
              );
            }
          }
        }
      } catch (err) {
          //console.log(`Error parsing new Transaction!!! ${err}`);
          console.log(`Transaction...`);
      }
    })
    //the posted contents to the website in json format is displayed as the output on the screen
    .then(async (jsonformat) => {
     //console.log("pullNewTransaction: jsonformat response",JSON.stringify(jsonformat));
    })
    .catch((err) => {
      if(err.length){
        console.log(`pullNewTransaction  Error: ${JSON.stringify(err)}`);
      }else{
        console.log(`pullNewTransaction`);
      }
      errCnt++;
    });

  return true;
};

//serialize calls
let bProcessing: boolean = false;
export const pullNewTransaction = async (): Promise<boolean | null> => {
  if(bProcessing){
    return null;
  }

  bProcessing = true;
  let b= await _pullNewTransaction();
  bProcessing = false;
  return b;
}
async function processPendingTransctionWaitingForAllowance( trans: IAwaitAllowancePayload) {
  let fname = "processPendingTransctionWaitingForAllowance";
  // check if the allowance is available from the burrower
  const tx = {} as allowAnce;
  tx.owner = trans.ownerAddress;
  tx.spender = trans.spenderAddress; //the bridge will be able to spend the allowance to spender after owner has approved

  let tr = await WorkerService.allowance(tx);

  if (tr === undefined) {
    console.log(`${fname}: failed to call allowance for ${tx}`);
    return;
  }
  if (tr.err.length) {
    console.log(`${fname}: failed to call allowance with error  ${tr.err}`);
    return;
  } else {
    if (+tr.amt < +trans.remaining) {
      console.log(
        `${fname}: insufficient balance in allowance  ${tr.amt} < ${trans.remaining}`
      );
      return;
    }
  }

  console.log(`${fname} sending completion for loan `, prettyPrint(trans));

  //we have enough allowance for the transaction to process .. send response confirming loan
  //let path = enInfo.get(CCF_CONFIRM_LOAN);
  let path = "/app/completetransaction";
  await ccf_post_call(path, trans)
    .then(async (result) => {
      console.log(`${fname} `, prettyPrint(result));
    }) 
    //the posted contents
    .then(async (jsonformat) => {
      console.log(`${fname} jsonformat`, prettyPrint(jsonformat));
    })
    .catch((err) => {
      console.log(`${fname} Error sending respone to banking app ${err}`);
      return false;
    });

  return;
}

async function processTransferForFee( trans: ICreateHtlcForPayload): Promise<boolean> {
  let fname = "processTransferForFee";
  const tx = {} as transferFundsFrom;
  tx.amount = trans.fees;
  tx.from = trans.senderAddress;
  tx.to = trans.receiverAddress;

  let tr = await WorkerService.transferFrom(tx);

  if (tr === undefined) {
    console.log(`${fname}: failed to call allowance for ${tx}`);
    return false;
  }
  if (tr.err.length) {
    console.log(`${fname}: failed to call allowance with error  ${tr.err}`);
    return false;
  }

  if (tr.result == false) {
    console.log(`${fname}: failed to transfer fees  ${tx.amount} < ${trans}`);
    return false;
  }
  return true;
}

async function processHtlcCreateFor(trans: ICreateHtlcForPayload): Promise<string | null> {
  // create the HTLC LOCK for the balance
  let fname = "processHtlcCreateFor";
  let a: BigNumber = utils.parseUnits(trans.amount.toString(), 2);

  let hashlock = trans.hashlock;

  if (!hashlock.startsWith("0x")) {
    hashlock = "0x".concat(trans.hashlock);
    //console.log(`${fname} prepend hashlock with 0x> ${trans.hashlock}`);
  }

  let [htlock, err] = await htlcService.createHTLCFor(
    trans.senderAddress,
    trans.receiverAddress,
    hashlock,
    trans.timelock.toString(),
    a
  );

  if (err.length) {
    console.log(
      `${fname}: Unable to createHTLOCKFor amt:${a} =>`,
      prettyPrint(trans)
    );
    //posrt failure to ccf

    // what to do here  - refund the transfer? Or the burrower bears the penality of
    // of not having enough funds as loss
    return null;
  } else {
    console.log(
      `${fname}: SUCCESS to createHTLOCKFor amt:${a}: ${htlock} =>`,
      prettyPrint(trans)
    );
    return htlock;
  }
}

async function processPendingTransctionCreateHtlcFor(trans: ICreateHtlcForPayload) {

  let fname = "processPendingTransctionCreateHtlcFor";

  //make sure that the allowance for the total is still in place... this is race
  //as between the call to confirm the allowance and call to transfer and lock the collateral
  //the burrower could have decreased the allowance.
  // So we transfer the fees first and then lock the collateral.

  const tx = {} as transferFundsFrom;

  let bCreateHtlockFirst = true;
  let htlcAddress = "none";

  if (bCreateHtlockFirst) {
    let hlock = await processHtlcCreateFor(trans);

    //if fail - we keep the fee??
    htlcAddress = hlock === null ? "none" : (hlock as unknown as string);
    if (hlock) {
      //do the transfer
      let b = await processTransferForFee(trans);
      if (b == false) {
        console.log(
          `${fname} fee transfer failed after HTLC create  failed skipping fee transfer `
        );
        //allow the lock to expire??
      }
    } else {
      console.log(`${fname} htlclock create  failed skipping fee transfer `);
      //we could return and keep trying - or indicate failure and close out loan
    }
  } else {
    let b = await processTransferForFee(trans);
    if (b) {
      let hlock = await processHtlcCreateFor(trans);
      //if fail - do we keep the fee?? Obviously as the bridge cant to a reverse transfer from
      htlcAddress = hlock === null ? "none" : (hlock as unknown as string);
    } else {
      console.log(`${fname} fee transfer failed skipping htlclock create`);
      htlcAddress = "none";
    }
  }

  let resp = <ICreateHtlcForPayload>{
    transactionType: trans.transactionType,
    transactionId: trans.transactionId,
    transactionCreated: trans.transactionCreated,
    originatingLoanId:  trans.originatingLoanId,
    senderAddress: trans.senderAddress,
    receiverAddress: trans.receiverAddress,
    hashlock: trans.hashlock,
    timelock: trans.timelock,
    amount: trans.amount,
    fees: trans.fees,
    htlcAddress:  htlcAddress
  };

  console.log(`${fname} sending completion for loan `, prettyPrint(resp));

  //we have enough allowance for the transaction to process .. send response confirming loan
  let path = "/app/completetransaction";
  //let path = enInfo.get(CCF_CONFIRM_LOAN);

  await ccf_post_call(path, resp)
    .then(async (result) => {
      console.log(`${fname}  resp to response ${result}`, prettyPrint(JSON.parse(result)));
    })
    //the posted contents
    .then(async (jsonformat) => {
      console.log(`${fname} jsonformat`, prettyPrint(jsonformat));
    })
    .catch((err) => {
      console.log(`${fname} Error sending to HTLCFor response banking app ${err} => `);
      return;
    });
}


async function processCloseLoan(resp: ICloseLoanPayload) {
  //send back the data - essentially drive the CCF state machine
  let fname = "processCloseLoan";
  let path = "/app/completetransaction";
  //let path = enInfo.get(CCF_CONFIRM_LOAN);

  await ccf_post_call(path, resp)
    .then(async (result) => {
      console.log(`${fname}  resp`, prettyPrint(JSON.parse(result)));
    })
    //the posted contents
    .then(async (jsonformat) => {
      console.log(`${fname} jsonformat`, prettyPrint(jsonformat));
    })
    .catch((err) => {
      console.log(`${fname} Error sending data ${err}`);
      return;
    });
}




async function processWithDraw(trans: IWithdrawHtlcPayload) {
  
  let fname = "processWithDraw";


  //first pre image the htlc
  let [preimage, err]  = await htlcService.htlcPreimage(trans.htlcAddress);

  if(err.length){
      console.log(`${fname} Error getting HTLC preimage  ${err}`);
      return;
  }
  console.log(`${fname} preimage => ${preimage}`);
  //now with drawn
  let [resu, _err]  = await htlcService.htlcWithdraw(trans.htlcAddress, preimage);
  
  if(_err.length){
    console.log(`${fname} Error withdrawing  ${_err}`);
    return;
  }

  //we have successfully with drawn - send response
  let path = "/app/completetransaction";
  //let path = enInfo.get(CCF_CONFIRM_LOAN);

  await ccf_post_call(path, trans)
    .then(async (result) => {
      console.log(`${fname}  resp`, prettyPrint(JSON.parse(result)));
    })
    //the posted contents
    .then(async (jsonformat) => {
      console.log(`${fname} jsonformat`, prettyPrint(jsonformat));
    })
    .catch((err) => {
      console.log(`${fname} Error sending data ${err}`);
      return;
    });
}


function processRefundLoan(trans: IRefundHtlcPayload) {
  let fname = "processWithDraw";
  console.log(`${fname} Error NOT IMPLEMENTED`, prettyPrint(trans));
  return;
}