
import { BigNumber, Contract, utils } from "ethers";


function HtlcBalance( cbdc: Contract, htlc: string): [result: BigNumber, err: string] {

  let loading = false;
  let err:string = "";
  let result:BigNumber = BigNumber.from("0");

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
  function setResult(val: BigNumber){
    result =  val;
  }

  async function handleSubmit() {
        cbdc
          .htlcBalance(htlc)
          .then((result: BigNumber) => {
            // format to 2 decimal places
            console.log(utils.formatUnits(result, 2).toString());
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

export default HtlcBalance;
