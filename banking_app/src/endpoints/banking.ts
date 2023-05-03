import * as ccfapp from "@microsoft/ccf-app";
import { ccf } from "@microsoft/ccf-app/global";
import { forEach } from "lodash-es";

//#region KVStore

// cdbcUsers + ccfUsers Table. One for each direction of lookup
// Used to resolve external identity of the cdbcUser via their CBDC address
// to CCF internal user identity which is the CCF certificate thumbprint
// TODO: Consider Reverse lookup, CCFCert -> CBDCAddress via public:ccf:gov.members.info member_data
const cbdcUsersTableName = "lending.cbdcusers"; //Private
const ccfUsersTableName = "lending.ccfusers"; //Private
const cbdcUsersTable = ccfapp.typedKv(
  cbdcUsersTableName,
  ccfapp.string, //Key: CBDC ERC20 address of user. Hex encoded string
  ccfapp.string //Value: User ID. SHA-256 fingerprint of CCF user certificate as hex-encoed string
);
const ccfUsersTable = ccfapp.typedKv(
  ccfUsersTableName,
  ccfapp.string, //Key: User ID. SHA-256 fingerprint of CCF user certificate as hex-encoed string
  ccfapp.string //Value: CBDC ERC20 address of user. Hex encoded string
);

// securityHoldings Table
// TODO: Ensure we are appropriately protecting the identify of holders
// TODO: We should consider whether we can provide a mechanism to guarantee annonimity for the lender & borrower
// this is a very intersting capability to Hedge Funds who need to be very protective of both long and short positions & intentions
const securityHoldingsTableName = "lending.securityholdings";
interface ISecurityHoldingKey {
  userId: string; //userId of holder
  securityId: string; //Security ticker e.g. 'MSFT'
}
const securityHoldingsTable = ccfapp.typedKv(
  securityHoldingsTableName,
  ccfapp.json<ISecurityHoldingKey>(),
  ccfapp.json<IHolding>()
);

// securityLoans Table
const securityLoansTableName = "lending.securityloans";
interface ISecurityLoanItem {
  secret: string;
  lenderAddress: string;
  borrowerAddress: string;
  securityId: string;
  quantity: number; // Quantity of securities
  fees: number;
  initialCollateral: number;
  htlcAddress?: string; //Address of the HTLC. i.e. return val from createHTLCFor
  allowanceCreated?: Date; //Timestamp when we observed allowance amount > (collateral+fees)
  htlcCreated?: Date; //Timestamp when we completed createHTLCFor
  refunded?: Date; //Timestamp when we observed htlcRefunded == true
  withdrawn?: Date; //Timestamp when we observed htlcWithdrawn == true
}
const securityLoansTable = ccfapp.typedKv(
  securityLoansTableName,
  ccfapp.arrayBuffer, //Hashed Secret
  ccfapp.json<ISecurityLoanItem>()
);

//TODO: Pending transactions table
/*
Pending Operations
  Create an htlc
    securityLoans Key
  Refund htlc
    htlcAddress
  Withdraw htlc
    htlcAddress
*/

//#endregion

//#region Loan App Endpoints

export function registerCbdcUser(request: ccfapp.Request): ccfapp.Response {
  const userId = request.params.user_id;
  const cbdcAddress = request.params.cbdc_address;

  if (!validateUserId(userId)) {
    return {
      statusCode: 404,
      body: `User not found for: ${userId}`,
    };
  }

  /*
  //TODO: Validation via ethers/web3 but current compatability issues with CCF
  // Likely need to lift code across
  if (!isAddress(cbdcAddress)) {
    return {
      statusCode: 500,
      body: `Address is not valid: ${cbdcAddress}`,
    };
  }
  */

  //Write to cbdcUsers kvMap
  cbdcUsersTable.set(cbdcAddress, userId);
  ccfUsersTable.set(userId, cbdcAddress);

  console.log(
    `Registered UserId: ${userId} with Address: ${cbdcAddress} into kvMaps ${cbdcUsersTableName} and ${ccfUsersTableName}`
  );

  return {
    statusCode: 204,
  };
}

function getAddressToUserId(address: string): string {
  return cbdcUsersTable.get(address);
}
function getUserIdToAddress(userId: string): string {
  return ccfUsersTable.get(userId);
}

// Same structure is sent as both request and response
interface IRegisterHoldingsRequestResponse {
  userId: string;
  holdings: IHolding[];
}
interface IHolding {
  securityId: string;
  quantity: number;
}

