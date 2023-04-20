import express from 'express';
import { setupConnection } from './Connect.js';
import { eventListener } from './CbEvent.js';
import { envRunMode, AppRunMode } from './Env.js';

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
  console.log("Normal app mode");
  app.get('/', (req, res) => {
    res.send('Hello World!');
  });

  app.listen(port, () => {
    return console.log(`Express is listening at http://localhost:${port}`);
  })
}
