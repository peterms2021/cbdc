import * as ccfapp from "@microsoft/ccf-app";
import * as ccfcrypto from "@microsoft/ccf-app/crypto.js";
import { ccf } from "@microsoft/ccf-app/global";
import { keccak256 } from "js-sha3";

const bridge_address = "0xBF4961b1b32CA8873e0C760906745F2006878EF0"; //TODO: Dummy address for Bridge

export function testFunction(request: ccfapp.Request): ccfapp.Response {
  console.log(`Entered Test Function`);
  console.log(getTimestamp());
  return {
    statusCode: 204,
    body: "Completed",
  };
}

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
// TODO: Ensure we are appropriately protecting the identify of security holders
// TODO: We should consider whether we can provide a mechanism to guarantee annonimity for the lender & borrower
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
  hashlock: string;
  lenderId: string;
  lenderAddress: string;
  borrowerId: string;
  borrowerAddress: string;
  securityId: string;
  quantity: number; // Quantity of securities
  fees: number;
  initialCollateral: number;
  htlcAddress?: string; //Address of the HTLC. i.e. return val from createHTLCFor
  allowanceCreated?: number; //Timestamp when we observed allowance amount > (collateral+fees)
  timelock?: number; //Timelock is not set until we create the htlcFor transaction
  htlcCreated?: number; //Timestamp when we completed createHTLCFor
  htlcRefunded?: number; //Timestamp when we observed htlcRefunded == true
  htlcWithdrawn?: number; //Timestamp when we observed htlcWithdrawn == true
  htlcSeized?: number; //Not implemented fully yet. Does not observe from CBDC as cannot Seize htlc on current API
  closureStatus?: LoanClosureStatus;
}
const securityLoansTable = ccfapp.typedKv(
  securityLoansTableName,
  ccfapp.string, //Hashed Secret. Effecitvely the public securityLoan ID
  ccfapp.json<ISecurityLoanItem>()
);

const pendingTransactionsTableName = "lending.pendingtransactions";
export enum TransactionType {
  AWAIT_ALLOWANCE = "AWAIT_ALLOWANCE",
  CREATE_HTLC_FOR = "CREATE_HTLC_FOR",
  CLOSE_LOAN = "CLOSE_LOAN",
  REFUND_HTLC = "REFUND_HTLC",
  WITHDRAW_HTLC = "WITHDRAW_HTLC",
}
interface IPendingTransactionItem {
  readonly transactionId: string;
  readonly transactionType: TransactionType;
  readonly originatingLoanId: string;
  readonly transactionCreated: number;
  readonly doNotProcessBefore?: number;
  transactionCompleted?: number;
}
interface IAwaitAllowancePayload extends IPendingTransactionItem {
  readonly ownerAddress: string;
  readonly spenderAddress: string;
  readonly remaining: number;
}
interface ICreateHtlcForPayload extends IPendingTransactionItem {
  readonly senderAddress: string;
  readonly receiverAddress: string;
  readonly hashlock: string;
  readonly timelock: number;
  readonly amount: number;
  readonly fees: number;
  htlcAddress?: string;
}
interface ICloseLoanPayload extends IPendingTransactionItem {}
interface IRefundHtlcPayload extends IPendingTransactionItem {
  readonly htlcAddress: string;
}
interface IWithdrawHtlcPayload extends IPendingTransactionItem {
  readonly htlcAddress: string;
  readonly htlcSecret: string;
}
const pendingTransactionsTable = ccfapp.typedKv(
  pendingTransactionsTableName,
  ccfapp.string, //Transaction id. Generated on creation
  ccfapp.json<IPendingTransactionItem>()
);

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

// Same data structure is sent as both request and response
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
      statusCode: 400,
      body: <any>(
        `User not found or does not match caller for: ${body.userId} : ${userId}`
      ),
    };
  }

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

interface ISecurityLoanRequest {
  userId: string;
  securityId: string;
  quantity: number;
}
interface ISecurityLoanResponse {
  securityLoanId: string;
  securityId: string;
  quantity: number; // Quantity of securities
  fees: number;
  initialCollateral: number;
  bridgeAddress: string;
}

