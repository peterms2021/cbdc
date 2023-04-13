
import { Contract } from "ethers";

function IsKYCed(cbdc: Contract,  holder: string) : [result:boolean, err:string]  {
  
<<<<<<< HEAD
  let result:boolean =undefined;
  let err:string = undefined;
=======
  let result:boolean =false;
  let err:string = "";
>>>>>>> l2
 
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
<<<<<<< HEAD
            setErr(undefined);
          })
          .catch((err: Error) => {
            setResult(undefined);
=======
            //setErr(undefined);
          })
          .catch((err: Error) => {
            //setResult(undefined);
>>>>>>> l2
            setErr(err.message);
          });
  }

  handleSubmit();
  return [result,err] ; 
};

export default IsKYCed;
