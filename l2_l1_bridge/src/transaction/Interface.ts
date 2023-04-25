export interface Accnt {
    name: string;
  };
  
  export interface MoneySupply {
    bal: number;
  };

  export interface transferFunds {
    to: string;
    amount:number;
  };

  export interface transferFundsResp  extends transferFunds{
    result:boolean;
    err:string;
  };

  export interface transferFundsFrom {
    from: string;
    to: string;
    amount:number;
  };

  export interface transferFundsFromResp  extends transferFundsFrom{
    result:boolean;
    err:string;
  };

  export interface approveFunds {
    spender: string;
    amount:number;
  };

  export interface approveFundsResp  extends approveFunds{
    result:boolean;
    err:string;
  };

  export interface accntBalance {
    acct: string;
    balance:number;
  };

  export interface grantAllowance {
    src: string;
    allowance:number;
  };
  
//htlc 
  export interface htlcLock {
    receiver: string;
    duration:number;
    amount:number;
  };

  export interface htlcLockFor extends  htlcLock{
    sender: string;
  };

  export interface htlcLockResp {
    result:string;
    err: string;
  };

  export interface htlcWithdraw {
    htlc:string;
    preimage: string;
  };

  export interface htlcWithdrawResp {
    result:string;
    err: string;
  };


  //Test functions for doing HTLC operations
  export interface htlcSecret {
    secret:string;
  };

  export interface htlcSecretResp {
    result:string;
    err: string;
  };

  export interface htlcDuration {
    dur_ms:number;
  };

  export interface htlcDurationResp {
    result:number;
    err: string;
  };
  
  