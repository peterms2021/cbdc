// data returned for new transactions/loan 
export interface loanDetails{
    ops: string;
    to:string;
    from:string;
    secret:string;
    collateral:number;
    duration:number; //how long is the loan - in seconds
    //fees:number;
    id:string;
};


//initial response
export interface loanResponse extends loanDetails{
    htlc:string;
    err:string;
};

//transfer event response sent to CCF
export interface approvalLoanFees{
    fees:number; //will be 0 if error
    id: string;
    err:string; //if there was error
    from:string;
    to:string;
};

//approval event response sent to 
export interface approvalLoanCollateralResp{
    htlc:string;       //this htlc associated with secret 
    collateral:number; //will be 0 if error
    err:string;
    sender:string;
    receiver:string;
};





