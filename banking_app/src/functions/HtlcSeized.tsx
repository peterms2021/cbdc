
import { Contract } from "ethers";

function HtlcSeized( cbdc: Contract , htlc: string): [result:boolean, err:string]  {
  
  let result:boolean =undefined;
  let err:string = undefined;
 
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
          .htlcSeized(htlc)
          .then((result: boolean) => {
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

export default HtlcSeized;
