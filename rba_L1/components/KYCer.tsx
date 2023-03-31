import GrantKYC from "./functions/GrantKYC";
import IsKYCed from "./functions/IsKYCed";
import RenounceRole from "./functions/RenounceRole";
import RevokeKYC from "./functions/RevokeKYC";
import { Contract } from "ethers";
import { FC } from "react";

const KYCer: FC<{ cbdc?: Contract }> = (props: { cbdc?: Contract }) => {
  return (
    <>
      <IsKYCed cbdc={props.cbdc} />
      <GrantKYC cbdc={props.cbdc} />
      <RevokeKYC cbdc={props.cbdc} />
      <RenounceRole cbdc={props.cbdc} />
    </>
  );
};

export default KYCer;
