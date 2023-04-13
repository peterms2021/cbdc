
import { BigNumber, Contract, utils } from "ethers";
// Return the amount that account holder is KYC'd 
function NumKYCs(cbdc: Contract,   holder: string) : [result:BigNumber, err:string]  {
 
  let result:BigNumber =undefined;
  let err:string = undefined;
 
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
          .numKYCs(holder)
          .then((result: BigNumber) => {
            // format to 2 decimal places
            //setResult(utils.formatUnits(result, 0).toString());
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

export default NumKYCs;
