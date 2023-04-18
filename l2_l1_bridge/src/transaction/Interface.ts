export interface Accnt {
    name: string;
  }
  
  export interface moveMoney {
    src: Accnt;
    dst: Accnt;
    amount:number;
  }

  