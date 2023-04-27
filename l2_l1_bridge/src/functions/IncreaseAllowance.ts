
import { Contract, utils, BigNumber } from "ethers";

export async function IncreaseAllowance(cbdc: Contract , spender: string, allowance: BigNumber): Promise<[result:string, err:string]>  {
 
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
        const response = await cbdc.increaseAllowance(spender, allowance.toString());
        await response.wait();
        setResult("Success");
        //setErr(undefined);
        setLoading(false);
      } catch (err) {
        //setResult(undefined);
        setErr((err as Error).message);
        setLoading(false);
      };
  }

  await handleSubmit();
  return [result,err] ; 
};

export default IncreaseAllowance;
