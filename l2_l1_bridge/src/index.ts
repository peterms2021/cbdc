import express from 'express';
import cors from "cors";
import helmet from "helmet";
import * as dotenv from "dotenv";

import { setupConnection, gConnectionInfo } from './ops/CbdcConnect.js';
import { envRunMode, AppRunMode } from './ops/Env.js';
import { cbdcRouter } from './transaction/CbdcRouter.js';
import { htlcRouter } from './transaction/HtlcRouter.js';
import { kycRouter } from './transaction/KycRouter.js';
import { bridgeEventListener as bridgeEventListener } from './ops/CbdcEventListener.js';
import { bridgeRouter } from './transaction/BridgeRouter.js';

import compression  from "compression";

const app = express();

// compress responses
app.use(compression())

setupConnection();
let runMode = envRunMode();
console.log(` Run mode: ${runMode}`);

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

let mode:string = "CBDC Client";

if (+runMode != +0){
  console.log(`Running bridge mode`);
  app.use("/bridge", bridgeRouter);
  bridgeEventListener();
  mode="CCF<->CBDC Bridge";
}

app.listen(port, () => {
  return console.log(`${mode} Bridge Listening at http://localhost:${port}`);
})



