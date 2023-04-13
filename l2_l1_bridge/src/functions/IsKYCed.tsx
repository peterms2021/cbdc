
import { Contract } from "ethers";

function IsKYCed(cbdc: Contract,  holder: string) : [result:boolean, err:string]  {
  
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
          .isKYCed(holder)
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

export default IsKYCed;
