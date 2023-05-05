import { BigNumber, ethers } from "ethers";

export interface contractEvent{
    from_owner:string;
    to_spender:string;
    value:BigNumber;
};


