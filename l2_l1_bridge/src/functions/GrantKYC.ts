
import { Contract } from "ethers";

function GrantKYC( cbdc: Contract, holder: string) : [result: string, err: string] {

  let loading = false;
  let err:string = "";
  let result:string = "";

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
        const response = await cbdc.grantKYC(holder);
        await response.wait();
        setResult("Success");
        //setErr(undefined);
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

export default GrantKYC;