import express from 'express';
import cors from "cors";
import helmet from "helmet";
import * as dotenv from "dotenv";

import { setupConnection, gConnectionInfo } from './ops/Connect.js';
import { envRunMode, AppRunMode } from './ops/Env.js';
import { cbdcRouter } from './transaction/CbdcRouter.js';
import { htlcRouter } from './transaction/HtlcRouter.js';
import { kycRouter } from './transaction/KycRouter.js';
import { eventListener2 as bridgeEventListener } from './ops/EventListener.js';
import { bridgeRouter } from './transaction/BridgeRouter.js';

const app = express();

setupConnection();
let n = envRunMode();
console.log(` Run mode: ${n}`);

let port = 7000;
if (!process.env.CBDC_PORT) {
  console.log(`CBDC_PORT is not define ... to defaulting to ${port}`);
} else {
  port = parseInt(process.env.CBDC_PORT as string, 10);
}

app.use(helmet());   //see https://www.npmjs.com/package/helmet 
//app.use(cors());    //see https://auth0.com/blog/cors-tutorial-a-guide-to-cross-origin-resource-sharing/
app.use(express.json());
app.use("/", cbdcRouter);
app.use("/kyc", kycRouter);
app.use("/htlc", htlcRouter);

if (n != 0){
  console.log(`Running bridge mode`);
  app.use("/bridge", bridgeRouter);
  bridgeEventListener();
}

app.listen(port, () => {
  return console.log(`CBDC Bridge Listening at http://localhost:${port}`);
})



