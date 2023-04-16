
import { Contract, BigNumber } from "ethers";

function HtlcEnabled(cbdc: Contract, htlc: string): [result:boolean, err:string]  {
 
  let result:boolean = false;
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
  function setResult(val: boolean){
    result =  val;
  }

  async function handleSubmit() {
        cbdc
          .htlcEnabled(htlc)
          .then((result: boolean) => {
            setResult(result);
            //setErr(undefined);
          })
          .catch((err: Error) => {
            //setResult(undefined);
            setErr(err.message);
          });
  }

  handleSubmit();
  return [result,err] ; 
  
};

export default HtlcEnabled;
