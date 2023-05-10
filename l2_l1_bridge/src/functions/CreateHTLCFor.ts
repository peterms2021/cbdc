
import { BigNumber, Contract, utils } from "ethers";
export async function CreateHTLCFor( cbdc: Contract, sender: string, 
                      receiver:string,
                      hashlock:string,
                      timelock: string, amount:BigNumber): Promise<[result: string, err: string]> {
  let loading = false;
  let err:string = "";
  let result:string = "";


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
  console.log(`CreateHTLCFor: sender:${sender}  receiver:${receiver}  timelock:${timelock} amount:${amount.toString()}  `);

  async function handleSubmit() {
      try {
        setLoading(true);
        const response = await cbdc.createHTLCFor(
          sender,
          receiver,
          hashlock,
          timelock,
          //utils.parseUnits(amount, 2).toString(),
          amount.toString(),
        );

        console.log(`CreateHTLCFor called...`);
        
        const receipt = await response.wait();

        const htlcAddress = receipt.events?.find((e: { event: string }) => e.event == "HTLCCreated")?.args?.[0];
        if (!htlcAddress) {
            throw Error("HTLCCreated FAILED event not emitted.");
        }
        console.log(`HTLC CREATE SUCCESS address: ${htlcAddress}`);
        setResult(htlcAddress);
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

export default CreateHTLCFor;