export function requestSecurityLoan(
  request: ccfapp.Request<ISecurityLoanRequest>
): ccfapp.Response<ISecurityLoanResponse> {
  //For simplification. Const values.
  const securityPrice = 100; //Initial price of all securities set to fixed value
  const collateralRate = 1.05; //All securities subject to same collateral level
  const feeRate = 0.01; //All securities subject to same fee rate.

  let timestamp = getTimestamp();

  console.log(`Entered Request Security Loan Function`);

  let body: ISecurityLoanRequest;
  try {
    body = request.body.json();
  } catch {
    return {
      statusCode: 400,
      body: <any>`Cannot parse JSON from ${request.body.text()}`,
    };
  }

  console.log(`Parsed body: ${request.body.text()}`);

  //Validate userId and that these match between caller and data
  const userId = getCallerId(request);
  /*console.log(`Got UserId: ${userId} and body ${body.userId}`);
  if (!validateUserId(userId)) {
    console.log(`Failed to validate userId`);
    return {
      statusCode: 400,
      body: <any>`User not found or userIds do not match for: ${userId}`,
    };
  }*/

  dumpKVMap(securityHoldingsTableName);

  //Determine if securities available to loan. For simplicity we require that entire parcel can be obtained
  // from single lender (single holding). Would also need to consider a more 'fair' randomized allocation of holding->loan
  //TODO: Will need a mechanism to 'lock' a holding prior to it being created for a loan
  // Exact semantics TBD around how reservations are to be handled, how unused reservations are to be returned etc.
  let candidateLoans: Array<
    [
      holdingKey: ISecurityHoldingKey,
      holdingValue: IHolding,
      quantityDelta: number
    ]
  > = [];
  let lenderId: string;
  securityHoldingsTable.forEach((value: IHolding, key: ISecurityHoldingKey) => {
    if (
      key.userId != userId && // Can't borrow from self
      value.securityId == body.securityId &&
      value.quantity > body.quantity
    ) {
      let quantityDelta: number = value.quantity - body.quantity;
      candidateLoans.push([key, value, quantityDelta]); //For use later when optimizing more complex loans
    }
  });

  console.log(`Got ${candidateLoans.length} candidate loans`);

  if (candidateLoans.length == 0) {
    return {
      statusCode: 404,
      body: <any>(
        `Insufficient quantity available for requested loan: ${body.quantity} of ${body.securityId}`
      ),
    };
  } else {
    //Take the first candidate holding. Reduce the holding. Update the kvMap
    //let candidateLoan = sample(candidateLoans);
    let candidateLoan = candidateLoans[0];
    lenderId = candidateLoan[0].userId;
    let holdingValue = candidateLoan[1];
    holdingValue.quantity -= body.quantity;
    securityHoldingsTable.set(candidateLoan[0], holdingValue);
  }

  dumpKVMap(securityHoldingsTableName);

  //Generate and hash secret
  const secretKey = arrayBufToHex(ccfcrypto.generateAesKey(256));
  const secretKeyHash = keccak256(secretKey);
  console.log(`Secret Key: ${secretKey} Hashed Secret Key: ${secretKeyHash}`);

  //Calculate fees and collateral
  const initialCollateral = securityPrice * body.quantity * collateralRate;
  const fees = securityPrice * body.quantity * feeRate;

  const awaitAllowanceTxnId = arrayBufToHex(ccfcrypto.generateAesKey(256));

  console.log(`Initial collateral: ${initialCollateral} Fees: ${fees}`);

  securityLoansTable.set(secretKeyHash, <ISecurityLoanItem>{
    secret: secretKey,
    hashlock: secretKeyHash,
    lenderId: lenderId,
    lenderAddress: getUserIdToAddress(lenderId),
    borrowerId: userId,
    borrowerAddress: getUserIdToAddress(userId),
    securityId: body.securityId,
    quantity: body.quantity,
    fees: fees,
    initialCollateral: initialCollateral,
  });

  dumpKVMap(securityHoldingsTableName);

  let transactionId = arrayBufToHex(ccfcrypto.generateAesKey(256));
  pendingTransactionsTable.set(transactionId, <IAwaitAllowancePayload>{
    transactionType: TransactionType.AWAIT_ALLOWANCE,
    transactionId: transactionId,
    transactionCreated: timestamp,
    originatingLoanId: secretKeyHash,
    ownerAddress: getUserIdToAddress(userId),
    spenderAddress: bridge_address,
    remaining: initialCollateral + fees,
  });

  dumpKVMap(pendingTransactionsTableName);

  return {
    statusCode: 204,
    body: <ISecurityLoanResponse>{
      securityLoanId: secretKeyHash,
      securityId: body.securityId,
      quantity: body.quantity,
      fees: fees,
      initialCollateral: initialCollateral,
      bridgeAddress: bridge_address,
    },
  };
}

