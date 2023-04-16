
import { BigNumber, Contract, utils } from "ethers";

function Transfer( cbdc: Contract, receiver:string,  amnt: BigNumber)  : [result:string, err:string]  {
  
    let result:string ="";
    let err:string = "";
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
      try {
        setLoading(true);
        //const response = await cbdc.transfer(receiver, utils.parseUnits(amount, 2).toString());
        const response = await cbdc.transfer(receiver, amnt.toString());
        await response.wait();
        setResult("Success");
        //etErr(undefined);
        setLoading(false);
      } catch (err) {
        //setResult(undefined);
        setErr((err as Error).message);
        setLoading(false);
      }
  }

  handleSubmit();
  return [result,err] ; 
};

export default Transfer;