export function registerSecurityHoldings(
  request: ccfapp.Request<IRegisterHoldingsRequestResponse>
): ccfapp.Response<IRegisterHoldingsRequestResponse> {
  let body: IRegisterHoldingsRequestResponse;
  try {
    body = request.body.json();
  } catch {
    return {
      statusCode: 400,
      body: <any>`Cannot parse JSON from ${request.body.text()}`,
    };
  }

  //Validate userId and that these match between caller and data
  const userId = getCallerId(request);
  if (
    !validateUserId(body.userId) ||
    !validateUserId(userId) ||
    body.userId != userId
  ) {
    return {
      statusCode: 404,
      body: <any>`User not found or does not match caller for: ${body.userId}`,
    };
  }

  /*
  securityHoldingsTable.set(
    <ISecurityHoldingKey>{
      userId:
        "8a17d7adcd08a23e584b7c689766ca6ecd4dd0860be4d8b7c9ecda654a860ea1",
      securityId: "GS",
    },
    <IHolding>{ securityId: "GS", quantity: 500 }
  );
  */

  //Write provided holdings
  body.holdings.forEach((holdingItem) => {
    securityHoldingsTable.set(
      <ISecurityHoldingKey>{
        userId: userId,
        securityId: holdingItem.securityId,
      },
      <IHolding>holdingItem
    );
    console.log(
      `Registered security holding for UserId: ${userId} : ${JSON.stringify(
        holdingItem
      )}`
    );
  });

  //Return all holdings for userId.
  // TODO: Reevaluate this for efficiency. Currently a full table scan
  let userHoldings: IHolding[] = [];
  securityHoldingsTable.forEach((value: IHolding, key: ISecurityHoldingKey) => {
    if (key.userId == userId) {
      userHoldings.push(value);
    }
  });

  return {
    statusCode: 204,
    body: <IRegisterHoldingsRequestResponse>{
      userId: userId,
      holdings: userHoldings,
    },
  };
}

//TODO: This is a very insecure method. So we should ideally have a mechanism to prevent it from being accidentally run in a production environment
function dumpKVMap(tableName: string) {
  console.log(`Dumping kvMap: ${tableName}`);
  ccfapp.rawKv[tableName].forEach((value: ArrayBuffer, key: ArrayBuffer) => {
    console.log(`Key: ${ccf.bufToStr(key)} Value: ${ccf.bufToStr(value)}`);
  });
}

//#endregion

//#region Utilities

function validateUserId(userId: string): boolean {
  // Check if user exists
  // https://microsoft.github.io/CCF/main/audit/builtin_maps.html#users-info
  const usersCerts = ccfapp.typedKv(
    "public:ccf.gov.users.certs",
    ccfapp.arrayBuffer,
    ccfapp.arrayBuffer
  );
  return usersCerts.has(ccf.strToBuf(userId));
}

//#endregion

//#region Original Code

const claimTableName = "current_claim";
interface ClaimItem {
  userId: string;
  claim: string;
}
const currentClaimTable = ccfapp.typedKv(
  claimTableName,
  ccfapp.string,
  ccfapp.json<ClaimItem>()
);
const keyForClaimTable = "key";

function getAccountTable(userId: string): ccfapp.TypedKvMap<string, number> {
  return ccfapp.typedKv(
    `user_accounts:${userId}`,
    ccfapp.string,
    ccfapp.uint32
  );
}

function parseRequestQuery(request: ccfapp.Request<any>): any {
  const elements = request.query.split("&");
  const obj = {};
  for (const kv of elements) {
    const [k, v] = kv.split("=");
    obj[k] = v;
  }
  return obj;
}

interface Caller {
  id: string;
}

function getCallerId(request: ccfapp.Request<any>): string {
  // Note that the following way of getting caller ID doesn't work for 'jwt' auth policy and 'no_auth' auth policy.
  const caller = request.caller as unknown as Caller;
  return caller.id;
}

function isPositiveInteger(value: any): boolean {
  return Number.isInteger(value) && value > 0;
}

export function createAccount(request: ccfapp.Request): ccfapp.Response {
  const userId = request.params.user_id;
  if (!validateUserId(userId)) {
    return {
      statusCode: 404,
    };
  }

  const accountToBalance = getAccountTable(userId);

  const accountName = request.params.account_name;

  if (accountToBalance.has(accountName)) {
    // Nothing to do
    return {
      statusCode: 204,
    };
  }

  // Initial balance should be 0.
  accountToBalance.set(accountName, 0);

  console.log(`Create Account Completed for ${userId} ${accountName}`);

  return {
    statusCode: 204,
  };
}

interface DepositRequest {
  value: number;
}

export function deposit(
  request: ccfapp.Request<DepositRequest>
): ccfapp.Response {
  let body;
  try {
    body = request.body.json();
  } catch {
    return {
      statusCode: 400,
    };
  }

  const value = body.value;

  if (!isPositiveInteger(value)) {
    return {
      statusCode: 400,
    };
  }

  const userId = request.params.user_id;
  if (!validateUserId(userId)) {
    return {
      statusCode: 404,
    };
  }

  const accountName = request.params.account_name;

  const accountToBalance = getAccountTable(userId);

  if (!accountToBalance.has(accountName)) {
    return { statusCode: 404 };
  }

  accountToBalance.set(accountName, accountToBalance.get(accountName) + value);

  console.log("Deposit Completed");

  return {
    statusCode: 204,
  };
}

interface BalanceResponse {
  balance: number;
}

export function balance(
  request: ccfapp.Request
): ccfapp.Response<BalanceResponse> {
  const userId = getCallerId(request);

  const accountName = request.params.account_name;
  const accountToBalance = getAccountTable(userId);

  if (!accountToBalance.has(accountName)) {
    return { statusCode: 404 };
  }

  return { body: { balance: accountToBalance.get(accountName) } };
}

