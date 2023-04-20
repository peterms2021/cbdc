export interface Accnt {
    name: string;
  }
  
  export interface transferFunds {
    src: Accnt;
    dst: Accnt;
    amount:number;
  }

  export interface accntBalance {
    src: Accnt;
    amount:number;
  }

  export interface grantAllowance {
    src: Accnt;
    amount:number;
  }
  

  export interface htlcLock {
    src: Accnt;
    duration:number;
    amount:number;
  }
  