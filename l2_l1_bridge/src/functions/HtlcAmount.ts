
import { BigNumber, Contract, utils } from "ethers";


export async function HtlcAmount(cbdc: Contract, htlc:string) : Promise<[result: number, err: string]> {

  let loading = false;
  let err:string = "";
  //let result:BigNumber = BigNumber.from(Number.MAX_SAFE_INTEGER - 1);
  let result:number = 0;

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
  function setResult(val: number){
    result =  val;
  }

  async function handleSubmit() {
        await cbdc
          .htlcAmount(htlc)
          .then((result: BigNumber) => {
            // format to 2 decimal places      
            
            let n = utils.formatUnits(result, 2).toString();
            let f = Number.parseFloat(n);
            console.log( `HtlcAmount=> ${f}`);
            setResult(f);
          })
          .catch((err: Error) => {
            setErr(err.message);
          });  
  }

  await handleSubmit();
  return [result,err] ; 
};

export default HtlcAmount;