interface TransferRequest {
  value: number;
  user_id_to: string;
  account_name_to: string;
}

type TransferResponse = string;

export function transfer(
  request: ccfapp.Request<TransferRequest>
): ccfapp.Response<TransferResponse> {
  let body;
  try {
    body = request.body.json();
  } catch {
    return {
      statusCode: 400,
    };
  }

  const value = body.value;

  if (!isPositiveInteger(value)) {
    return {
      statusCode: 400,
    };
  }

  const userId = getCallerId(request);

  const accountName = request.params.account_name;
  const accountNameTo = body.account_name_to;

  const userIdTo = body.user_id_to;

  if (!validateUserId(userIdTo)) {
    return {
      statusCode: 404,
    };
  }

  const accountToBalance = getAccountTable(userId);
  if (!accountToBalance.has(accountName)) {
    return { statusCode: 404 };
  }

  const accountToBalanceTo = getAccountTable(userIdTo);
  if (!accountToBalanceTo.has(accountNameTo)) {
    return { statusCode: 404 };
  }

  const balance = accountToBalance.get(accountName);

  if (value > balance) {
    return { statusCode: 400, body: "Balance is not enough" };
  }

  accountToBalance.set(accountName, balance - value);
  accountToBalanceTo.set(
    accountNameTo,
    accountToBalanceTo.get(accountNameTo) + value
  );

  const claim = `${userId} sent ${value} to ${userIdTo}`;
  currentClaimTable.set(keyForClaimTable, { userId, claim });
  const claimDigest = ccf.digest("SHA-256", ccf.strToBuf(claim));
  ccf.rpc.setClaimsDigest(claimDigest);

  console.log("Transfer Completed");

  return {
    statusCode: 204,
  };
}

function validateTransactionId(transactionId: any): boolean {
  // Transaction ID is composed of View ID and Sequence Number
  // https://microsoft.github.io/CCF/main/overview/glossary.html#term-Transaction-ID
  if (typeof transactionId !== "string") {
    return false;
  }
  const strNums = transactionId.split(".");
  if (strNums.length !== 2) {
    return false;
  }

  return (
    isPositiveInteger(parseInt(strNums[0])) &&
    isPositiveInteger(parseInt(strNums[1]))
  );
}

interface LeafComponents {
  claims: string;
  commit_evidence: string;
  write_set_digest: string;
}

interface GetTransactionREceiptResponse {
  cert: string;
  leaf_components: LeafComponents;
  node_id: string;
  proof: ccfapp.Proof;
  signature: string;
}

export function getTransactionReceipt(
  request: ccfapp.Request
): ccfapp.Response<GetTransactionREceiptResponse> | ccfapp.Response {
  const parsedQuery = parseRequestQuery(request);
  const transactionId = parsedQuery.transaction_id;

  if (!validateTransactionId(transactionId)) {
    return {
      statusCode: 400,
    };
  }

  const userId = getCallerId(request);
  const txNums = transactionId.split(".");
  const seqno = parseInt(txNums[1]);

  const rangeBegin = seqno;
  const rangeEnd = seqno;

  // Make hundle based on https://github.com/microsoft/CCF/blob/main/samples/apps/logging/js/src/logging.js
  // Compute a deterministic handle for the range request.
  // Note: Instead of ccf.digest, an equivalent of std::hash should be used.
  const makeHandle = (begin: number, end: number, id: string): number => {
    const cacheKey = `${begin}-${end}-${id}`;
    const digest = ccf.digest("SHA-256", ccf.strToBuf(cacheKey));
    const handle = new DataView(digest).getUint32(0);
    return handle;
  };
  const handle = makeHandle(rangeBegin, rangeEnd, transactionId);

  // Fetch the requested range
  const expirySeconds = 1800;
  const states = ccf.historical.getStateRange(
    handle,
    rangeBegin,
    rangeEnd,
    expirySeconds
  );
  if (states === null) {
    return {
      statusCode: 202,
      headers: {
        "retry-after": "1",
      },
      body: `Historical transactions from ${rangeBegin} to ${rangeEnd} are not yet available, fetching now`,
    };
  }

  const firstKv = states[0].kv;
  const claimTable = ccfapp.typedKv(
    firstKv[claimTableName],
    ccfapp.string,
    ccfapp.json<ClaimItem>()
  );

  if (!claimTable.has(keyForClaimTable)) {
    return {
      statusCode: 404,
    };
  }

  const claimItem = claimTable.get(keyForClaimTable);
  if (claimItem.userId !== userId) {
    // Access to the claim is not allowed
    return {
      statusCode: 404,
    };
  }

  const receipt = states[0].receipt;
  const body = {
    cert: receipt.cert,
    leaf_components: {
      claim: claimItem.claim,
      commit_evidence: receipt.leaf_components.commit_evidence,
      write_set_digest: receipt.leaf_components.write_set_digest,
    },
    node_id: receipt.node_id,
    proof: receipt.proof,
    signature: receipt.signature,
  };

  return {
    body,
  };
}

//#endregion
