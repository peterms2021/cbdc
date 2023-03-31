import kycerAbi from "../../IKYCer-abi.json";
import userAbi from "../../IUser-abi.json";
import styles from "../../styles/index.module.css";
import { Contract, utils } from "ethers";
import { FC, FormEvent, useState } from "react";
import SyntaxHighlighter from "react-syntax-highlighter";
import { Button, Message, Form, FormProps, TextArea } from "semantic-ui-react";

const code = `/* javascript + ethersjs */
import { utils } from "ethers";
const txReceipt = await provider.getTransactionReceipt(txHash); // retrieve tx receipt

const iface = new utils.Interface(abi); // create interface from abi
const events = receipt.logs.map((log) => iface.parseLog({topics: log.topics, data: log.data})) // parse logs in tx receipt

console.log(JSON.stringify(events, null, 4)); // print`;

const abi = [...userAbi, ...kycerAbi];
const iface = new utils.Interface(abi);

const GetEvents: FC<{ cbdc?: Contract }> = (props: { cbdc?: Contract }) => {
  const [value, setValue] = useState<string>("");
  const [result, setResult] = useState<string>();
  const [err, setErr] = useState<string>();
  function handleChange(e: FormEvent, props: FormProps) {
    setValue(props.value);
  }
  async function handleSubmit() {
    props.cbdc
      ? props.cbdc.provider
          .getTransactionReceipt(value)
          .then(receipt => {
            const events = receipt.logs.map(log => iface.parseLog({ topics: log.topics, data: log.data }));
            setResult(JSON.stringify(events, null, 4));
            setErr(undefined);
          })
          .catch((err: Error) => {
            setResult(undefined);
            setErr(err.message);
          })
      : setErr("Please connect to MetaMask.");
  }

  return (
    <Form className={styles.form} success error onSubmit={handleSubmit} size="huge">
      <Form.Group inline>
        <label>getEvents</label>
        <Form.Input width={16} placeholder="transaction hash" onChange={handleChange} />
        <Button>Submit</Button>
      </Form.Group>
      <Message
        className={styles.message}
        success
        content={result ? <TextArea style={{ minHeight: 400 }} value={result} /> : null}
      />
      <Message className={styles.message} error content={err} />
      <SyntaxHighlighter language="javascript" showLineNumbers>
        {code}
      </SyntaxHighlighter>
    </Form>
  );
};

export default GetEvents;
