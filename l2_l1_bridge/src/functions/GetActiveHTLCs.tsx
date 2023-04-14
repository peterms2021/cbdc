
import { Contract } from "ethers";

function GetActiveHTLCs(cbdc: Contract) : [result: Array<string>,  err: string] {

<<<<<<< HEAD
  let err:string = undefined;
  let result:Array<string> = undefined;
=======
  let err:string = "";
  let result:Array<string> = [];
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
  function setResult(val: Array<string>){
    result =  val;
  }

  async function handleSubmit() {
          cbdc
          .getActiveHTLCs()
          .then((htlcs: Array<string>) => {
            setResult(htlcs);
            console.log(`[${htlcs.join(", ")}]`);
<<<<<<< HEAD
            setErr(undefined);
          })
          .catch((err: Error) => {
            setResult(undefined);
=======
            //setErr(undefined);
          })
          .catch((err: Error) => {
            //setResult(undefined);
>>>>>>> l2
            setErr(err.message);
          })
  }

  handleSubmit();
  return [result,err] ; 
};

export default GetActiveHTLCs;