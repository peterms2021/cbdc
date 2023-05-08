import { BigNumber, Contract, utils } from "ethers";

export async function Transfer(
  cbdc: Contract,
  receiver: string,
  amnt: BigNumber
): Promise<[result: string, err: string]> {
  let result: string = "";
  let err: string = "";
  let loading = false;

  if (cbdc == undefined) {
    console.log("Cbdc object is not defined");
    return [result, "No CBDC contract"];
  }

  function setLoading(val: boolean) {
    loading = val;
  }

  function setErr(val: string) {
    err = val;
  }
  function setResult(val: string) {
    result = val;
  }

  let amt = amnt.toString();
  console.log(`Transfer: receiver:${receiver} => amnt:${amnt} : ${amt}`);

  async function handleSubmit() {
    try {
      setLoading(true);
      //const response = await cbdc.transfer(receiver, utils.parseUnits(amount, 2).toString());
      const response = await cbdc.transfer(receiver, amt);
      await response.wait();
      setResult("Success");
      //etErr(undefined);
      setLoading(false);
    } catch (err) {
      //setResult(undefined);
      setErr((err as Error).message);
      setLoading(false);
    }
  }

  await handleSubmit();
  return [result, err];
}

export default Transfer;
