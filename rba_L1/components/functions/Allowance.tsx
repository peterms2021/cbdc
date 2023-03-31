import styles from "../../styles/index.module.css";
import { BigNumber, Contract, utils } from "ethers";
import { FC, FormEvent, useState } from "react";
import { Button, Message, Form, FormProps } from "semantic-ui-react";

const Allowance: FC<{ cbdc?: Contract }> = (props: { cbdc?: Contract }) => {
  const [owner, setOwner] = useState<string>();
  const [spender, setSpender] = useState<string>();
  const [result, setResult] = useState<string>();
  const [err, setErr] = useState<string>();
  function handleChangeOwner(e: FormEvent, props: FormProps) {
    setOwner(props.value);
  }
  function handleChangeSpender(e: FormEvent, props: FormProps) {
    setSpender(props.value);
  }
  async function handleSubmit() {
    props.cbdc
      ? props.cbdc
          .allowance(owner, spender)
          .then((result: BigNumber) => {
            // format to 2 decimal places
            setResult(utils.formatUnits(result, 2).toString());
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
        <label>allowance</label>
        <Form.Input width={8} placeholder="owner" onChange={handleChangeOwner} />
        <Form.Input width={8} placeholder="spender" onChange={handleChangeSpender} />

        <Button>Submit</Button>
      </Form.Group>
      <Message className={styles.message} success content={result} />
      <Message className={styles.message} error content={err} />
    </Form>
  );
};

export default Allowance;
