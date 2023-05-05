
import { BigNumber, Contract } from "ethers";


export async function HtlcTimeLock(cbdc: Contract , htlc: string): Promise<[result:BigNumber, err:string]>  {
  
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
          cbdc
          .htlcTimeLock(htlc)
          .then((result: BigNumber) => {
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

export default HtlcTimeLock;
