import { BigNumber, utils, Wallet } from "ethers";
import {
  pendingTransactionsTypeCreateHtlcFor,
  pendingTransactionsTypeCreateHtlcForResp,
  pendingTransactionsTypeWaitForAllowance,
  pendTransTypeAllowance,
  pendTransTypeCreateHtlcFor,
} from "./CcfInterface.js";

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

function httpsReq(body: any, _options: any) {
  return new Promise<any | null>((resolve, reject) => {
    const req = https.request(_options, (res) => {
      const chunks = [];
      res.on("data", (data) => chunks.push(data));
      res.on("end", () => {
        let resBody = Buffer.concat(chunks);
        switch (res.headers["content-type"]) {
          case "application/json":
            console.log(`resp data: ${resBody.toString()}`);
            //resBody = JSON.parse(resBody.toString());
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
    let path ="/app/pendingtransactions";
    //let path = "/app/";
    await ccf_get_call(path, "")
      .then((jsonformat) =>
        console.log(prettyPrint(JSON.stringify(jsonformat)))
      )
      .catch((err) => console.log(`Error ${err}`));
  } catch (err) {
    console.log(`test_ccf Error ${err}`);
  }
}

export const processTransfer = async (trans: contractEvent): Promise<void> => {
  //format to 2 places of decimal
  console.log(
    `processTransfer: from ${trans.from_owner} -> ${
      trans.to_spender
    } amt:${utils.formatUnits(trans.value, 2).toString()}`
  );

  //we use the tranfer event to check for pending transactions on the bridge
  pullNewTransaction();
};

export const processApproval = async (trans: contractEvent): Promise<void> => {
  //format to 2 places of decimal
  console.log(
    `processApproval: from ${trans.from_owner} -> ${
      trans.to_spender
    } amt:${utils.formatUnits(trans.value, 2).toString()} :`
  );

  //we use the approval event to check for pending transactions on the bridge
  pullNewTransaction();
};

let errCnt: number = 0;
export const pullNewTransaction = async (): Promise<boolean | null> => {

  let path="/app/pendingtransactions";

  //test_ccf(); return null;

  ccf_get_call(path, "")
    //then() function is used to convert the posted contents to the website into json format
    .then(async (result) => {
      errCnt = 0;

      let trans = JSON.parse(result);
      console.log(`New transaction`, prettyPrint(trans));

      try {
        for (var i = 0; i < trans.pendingTransactions.length; i++) {
          let tran = trans.pendingTransactions[i];
          console.log(`Trans: ${i} => `, prettyPrint(tran));

          if ((tran.transactionType as string) === pendTransTypeAllowance) {
            processPendingTransctionWaitingForAllowance(
              tran as pendingTransactionsTypeWaitForAllowance
            );
          } else if (
            (tran.transactionType as string) === pendTransTypeCreateHtlcFor
          ) {
            processPendingTransctionCreateHtlcFor(
              tran as pendingTransactionsTypeCreateHtlcFor
            );
          } else {
            console.log(`Unknown transaction ${(tran.transactionType as string)}`);
          }
        }
      } catch (err) {
        console.log("Error parsing new Transaction!!!");
      }
    })
    //the posted contents to the website in json format is displayed as the output on the screen
    .then((jsonformat) => {
      console.log(
        "pullNewTransaction: jsonformat response",
        JSON.stringify(jsonformat)
      );
    })
    .catch((err) => {
      //if(errCnt==0)
      console.log(`pullNewTransaction  Error: ${JSON.stringify(err)}`);
      errCnt++;
    });

  return true;
};

async function processPendingTransctionWaitingForAllowance( trans: pendingTransactionsTypeWaitForAllowance) {
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

  //we have enough allowance for the transaction to process .. send response confirming loan
  //let path = enInfo.get(CCF_CONFIRM_LOAN);
  let path = "/app/completetransaction";
  ccf_post_call(path, trans)
    .then((result) => {
      console.log(`${fname} `, prettyPrint(result.json()));
    })
    //the posted contents
    .then((jsonformat) => {
      console.log(`${fname} jsonformat`, prettyPrint(jsonformat));
    })
    .catch((err) => {
      console.log(`${fname} Error sending approval ${err}`);
      return false;
    });

  return;
}

async function processPendingTransctionCreateHtlcFor(
  trans: pendingTransactionsTypeCreateHtlcFor
) {
  const resp = {} as pendingTransactionsTypeCreateHtlcForResp;

  resp.amount = trans.amount;
  resp.fees = trans.fees;
  resp.hashlock = trans.hashlock;
  resp.originatingLoanId = trans.originatingLoanId;
  resp.receiverAddress = trans.receiverAddress;
  resp.senderAddress = trans.senderAddress;
  resp.transactionId = trans.transactionId;
  resp.transactionCreated = trans.transactionCreated;
  resp.timelock = trans.timelock;

  let fname = "processPendingTransctionCreateHtlcFor";

  //make sure that the allowance for the total is still in place... this is race
  //as between the call to confirm the allowance and call to transfer and lock the collateral
  //the burrower could have decreased the allowance.
  // So we transfer the fees first and then lock the collateral.

  const tx = {} as transferFundsFrom;
  tx.amount = trans.fees;
  tx.from = trans.senderAddress;
  tx.to = trans.receiverAddress;

  let tr = await WorkerService.transferFrom(tx);

  if (tr === undefined) {
    console.log(`${fname}: failed to call allowance for ${tx}`);
    return;
  }
  if (tr.err.length) {
    console.log(`${fname}: failed to call allowance with error  ${tr.err}`);
    return;
  }

  if (tr.result == false) {
    console.log(`${fname}: failed to transfer fees  ${tx.amount} < ${trans}`);
  } else {
    // create the HTLC LOCK for the balance

    let a: BigNumber = utils.parseUnits(trans.amount.toString(), 2);
    let [htlock, err] = await htlcService.createHTLCFor(
      trans.senderAddress,
      trans.receiverAddress,
      trans.hashlock,
      trans.timelock.toString(),
      a
    );

    if (err.length) {
      console.log(`${fname}: Unable to createHTLOCK for ${trans}`);
      //posrt failure to ccf

      // what to do here  - refund the transfer? Or the burrower bears the penality of
      // of not having enough funds as loss
    } else {
      resp.htlcAddress = htlock;
    }
  }

  //we have enough allowance for the transaction to process .. send response confirming loan
  let path = "/app/completetransaction";
  //let path = enInfo.get(CCF_CONFIRM_LOAN);

  ccf_post_call(path, resp)
    .then((result) => {
      console.log(`${fname} `, prettyPrint(result.json()));
    })
    //the posted contents
    .then((jsonformat) => {
      console.log(`${fname} jsonformat`, prettyPrint(jsonformat));
    })
    .catch((err) => {
      console.log(`${fname} Error sending approval ${err}`);
      return;
    });
}