interface IGetPendingTransactionsResponse {
  pendingTransactions: IPendingTransactionItem[];
}
export function getPendingTransactions(
  request: ccfapp.Request
): ccfapp.Response<IGetPendingTransactionsResponse> {
  // TODO: Re-evaluate this for efficiency. Currently a full table scan. Investigate indexing
  // https://microsoft.github.io/CCF/release/3.x/architecture/indexing.html
  let timestamp = getTimestamp();
  let pendingTransactions: IPendingTransactionItem[] = [];
  pendingTransactionsTable.forEach(
    (value: IPendingTransactionItem, key: string) => {
      if (
        value.transactionCompleted == undefined &&
        (value.doNotProcessBefore == undefined ||
          value.doNotProcessBefore < timestamp)
      ) {
        pendingTransactions.push(value);
      }
    }
  );
  return {
    statusCode: 204,
    body: <IGetPendingTransactionsResponse>{
      pendingTransactions: pendingTransactions,
    },
  };
}

export function updatePendingTransaction(
  request: ccfapp.Request<IPendingTransactionItem>
): ccfapp.Response {
  let body: IPendingTransactionItem;
  try {
    body = request.body.json();
  } catch {
    return {
      statusCode: 400,
      body: <any>`Cannot parse JSON from ${request.body.text()}`,
    };
  }

  console.log(`Parsed body: ${request.body.text()}`);

  switch (body.transactionType) {
    case TransactionType.AWAIT_ALLOWANCE:
      updatePendingAwaitAllowance(<IAwaitAllowancePayload>body);
      break;
    case TransactionType.CREATE_HTLC_FOR:
      updatePendingHtlcFor(<ICreateHtlcForPayload>body);
      break;
    case TransactionType.CLOSE_LOAN:
      closeLoan(<ICloseLoanPayload>body);
      break;
    case TransactionType.REFUND_HTLC:
      break;
    case TransactionType.WITHDRAW_HTLC:
      break;
    default:
      break;
  }
  dumpKVMap(pendingTransactionsTableName);
  return {
    statusCode: 204,
    body: `Transaction completed: ${body.transactionId} Status: `,
  };
}

function completePendingTransaction(
  payload: IPendingTransactionItem,
  timestamp: number
) {
  let initialTransaction = pendingTransactionsTable.get(payload.transactionId);

  //Check that payload matches pending loan type
  if (payload.transactionType != initialTransaction.transactionType)
    throw new Error(
      `Close transaction payload ${payload.transactionType} does not match pending transaction type ${initialTransaction.transactionType}`
    );

  initialTransaction.transactionCompleted = timestamp;
  pendingTransactionsTable.set(payload.transactionId, initialTransaction);
}

function updatePendingAwaitAllowance(payload: IAwaitAllowancePayload) {
  let timestamp = getTimestamp();
  //Complete pending transaction
  completePendingTransaction(payload, timestamp);
  //Update loan
  let initialLoan = securityLoansTable.get(payload.originatingLoanId);
  initialLoan.allowanceCreated = timestamp;
  let timelock = timestamp + 86400; //Index off the transaction timestamp by 24hr by adding seconds
  initialLoan.timelock = timelock;
  securityLoansTable.set(payload.originatingLoanId, initialLoan);

  //Create new htlc transaction
  let htlcTransactionId = arrayBufToHex(ccfcrypto.generateAesKey(256));
  pendingTransactionsTable.set(htlcTransactionId, <ICreateHtlcForPayload>{
    transactionType: TransactionType.CREATE_HTLC_FOR,
    transactionId: htlcTransactionId,
    transactionCreated: timestamp,
    originatingLoanId: payload.originatingLoanId,
    senderAddress: initialLoan.borrowerAddress,
    receiverAddress: initialLoan.lenderAddress,
    hashlock: initialLoan.hashlock,
    timelock: timelock,
    amount: initialLoan.initialCollateral,
    fees: initialLoan.fees,
  });

  //Create future dated (23.5hr) transaction to close loan
  let closeLoanId = arrayBufToHex(ccfcrypto.generateAesKey(256));
  pendingTransactionsTable.set(closeLoanId, <ICloseLoanPayload>{
    transactionType: TransactionType.CLOSE_LOAN,
    transactionId: closeLoanId,
    transactionCreated: timestamp,
    originatingLoanId: payload.originatingLoanId,
    doNotProcessBefore: timestamp + 84600, //23.5*60*60 = 23.5hrs
  });
}

