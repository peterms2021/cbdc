
import { BigNumber, Contract, utils } from "ethers";


export async function HtlcBalance( cbdc: Contract, htlc: string): Promise<[result: number, err: string]> {

  let loading = false;
  let err:string = "";
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
          .htlcBalance(htlc)
          .then((result: BigNumber) => {
            //  convert to number  format to 2 decimal places
            let n = utils.formatUnits(result, 2).toString();
            let f = Number.parseFloat(n);
            setResult(f);
          })
          .catch((err: Error) => {
            setErr(err.message);
          });    
  }


  await handleSubmit();
  return [result,err] ; 
};

export default HtlcBalance;
