import styles from "../../styles/index.module.css";
import { Contract } from "ethers";
import { FC, useState } from "react";
import { Button, Message, Form } from "semantic-ui-react";

const GetAllHTLCs: FC<{ cbdc?: Contract }> = (props: { cbdc?: Contract }) => {
  const [result, setResult] = useState<string>();
  const [err, setErr] = useState<string>();

  async function handleSubmit() {
    props.cbdc
      ? props.cbdc
          .getAllHTLCs()
          .then((htlcs: Array<string>) => {
            setResult(`[${htlcs.join(", ")}]`);
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
        <label>getAllHTLCs</label>
        <Form.Input width={16} placeholder="()" disabled />
        <Button>Submit</Button>
      </Form.Group>
      <Message className={styles.message} success content={result} />
      <Message className={styles.message} error content={err} />
    </Form>
  );
};

export default GetAllHTLCs;
