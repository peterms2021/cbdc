import * as ccfapp from "@microsoft/ccf-app";
import { ccf } from "@microsoft/ccf-app/global";

//#region KVStore

// cdbcUsers Table
// Used to resolve external identity of the cdbcUser via their CBDC address
// to CCF internal user identity which is the CCF certificate thumbprint
// TODO: See also: Reverse lookup, CCFCert -> CBDCAddress via public:ccf:gov.members.info member_data
const cbdcUsersTableName = "cbdcUsers"; //Private
const cbdcUsersTable = ccfapp.typedKv(
  cbdcUsersTableName,
  ccfapp.arrayBuffer, //Key: CBDC ERC20 address of user. Hex encoded string
  ccfapp.arrayBuffer //Value: User ID. SHA-256 fingerprint of CCF user certificate as hex-encoed string
);

// securityLenders Table
// TODO: Ensure we are appropriately protecting the identify of holders
// TODO: We should consider whether we can provide a mechanism to guarantee annonimity for the lender & borrower
// this is a very intersting capability to Hedge Funds who need to be very protective of both long and short positions & intentions
const securityLendersTableName = "securityLenders";
interface SecurityLenderKey {
  cbdcAddress: string; //Address of potential lender
  securityId: string; //Security ticker e.g. 'MSFT'
}
const securityLendersTable = ccfapp.typedKv(
  securityLendersTableName,
  ccfapp.json<SecurityLenderKey>(),
  ccfapp.uint32 //Quantity available
);

// securityLoans Table
const securityLoansTableName = "securityLoans";
interface SecurityLoanItem {
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
  ccfapp.json<SecurityLoanItem>()
);

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

  console.log("Create Account Completed");

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