function updatePendingHtlcFor(payload: ICreateHtlcForPayload) {
  let timestamp = getTimestamp();
  //Complete pending transaction
  completePendingTransaction(payload, timestamp);
  //Update loan
  let initialLoan = securityLoansTable.get(payload.originatingLoanId);
  initialLoan.htlcCreated = timestamp;
  initialLoan.htlcAddress = payload.htlcAddress;
  securityLoansTable.set(payload.originatingLoanId, initialLoan);
}

enum LoanClosureStatus {
  REFUNDED = "REFUNDED",
  WITHDRAWN = "WITHDRAWN",
  SEIZED = "SEIZED",
  PENDING = "PENDING",
}
interface ICloseLoanEarlyRequest {
  securityLoanId: string;
}
//We do this async via bridge to mimimize alternative code paths between the scheduled and the early closure.
//We return the pending transaction such that bridge can action immediately if desired
export function closeLoanEarly(request: ccfapp.Request): ccfapp.Response {
  let timestamp = getTimestamp();
  let body: ICloseLoanEarlyRequest;
  try {
    body = request.body.json();
  } catch {
    return {
      statusCode: 400,
      body: <any>`Cannot parse JSON from ${request.body.text()}`,
    };
  }
  //Create transaction to close loan
  let closeLoanId = arrayBufToHex(ccfcrypto.generateAesKey(256));
  pendingTransactionsTable.set(closeLoanId, <ICloseLoanPayload>{
    transactionType: TransactionType.CLOSE_LOAN,
    transactionId: closeLoanId,
    transactionCreated: timestamp,
    originatingLoanId: body.securityLoanId,
  });
  return {
    statusCode: 204,
    body: `Close Loan transaction created for loan ID: ${body.securityLoanId}}`,
  };
}
function closeLoan(payload: ICloseLoanPayload): LoanClosureStatus {
  let originatingLoanId = payload.originatingLoanId;
  let originatingLoan = securityLoansTable.get(originatingLoanId);
  let timestamp = getTimestamp();

  //Complete pending transaction
  completePendingTransaction(payload, timestamp);

  //Checks
  //Has loan already been closed. This will often occur when loan is closed early and then the 23.5hr pendingTransaction is executed.
  if (originatingLoan.closureStatus != null) {
    console.log(
      `Loan already closed. Status: ${originatingLoan.closureStatus}`
    );
    return originatingLoan.closureStatus;
  }

  //At least 1,200 seconds (20 minutes) prior to timelock expiry
  //If we don't process this in time. Seize Htlc pending manual resolution. This is a stub as no seize API on CBDC
  if (originatingLoan.timelock - 1200 < getTimestamp()) {
    console.log(`Loan closure occuring after 23.5hr Htlc will be seized`);
    originatingLoan.htlcSeized = timestamp;
    originatingLoan.closureStatus = LoanClosureStatus.SEIZED;
    securityLoansTable.set(originatingLoanId, originatingLoan);
    return LoanClosureStatus.SEIZED;
  }

  //Request that securities are returned (by the stub)
  let returnSuccess = requestSecurityReturn(
    originatingLoan.lenderId,
    originatingLoan.borrowerId,
    originatingLoan.securityId,
    originatingLoan.quantity
  );

  //Securities returned. Create pending transaction to refund HTLC
  if (returnSuccess) {
    console.log(`Creating refund transaction`);
    //Create refund transaction
    let refundTransactionId = arrayBufToHex(ccfcrypto.generateAesKey(256));
    pendingTransactionsTable.set(refundTransactionId, <IRefundHtlcPayload>{
      transactionType: TransactionType.REFUND_HTLC,
      transactionId: refundTransactionId,
      transactionCreated: timestamp,
      originatingLoanId: originatingLoanId,
      htlcAddress: originatingLoan.htlcAddress,
      doNotProcessBefore: originatingLoan.timelock + 300,
    });
    return LoanClosureStatus.PENDING; //Still pending closure
  } else {
    console.log(`Creating withdrawl transaction`);
    //Create withdrawl transaction
    //Securities not returned. Withdraw Htlc
    let withdrawlTransactionid = arrayBufToHex(ccfcrypto.generateAesKey(256));
    pendingTransactionsTable.set(withdrawlTransactionid, <IWithdrawHtlcPayload>{
      transactionType: TransactionType.WITHDRAW_HTLC,
      transactionId: withdrawlTransactionid,
      transactionCreated: timestamp,
      originatingLoanId: originatingLoanId,
      htlcAddress: originatingLoan.htlcAddress,
      htlcSecret: originatingLoan.secret,
    });
    return LoanClosureStatus.PENDING; //Still pending closure
  }
}

