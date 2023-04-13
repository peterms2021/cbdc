
import { BigNumber, Contract, utils } from "ethers";


function Decimals(cbdc: Contract): [result: string, err: string] {
  
 
  let err:string = undefined;
  let result:string = undefined;
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
  function setResult(val: string){
    result =  val;
  }

  async function handleSubmit() {
          cbdc
          .decimals()
          .then((result: BigNumber) => {
            // format to 2 decimal places
            setResult(utils.formatUnits(result, 0).toString());
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

export default Decimals;
