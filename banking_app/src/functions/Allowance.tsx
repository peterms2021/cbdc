
import { BigNumber, Contract, utils } from "ethers";

function Allowance(cbdc: Contract, owner: string, spender: string ): [result: string, err: string] {
  
  let r:string = undefined;
  let e:string = undefined;
  
  if(cbdc == undefined){
    console.log("Cbdc object is not defined");
    return[r,"No CBDC contract"];
  } 

  async function allowance(_cbdc: Contract, _owner: string, _spender: string ) {
    let resp: string;
    _cbdc
      .allowance(_owner, _spender)
      .then((resp: BigNumber) => {
      // format to 2 decimal places
      r = utils.formatUnits(resp, 0).toString();
    })
    .catch((err: Error) => {
        e = err.message;
    })
  }

  allowance(cbdc, owner,spender);
  return [r,e];
}

export default Allowance;
