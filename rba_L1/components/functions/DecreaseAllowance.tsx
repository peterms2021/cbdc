import styles from "../../styles/index.module.css";
import { Contract, utils } from "ethers";
import { FC, FormEvent, useState } from "react";
import { Button, Form, FormProps, Message } from "semantic-ui-react";

const DecreaseAllowance: FC<{ cbdc?: Contract }> = (props: { cbdc?: Contract }) => {
  const [spender, setSpender] = useState<string>();
  const [decreaseAllowance, setDecreaseAllowance] = useState<string>("");
  const [result, setResult] = useState<string>();
  const [err, setErr] = useState<string>();
  const [loading, setLoading] = useState(false);

  function handleChangeSpender(e: FormEvent, props: FormProps) {
    setSpender(props.value);
  }
  function handleChangeDecreaseAllowance(e: FormEvent, props: FormProps) {
    setDecreaseAllowance(props.value);
  }
  async function handleSubmit() {
    if (props.cbdc) {
      try {
        setLoading(true);
        const response = await props.cbdc.decreaseAllowance(spender, utils.parseUnits(decreaseAllowance, 2).toString());
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
        <label>decreaseAllowance</label>
        <Form.Input width={8} placeholder="spender" onChange={handleChangeSpender} />
        <Form.Input width={8} placeholder="decrease allowance" onChange={handleChangeDecreaseAllowance} />
        <Button loading={loading}>Submit</Button>
      </Form.Group>
      <Message className={styles.message} success content={result} />
      <Message className={styles.message} error content={err} />
    </Form>
  );
};

export default DecreaseAllowance;
