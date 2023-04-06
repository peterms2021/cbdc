import styles from "../../styles/index.module.css";
import { BigNumber, Contract, utils } from "ethers";
import { FC, FormEvent, useState } from "react";
import { Button, Message, Form, FormProps } from "semantic-ui-react";

const NumKYCs: FC<{ cbdc?: Contract }> = (props: { cbdc?: Contract }) => {
  const [holder, setHolder] = useState<string>();
  const [result, setResult] = useState<string>();
  const [err, setErr] = useState<string>();
  function handleChangeHolder(e: FormEvent, props: FormProps) {
    setHolder(props.value);
  }
  async function handleSubmit() {
    props.cbdc
      ? props.cbdc
          .numKYCs(holder)
          .then((result: BigNumber) => {
            // format to 2 decimal places
            setResult(utils.formatUnits(result, 0).toString());
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
        <label>numKYCs</label>
        <Form.Input width={16} placeholder="holder" onChange={handleChangeHolder} />
        <Button>Submit</Button>
      </Form.Group>
      <Message className={styles.message} success content={result} />
      <Message className={styles.message} error content={err} />
    </Form>
  );
};

export default NumKYCs;
