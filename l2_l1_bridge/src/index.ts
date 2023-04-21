import express from 'express';
import cors from "cors";
import helmet from "helmet";
import * as dotenv from "dotenv";

import { setupConnection, gConnectionInfo } from './Connect.js';
import { eventListener } from './CbEvent.js';
import { envRunMode, AppRunMode } from './Env.js';
import { cbdcRouter } from './transaction/Router.js';


const app = express();
 setupConnection();
let n  = envRunMode();
console.log(` Root run mode: ${n}`);

if (n != AppRunMode.NORMAL_MODE as number) {
  console.log("Event listener app mode");
  eventListener();
}
else 
{
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
  
  app.listen(port, () => {
    return console.log(`CBDC Bridge Listening at http://localhost:${port}`);
  })
}
