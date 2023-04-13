
import { Contract, utils } from "ethers";
function CreateHTLCFor( cbdc: Contract, sender: string, 
                      receiver:string, timelock: string, amount:string): [result: string, err: string] {
  let loading = false;
<<<<<<< HEAD
  let err:string = undefined;
  let result:string = undefined;
=======
  let err:string = "";
  let result:string = "";
>>>>>>> l2
  let hashlock:string;

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
      try {
        setLoading(true);
        const response = await cbdc.createHTLCFor(
          sender,
          receiver,
          hashlock,
          timelock,
          utils.parseUnits(amount, 2).toString(),
        );
        const receipt = await response.wait();
        const htlcAddress = receipt.events?.find((e: { event: string }) => e.event == "HTLCCreated")?.args?.[0];
        if (!htlcAddress) {
            throw Error("HTLCCreated event not emitted.");
        }
        console.log(`HTLC address: ${htlcAddress}`);
        setResult(htlcAddress);
<<<<<<< HEAD
        setErr(undefined);
        setLoading(false);
      } catch (err) {
        setResult(undefined);
=======
        //setErr(undefined);
        setLoading(false);
      } catch (err) {
        //setResult(undefined);
>>>>>>> l2
        setErr((err as Error).message);
        setLoading(false);
      }
    
  }
  handleSubmit();
  return [result,err] ; 
};

export default CreateHTLCFor;