//Stub to emulate request to return securities. e.g. if securities had been tokenized, or if call was made to custodian
//We stub and pass:fail 80:20
function requestSecurityReturn(
  lenderId: string,
  borrowerId: string,
  securityId: string,
  quantity: numbe
): boolean {
  //let success: boolean = randomNumberBetween(1, 10) < 8;
  let success: boolean = false;
  if (success) {
    console.log(`Sucurity return succeeded`);
    //Stub: Transfer securities back
    //Take the first candidate holding. Reduce the holding. Update the kvMap
    //let candidateLoan = sample(candidateLoans);
    let securityHoldingKey = <ISecurityHoldingKey>{
      userId: lenderId,
      securityId: securityId,
    };
    let holding =
      securityHoldingsTable.get(securityHoldingKey) ??
      <IHolding>{ securityId: securityId, quantity: 0 };
    holding.quantity += quantity;
    securityHoldingsTable.set(securityHoldingKey, holding);
    return success;
  } else {
    //Just return
    console.log(`Sucurity return failed`);
    return success;
  }
}

function completeRefunded(payload: IRefundHtlcPayload): LoanClosureStatus {
  let originatingLoanId = payload.originatingLoanId;
  let originatingLoan = securityLoansTable.get(originatingLoanId);
  let timestamp = getTimestamp();

  //Complete pending transaction
  completePendingTransaction(payload, timestamp);
  originatingLoan.htlcRefunded = timestamp;
  originatingLoan.closureStatus = LoanClosureStatus.REFUNDED;

  //Update securityLoan
  securityLoansTable.set(originatingLoanId, originatingLoan);
  return originatingLoan.closureStatus;
}

function completeWithdrawn(payload: IWithdrawHtlcPayload): LoanClosureStatus {
  let originatingLoanId = payload.originatingLoanId;
  let originatingLoan = securityLoansTable.get(originatingLoanId);
  let timestamp = getTimestamp();

  //Complete pending transaction
  completePendingTransaction(payload, timestamp);
  originatingLoan.htlcWithdrawn = timestamp;
  originatingLoan.closureStatus = LoanClosureStatus.WITHDRAWN;

  //Update securityLoan
  securityLoansTable.set(originatingLoanId, originatingLoan);
  return originatingLoan.closureStatus;
}

//#endregion

//#region Utilities

function getAddressToUserId(address: string): string {
  return cbdcUsersTable.get(address);
}
function getUserIdToAddress(userId: string): string {
  return ccfUsersTable.get(userId);
}

function arrayBufToHex(buf: ArrayBuffer): string {
  return Array.prototype.map
    .call(new Uint8Array(buf), (x) => ("00" + x.toString(16)).slice(-2))
    .join("");
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

interface Caller {
  id: string;
}
function getCallerId(request: ccfapp.Request<any>): string {
  // Note that the following way of getting caller ID doesn't work for 'jwt' auth policy and 'no_auth' auth policy.
  const caller = request.caller as unknown as Caller;
  return caller.id;
}

//UNIX Timestamp. Seconds since Epoch
//TODO: Uses untrusted datatime from host. To be discussed.
function getTimestamp() {
  ccf.enableUntrustedDateTime(true);
  let timestamp = Math.floor(Date.now() / 1000);
  ccf.enableUntrustedDateTime(false);
  return timestamp;
}

function getTimestampFor(forDate: Date) {
  return Math.floor(forDate.getTime() / 1000);
}

function randomNumberBetween(min: number, max: number): number {
  return Math.ceil(Math.random() * (max - min) + min);
}

//TODO: This is a very insecure method. So we should ideally have a mechanism to prevent it from being accidentally run in a production environment.
function dumpKVMap(tableName: string) {
  console.log(`Dumping kvMap: ${tableName}`);
  ccfapp.rawKv[tableName].forEach((value: ArrayBuffer, key: ArrayBuffer) => {
    console.log(`Key: ${ccf.bufToStr(key)} Value: ${ccf.bufToStr(value)}`);
  });
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

//#endregion

//#region Original Code

//#endregion
