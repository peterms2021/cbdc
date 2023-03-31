import GetEvents from "./functions/GetEvents";
import GetTransactionReceipt from "./functions/GetTransactionReceipt";
import { Contract } from "ethers";
import { FC } from "react";

const SampleCode: FC<{ cbdc?: Contract }> = (props: { cbdc?: Contract }) => {
  return (
    <>
      <GetTransactionReceipt cbdc={props.cbdc} />
      <GetEvents cbdc={props.cbdc} />
    </>
  );
};

export default SampleCode;
