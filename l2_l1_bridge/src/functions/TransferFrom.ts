
import { BigNumber, Contract, utils } from "ethers";

export async function  TransferFrom(cbdc: Contract, from:string, to:string, amount: BigNumber) : Promise<[result:string, err:string]>  {

let result:string ="";
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
function setResult(val: string){
  result =  val;
} 

console.log(`Transfer: from:${from} => to:${to}  amnt:${amount}`);

async function handleSubmit() {
   
      try {
        setLoading(true);
        //const response = await cbdc.transferFrom(from, to, utils.parseUnits(amount, 2).toString());
        const response = await cbdc.transferFrom(from, to, amount.toString());
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


  await handleSubmit();
  return [result,err] ; 

};

export default TransferFrom;
