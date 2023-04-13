
import { Contract, utils, BigNumber } from "ethers";

function IncreaseAllowance(cbdc: Contract , spender: string, allowance: BigNumber): [result:string, err:string]  {
 
<<<<<<< HEAD
  let result:string =undefined;
  let err:string = undefined;
=======
  let result:string ="";
  let err:string = "";
>>>>>>> l2
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
<<<<<<< HEAD
        setErr(undefined);
        setLoading(false);
      } catch (err) {
        setResult(undefined);
=======
        //setErr(undefined);
        setLoading(false);
      } catch (err) {
        //setResult(undefined);
>>>>>>> l2
        setErr((err as Error).message);
        setLoading(false);
      };
  }

  handleSubmit();
  return [result,err] ; 
};

export default IncreaseAllowance;
