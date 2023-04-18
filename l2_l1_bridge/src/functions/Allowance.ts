
import { BigNumber, Contract, utils } from "ethers";

function Allowance(cbdc: Contract, owner: string, spender: string ): [result: BigNumber, err: string] {
  
  let r:BigNumber = BigNumber.from("0");
  let e:string = "";
  
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
      console.log(utils.formatUnits(resp, 0).toString());     
      r = resp;
    })
    .catch((err: Error) => {
        e = err.message;
    })
  }

  allowance(cbdc, owner,spender);
  return [r,e];
}

export default Allowance;
