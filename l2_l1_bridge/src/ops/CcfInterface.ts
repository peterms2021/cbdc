export var AWAIT_ALLOWANCE: string = "AWAIT_ALLOWANCE";
export var CREATE_HTLC_FOR: string = "CREATE_HTLC_FOR";
export var CLOSE_LOAN: string ="CLOSE_LOAN";
export var REFUND_HTLC: string ="REFUND_HTLC";
export var WITHDRAW_HTLC: string="WITHDRAW_HTLC";


export interface pendingTransactionBase {
  transactionType: string; //pendTransTypeAllowance
  transactionId: string;
  transactionCreated: number;
  originatingLoanId: string;
}
//the request and response. Response confirms allowance has been recieved
export interface pendingTransactionsTypeWaitForAllowance
  extends pendingTransactionBase {
  ownerAddress: string;
  spenderAddress: string;
  remaining: number;
}

export interface pendingTransactionsTypeCreateHtlcFor
  extends pendingTransactionBase {
  senderAddress: string;
  receiverAddress: string;
  hashlock: string;
  timelock: number;
  amount: number;
  fees: number;
}

export interface pendingTransactionsTypeCreateHtlcForResp
  extends pendingTransactionsTypeCreateHtlcFor {
  htlcAddress: string; //"empty string indicates failure"
}

/*
// data returned for new transactions/loan
export interface loanDetails {
  ops: string;
  to: string;
  from: string;
  secret: string;
  collateral: number;
  duration: number; //how long is the loan - in seconds
  //fees:number;
  id: string;
}

//initial response
export interface loanResponse extends loanDetails {
  htlc: string;
  err: string;
}

//transfer event response sent to CCF
export interface approvalLoanFees {
  fees: number; //will be 0 if error
  id: string;
  err: string; //if there was error
  from: string;
  to: string;
}

//approval event response sent to
export interface approvalLoanCollateralResp {
  htlc: string; //this htlc associated with secret
  collateral: number; //will be 0 if error
  err: string;
  sender: string;
  receiver: string;
}
*/
