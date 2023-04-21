
import { BigNumber, Contract, utils } from "ethers";

export async function TotalSupply(cbdc: Contract) : Promise<[result:BigNumber, err:string]>  {
  
  let result:BigNumber =BigNumber.from("0");
  let err:string = "";
 
  if(cbdc == undefined){
    console.log("Cbdc object is not defined");
    return[result,"No CBDC contract"];
  } 

  function setErr(val: string){
    err =  val;
  }
  function setResult(val: BigNumber){
    result =  val;
  }

  async function handleSubmit() {
        await cbdc
          .totalSupply()
          .then((result: BigNumber) => {
            // format to 2 decimal places
            //setResult(utils.formatUnits(result, 2).toString());
            setResult(result);
            //setErr(undefined);
          })
          .catch((err: Error) => {
            //setResult(undefined);
            setErr(err.message);
          });
  }

  await handleSubmit();
  return [result,err] ; 
};

export default TotalSupply;
