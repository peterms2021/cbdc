
import { Contract } from "ethers";

export async function HtlcRefunded( cbdc: Contract,  htlc: string): Promise<[result:boolean, err:string]>  {
  let result:boolean =false;
  let err:string = "";
 
  if(cbdc == undefined){
    console.log("Cbdc object is not defined");
    return[result,"No CBDC contract"];
  } 

  function setErr(val: string){
    err =  val;
  }
  function setResult(val: boolean){
    result =  val;
  }

  async function handleSubmit() {
          cbdc
          .htlcRefunded(htlc)
          .then((result: boolean) => {
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

export default HtlcRefunded;
