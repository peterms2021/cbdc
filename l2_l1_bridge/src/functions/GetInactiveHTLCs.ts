import { Contract } from "ethers";

export async function GetInactiveHTLCs(cbdc: Contract) : Promise<[result: Array<string>,  err: string]> {

  let err:string = "";
  let result:Array<string> = [];
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
  function setResult(val: Array<string>){
    result =  val;
  }

  async function handleSubmit() {
          cbdc
          .getInactiveHTLCs()
          .then((htlcs: Array<string>) => {
            setResult(htlcs);
            console.log(`[${htlcs.join(", ")}]`);
            //setErr(undefined);
          })
          .catch((err: Error) => {
            //setResult(undefined);
            setErr(err.message);
          })
  }

  await handleSubmit();
  return [result,err] ; 
};

export default GetInactiveHTLCs;


