import express from 'express';
import cors from "cors";
import helmet from "helmet";
import * as dotenv from "dotenv";

import { setupConnection, gConnectionInfo } from './Connect.js';
import { eventListener } from './CbEvent.js';
import { envRunMode, AppRunMode } from './Env.js';
import { cbdcRouter } from './transaction/Router.js';


const app = express();
const port = 21000;

 setupConnection();
let n  = envRunMode();
console.log(` Root run mode: ${n}`);

if (n != AppRunMode.NORMAL_MODE as number) {
  console.log("Event listener app mode");
  eventListener();
}
else {
  if (!process.env.CBDC_PORT) {
    process.exit(1);
  }
 
 const PORT: number = parseInt(process.env.CBDC_PORT as string, 10);

  app.use(helmet());   //see https://www.npmjs.com/package/helmet 
  app.use(cors());    //see https://auth0.com/blog/cors-tutorial-a-guide-to-cross-origin-resource-sharing/
  app.use(express.json());

  app.use("/", cbdcRouter);

  /*
  console.log("Normal app mode");
  app.get('/', (req, res) => {
    res.send('Hello World!');
  });
  */

  app.listen(PORT, () => {
    return console.log(`CBDC Bridge Listening at http://localhost:${port}`);
  })
}
