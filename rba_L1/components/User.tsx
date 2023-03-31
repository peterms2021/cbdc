import Allowance from "./functions/Allowance";
import Approve from "./functions/Approve";
import BalanceOf from "./functions/BalanceOf";
import CreateHTLC from "./functions/CreateHTLC";
import CreateHTLCFor from "./functions/CreateHTLCFor";
import Decimals from "./functions/Decimals";
import DecreaseAllowance from "./functions/DecreaseAllowance";
import GetActiveHTLCs from "./functions/GetActiveHTLCs";
import GetAllHTLCs from "./functions/GetAllHTLCs";
import GetInactiveHTLCs from "./functions/GetInactiveHTLCs";
import HtlcAmount from "./functions/HtlcAmount";
import HtlcBalance from "./functions/HtlcBalance";
import HtlcEnabled from "./functions/HtlcEnabled";
import HtlcHashLock from "./functions/HtlcHashLock";
import HtlcPreimage from "./functions/HtlcPreimage";
import HtlcReceiver from "./functions/HtlcReceiver";
import HtlcRefunded from "./functions/HtlcRefunded";
import HtlcSeized from "./functions/HtlcSeized";
import HtlcSender from "./functions/HtlcSender";
import HtlcTimeLock from "./functions/HtlcTimeLock";
import HtlcWithdrawn from "./functions/HtlcWithdrawn";
import IncreaseAllowance from "./functions/IncreaseAllowance";
import IsKYCed from "./functions/IsKYCed";
import Name from "./functions/Name";
import NumKYCs from "./functions/NumKYCs";
import RefundHTLC from "./functions/RefundHTLC";
import Symbol from "./functions/Symbol";
import TotalSupply from "./functions/TotalSupply";
import Transfer from "./functions/Transfer";
import TransferFrom from "./functions/TransferFrom";
import WithdrawHTLC from "./functions/WithdrawHTLC";
import { Contract } from "ethers";
import { FC } from "react";

const User: FC<{ cbdc?: Contract }> = (props: { cbdc?: Contract }) => {
  return (
    <>
      <Name cbdc={props.cbdc} />
      <Symbol cbdc={props.cbdc} />
      <TotalSupply cbdc={props.cbdc} />
      <Decimals cbdc={props.cbdc} />
      <BalanceOf cbdc={props.cbdc} />
      <Transfer cbdc={props.cbdc} />
      <Allowance cbdc={props.cbdc} />
      <Approve cbdc={props.cbdc} />
      <IncreaseAllowance cbdc={props.cbdc} />
      <DecreaseAllowance cbdc={props.cbdc} />
      <TransferFrom cbdc={props.cbdc} />
      <CreateHTLC cbdc={props.cbdc} />
      <CreateHTLCFor cbdc={props.cbdc} />
      <WithdrawHTLC cbdc={props.cbdc} />
      <HtlcBalance cbdc={props.cbdc} />
      <HtlcSeized cbdc={props.cbdc} />
      <RefundHTLC cbdc={props.cbdc} />
      <HtlcPreimage cbdc={props.cbdc} />
      <HtlcSender cbdc={props.cbdc} />
      <HtlcReceiver cbdc={props.cbdc} />
      <HtlcEnabled cbdc={props.cbdc} />
      <HtlcAmount cbdc={props.cbdc} />
      <HtlcHashLock cbdc={props.cbdc} />
      <HtlcTimeLock cbdc={props.cbdc} />
      <HtlcWithdrawn cbdc={props.cbdc} />
      <HtlcRefunded cbdc={props.cbdc} />
      <GetAllHTLCs cbdc={props.cbdc} />
      <GetActiveHTLCs cbdc={props.cbdc} />
      <GetInactiveHTLCs cbdc={props.cbdc} />
      <IsKYCed cbdc={props.cbdc} />
      <NumKYCs cbdc={props.cbdc} />
    </>
  );
};

export default User;
