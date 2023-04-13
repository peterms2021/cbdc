
import { BigNumber, Contract, utils } from "ethers";

function BalanceOf(cbdc: Contract, addres: string ): [result: BigNumber, err: string] {
  
  let loading = false;
  let err:string = undefined;
  let result:BigNumber = undefined;

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

  async function balanceof(_cbdc: Contract, _addres: string) {
          _cbdc
          .balanceOf(_addres)
          .then((result: BigNumber) => {
            // format to 2 decimal places
            console.log(utils.formatUnits(result, 2).toString());
            setResult(result);
            setErr(undefined);
          })
          .catch((err: Error) => {
            setResult(undefined);
            setErr(err.message);
          })
  }

  balanceof(cbdc,addres);
  return [result,err] ; 
};

export default BalanceOf;
