
import { Contract } from "ethers";

function HtlcSender(cbdc: Contract , htlc: string): [result:string, err:string]  {
  
  let result:string =undefined;
  let err:string = undefined;
 
  if(cbdc == undefined){
    console.log("Cbdc object is not defined");
    return[result,"No CBDC contract"];
  } 

  function setErr(val: string){
    err =  val;
  }
  function setResult(val: string){
    result =  val;
  }

  async function handleSubmit() {
          cbdc
          .htlcSender(htlc)
          .then((result: string) => {
            setResult(result);
            setErr(undefined);
          })
          .catch((err: Error) => {
            setResult(undefined);
            setErr(err.message);
          });
  }

  handleSubmit();
  return [result,err] ; 
};

export default HtlcSender;
