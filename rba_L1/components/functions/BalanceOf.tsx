import styles from "../../styles/index.module.css";
import { BigNumber, Contract, utils } from "ethers";
import { FC, FormEvent, useState } from "react";
import { Button, Message, Form, FormProps } from "semantic-ui-react";

const BalanceOf: FC<{ cbdc?: Contract }> = (props: { cbdc?: Contract }) => {
  const [value, setValue] = useState<string>();
  const [result, setResult] = useState<string>();
  const [err, setErr] = useState<string>();
  function handleChange(e: FormEvent, props: FormProps) {
    setValue(props.value);
  }
  async function handleSubmit() {
    props.cbdc
      ? props.cbdc
          .balanceOf(value)
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
        <label>balanceOf</label>
        <Form.Input width={16} placeholder="address" onChange={handleChange} />
        <Button>Submit</Button>
      </Form.Group>
      <Message className={styles.message} success content={result} />
      <Message className={styles.message} error content={err} />
    </Form>
  );
};

export default BalanceOf;
