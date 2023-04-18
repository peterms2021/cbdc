import express from 'express';
import  {setupConnection} from './Connect.js';
const app = express();
const port = 21000;

setupConnection();

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`);
})

