
import { Contract } from "ethers";

function Symbol( cbdc: Contract) : [result:string, err:string]  {
  
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
      .symbol()
      .then((result: string) => {
        setResult(result);
        //setErr(undefined);
      })
      .catch((err: Error) => {
        //setResult(undefined);
        setErr(err.message);
      });
  }

  handleSubmit();
  return [result,err] ; 
};

export default Symbol;