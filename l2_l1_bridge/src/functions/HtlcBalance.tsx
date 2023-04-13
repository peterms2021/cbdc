
import { BigNumber, Contract, utils } from "ethers";


function HtlcBalance( cbdc: Contract, htlc: string): [result: BigNumber, err: string] {

  let loading = false;
<<<<<<< HEAD
  let err:string = undefined;
  let result:BigNumber = undefined;
=======
  let err:string = "";
  let result:BigNumber = BigNumber.from("0");
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
          });    
  }


  handleSubmit();
  return [result,err] ; 
};

export default HtlcBalance;
