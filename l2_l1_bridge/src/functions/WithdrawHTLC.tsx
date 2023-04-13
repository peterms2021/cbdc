
import { Contract } from "ethers";

function WithdrawHTLC(cbdc: Contract htlc: string,  preimage: string) : [result:string, err:string]  {

  let result:string =undefined;
  let err:string = undefined;
  let loading = false;
  
  if(cbdc == undefined){
    console.log("Cbdc object is not defined");
    return[result,"No CBDC contract"];
  } 
  
  function setLoading(val: boolean){
    loading = val;
  }
  
  function setErr(val: string){
    err =  val;
  }
  function setResult(val: string){
    result =  val;
  } 
  async function handleSubmit() {
    console.log(preimage);
   
      try {
        setLoading(true);
        const response = await cbdc.withdrawHTLC(htlc, preimage);
        await response.wait();
        setResult("Success");
        setErr(undefined);
        setLoading(false);
      } catch (err) {
        setResult(undefined);
        setErr((err as Error).message);
        setLoading(false);
      }
    
  }

  handleSubmit();
  return [result,err] ; 
 
};

export default WithdrawHTLC;
