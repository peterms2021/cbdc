
import { BigNumber, Contract, utils } from "ethers";

export async function  Allowance(cbdc: Contract, owner: string, spender: string ): Promise<[result: BigNumber, err: string]> {
  
  let r:BigNumber = BigNumber.from("0");
  let e:string = "";
  
  if(cbdc == undefined){
    console.log("Cbdc object is not defined");
    return[r,"No CBDC contract"];
  } 
  console.log(`Allowance: owner:${owner} spender: ${spender}`);

  async function allowance(_cbdc: Contract, _owner: string, _spender: string ) {
    let resp: string;
    await _cbdc
      .allowance(_owner, _spender)
      .then((resp: BigNumber) => {
      // format to 2 decimal places
      let a =  parseFloat( utils.formatUnits(resp, 2));
      console.log(`resp => $${resp}: ${a}:= `, utils.formatUnits(resp, 2).toString());       
      r = resp;
    })
    .catch((err: Error) => {
        e = err.message;
    })
  }

  await allowance(cbdc, owner,spender);
  return [r,e];
}

export default Allowance;
