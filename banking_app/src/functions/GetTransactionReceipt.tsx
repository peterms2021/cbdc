
import { Contract } from "ethers";
const code = `/* javascript + ethersjs */
const txReceipt = await provider.getTransactionReceipt(txHash); // retrieve tx receipt
console.log(JSON.stringify(txReceipt, null, 4)); // print`;

const GetTransactionReceipt(cbdc: Contract, tranaction:string): [result: string, err: string] {
  
  let loading = false;
  let err:string = undefined;
  let result:string = undefined;

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
      cbdc.provider
          .getTransactionReceipt(tranaction)
          .then(receipt => {
            setResult(JSON.stringify(receipt, null, 4));
            setErr(undefined);
          })
          .catch((err: Error) => {
            setResult(undefined);
            setErr(err.message);
          })    
  }

  handleSubmit();
  return [result,err] ; 

};

export default GetTransactionReceipt;
