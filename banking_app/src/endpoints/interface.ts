export enum TransactionType {
  AWAIT_ALLOWANCE = "AWAIT_ALLOWANCE",
  CREATE_HTLC_FOR = "CREATE_HTLC_FOR",
  CLOSE_LOAN = "CLOSE_LOAN",
  REFUND_HTLC = "REFUND_HTLC",
  WITHDRAW_HTLC = "WITHDRAW_HTLC",
}
export interface IPendingTransactionItem {
  readonly transactionId: string;
  readonly transactionType: TransactionType;
  readonly originatingLoanId: string;
  readonly transactionCreated: number;
  readonly doNotProcessBefore?: number;
  transactionCompleted?: number;
}
export interface IAwaitAllowancePayload extends IPendingTransactionItem {
  readonly ownerAddress: string;
  readonly spenderAddress: string;
  readonly remaining: number;
}
export interface ICreateHtlcForPayload extends IPendingTransactionItem {
  readonly senderAddress: string;
  readonly receiverAddress: string;
  readonly hashlock: string;
  readonly timelock: number;
  readonly amount: number;
  readonly fees: number;
  htlcAddress?: string;
}
export interface ICloseLoanPayload extends IPendingTransactionItem {}
export interface IRefundHtlcPayload extends IPendingTransactionItem {
  readonly htlcAddress: string;
}
export interface IWithdrawHtlcPayload extends IPendingTransactionItem {
  readonly htlcAddress: string;
  readonly htlcSecret: string;
}
