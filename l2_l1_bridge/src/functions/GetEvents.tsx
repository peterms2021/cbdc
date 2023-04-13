import kycerAbi from "../../../rba_L1/IKYCer-abi.json";
import userAbi from  "../../../rba_L1/IUser-abi.json";

import { Contract, utils } from "ethers";

const code = `/* javascript + ethersjs */
import { utils } from "ethers";
const txReceipt = await provider.getTransactionReceipt(txHash); // retrieve tx receipt

const iface = new utils.Interface(abi); // create interface from abi
const events = receipt.logs.map((log) => iface.parseLog({topics: log.topics, data: log.data})) // parse logs in tx receipt

console.log(JSON.stringify(events, null, 4)); // print`;


function GetEvents(cbdc: Contract, transaction: string) : [result: string, err: string] {

  const abi = [...userAbi, ...kycerAbi];
  const iface = new utils.Interface(abi);

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

  async function handleSubmit() {
        cbdc.provider
          .getTransactionReceipt(transaction)
          .then(receipt => {
            const events = receipt.logs.map(log => iface.parseLog({ topics: log.topics, data: log.data }));
            setResult(JSON.stringify(events, null, 4));
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

export default GetEvents;
