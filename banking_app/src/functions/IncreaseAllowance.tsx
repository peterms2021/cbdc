import styles from "../../styles/index.module.css";
import { Contract, utils } from "ethers";
import { FC, FormEvent, useState } from "react";
import { Button, Form, FormProps, Message } from "semantic-ui-react";

const IncreaseAllowance: FC<{ cbdc?: Contract }> = (props: { cbdc?: Contract }) => {
  const [spender, setSpender] = useState<string>();
  const [increaseAllowance, setIncreaseAllowance] = useState<string>("");
  const [result, setResult] = useState<string>();
  const [err, setErr] = useState<string>();
  const [loading, setLoading] = useState(false);

  function handleChangeSpender(e: FormEvent, props: FormProps) {
    setSpender(props.value);
  }
  function handleChangeIncreaseAllowance(e: FormEvent, props: FormProps) {
    setIncreaseAllowance(props.value);
  }
  async function handleSubmit() {
    if (props.cbdc) {
      try {
        setLoading(true);
        const response = await props.cbdc.increaseAllowance(spender, utils.parseUnits(increaseAllowance, 2).toString());
        await response.wait();
        setResult("Success");
        setErr(undefined);
        setLoading(false);
      } catch (err) {
        setResult(undefined);
        setErr((err as Error).message);
        setLoading(false);
      }
    } else setErr("Please connect to MetaMask.");
  }

  return (
    <Form className={styles.form} success error onSubmit={handleSubmit} size="huge">
      <Form.Group inline>
        <label>increaseAllowance</label>
        <Form.Input width={8} placeholder="spender" onChange={handleChangeSpender} />
        <Form.Input width={8} placeholder="increase allowance" onChange={handleChangeIncreaseAllowance} />
        <Button loading={loading}>Submit</Button>
      </Form.Group>
      <Message className={styles.message} success content={result} />
      <Message className={styles.message} error content={err} />
    </Form>
  );
};

export default IncreaseAllowance;
