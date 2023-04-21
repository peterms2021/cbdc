export interface Accnt {
    name: string;
  };
  
  export interface MoneySupply {
    bal: number;
  };

  export interface transferFundsFrom {
    from: string;
    to: string;
    amount:number;
  };

  export interface transferFundsFromResp  extends transferFundsFrom{
    result:boolean;
  };

  export interface accntBalance {
    acct: string;
    balance:number;
  };

  export interface grantAllowance {
    src: string;
    allowance:number;
  };
  

  export interface htlcLock {
    src: string;
    duration:number;
    amount:number;
  }
  