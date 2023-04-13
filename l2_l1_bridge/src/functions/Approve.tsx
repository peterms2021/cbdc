
import { Contract, utils, BigNumber } from "ethers";

function Approve(cbdc: Contract, spender: string, amount: BigNumber ): [result: string, err: string] {
  
  let loading = false;
<<<<<<< HEAD
  let err:string = undefined;
  let result:string = undefined;
=======
  let err:string = "";
  let result:string = "";
>>>>>>> l2

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

  async function approve(cbdc: Contract, _spender: string, _amount: string  ) {
      try {
        setLoading(true);
        const response = await cbdc.approve(_spender, utils.parseUnits(_amount, 2).toString());
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

  approve(cbdc, spender, amount.toString());
  return [result,err] ; 
};

export default Approve;
