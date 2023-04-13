
import { Contract, utils } from "ethers";

function DecreaseAllowance(cbdc: Contract, spender: string,  allowance: string) : [result: string, err: string] {

<<<<<<< HEAD
  let err:string = undefined;
  let result:string = undefined;
=======
  let err:string = "";
  let result:string = "";
>>>>>>> l2
  let hashlock:string;
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
        const response = await cbdc.decreaseAllowance(spender, utils.parseUnits(allowance, 2).toString());
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
      }
  }

  handleSubmit();
  return [result,err] ; 
};

export default DecreaseAllowance;
