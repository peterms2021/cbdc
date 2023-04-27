import express from 'express';
import cors from "cors";
import helmet from "helmet";
import * as dotenv from "dotenv";

import { setupConnection, gConnectionInfo } from './ops/Connect.js';
import { eventListener } from './CbEvent.js';
import { envRunMode, AppRunMode } from './ops/Env.js';
import { cbdcRouter } from './transaction/CbdcRouter.js';
import { htlcRouter } from './transaction/HtlcRouter.js';
import { kycRouter } from './transaction/KycRouter.js';
import { eventListener2 } from './ops/EventListener.js';

const app = express();
 setupConnection();
let n  = envRunMode();
console.log(` Root run mode: ${n}`);

eventListener2();

  let port = 7000;
  if (!process.env.CBDC_PORT) {
    console.log(`CBDC_PORT is not define ... to defaulting to ${port}`);
  }else{
    port = parseInt(process.env.CBDC_PORT as string, 10);
  }

  app.use(helmet());   //see https://www.npmjs.com/package/helmet 
  //app.use(cors());    //see https://auth0.com/blog/cors-tutorial-a-guide-to-cross-origin-resource-sharing/
  app.use(express.json());
  app.use("/", cbdcRouter);
  app.use("/kyc", kycRouter);
  app.use("/htlc", htlcRouter);

  app.listen(port, () => {
    return console.log(`CBDC Bridge Listening at http://localhost:${port}`);
  })

