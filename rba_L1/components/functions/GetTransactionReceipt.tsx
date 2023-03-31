import styles from "../../styles/index.module.css";
import { Contract } from "ethers";
import { FC, FormEvent, useState } from "react";
import SyntaxHighlighter from "react-syntax-highlighter";
import { Button, Message, Form, FormProps, TextArea, Divider } from "semantic-ui-react";

const code = `/* javascript + ethersjs */
const txReceipt = await provider.getTransactionReceipt(txHash); // retrieve tx receipt
console.log(JSON.stringify(txReceipt, null, 4)); // print`;

const GetTransactionReceipt: FC<{ cbdc?: Contract }> = (props: { cbdc?: Contract }) => {
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
            setResult(JSON.stringify(receipt, null, 4));
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
        <label>getTransactionReceipt</label>
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
      <Divider section />
    </Form>
  );
};

export default GetTransactionReceipt;
