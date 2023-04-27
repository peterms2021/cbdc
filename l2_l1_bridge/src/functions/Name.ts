
import { Contract } from "ethers";

export async function Name(cbdc: Contract ) : Promise<[result:string, err:string]>  {
 
  let result:string ="";
  let err:string = "";
 
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
          .name()
          .then((result: string) => {
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

export default Name;
