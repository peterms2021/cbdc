
import { Contract } from "ethers";

async function GrantKYC( cbdc: Contract, holder: string) : Promise<[result: boolean, err: string]> {

  let loading = false;
  let err:string = "";
  let result:boolean = false;

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
  function setResult(val: boolean){
    result =  val;
  }

  async function handleSubmit() {
      try {
        setLoading(true);
        const response = await cbdc.grantKYC(holder);
        await response.wait();
        setResult(true);
        //setErr(undefined);
        setLoading(false);
      } catch (err) {
        //setResult(undefined);
        setErr((err as Error).message);
        setLoading(false);
      }
  }
  console.log(`GrantKYC : ${holder}`);
  await handleSubmit();
  return [result,err] ; 

};

export default GrantKYC;
