
import { BigNumber, Contract, utils } from "ethers";

export async function BalanceOf(cbdc: Contract, addres: string ): Promise<[result: BigNumber, err: string]> {
  
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

  async function balanceof(_cbdc: Contract, _addres: string) {
          await _cbdc
          .balanceOf(_addres)
          .then((_result: BigNumber) => {
            // format to 2 decimal places
            let n = utils.formatUnits(_result, 2);
            console.log(`balanceof:... ${_addres} => ${n}`);
            setResult(_result);
            //setErr(undefined);
          })
          .catch((err: Error) => {
            //setResult(undefined);
            setErr(err.message);
          })
  }

  await balanceof(cbdc,addres);
  return [result,err] ; 
};

export default BalanceOf;
