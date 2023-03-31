import styles from "../../styles/index.module.css";
import { Contract, utils } from "ethers";
import { FC, FormEvent, useState } from "react";
import { Button, Message, Form, FormProps } from "semantic-ui-react";

const Approve: FC<{ cbdc?: Contract }> = (props: { cbdc?: Contract }) => {
  const [spender, setSpender] = useState<string>();
  const [amount, setAmount] = useState<string>("");
  const [result, setResult] = useState<string>();
  const [err, setErr] = useState<string>();
  const [loading, setLoading] = useState(false);

  function handleChangeSpender(e: FormEvent, props: FormProps) {
    setSpender(props.value);
  }
  function handleChangeAmount(e: FormEvent, props: FormProps) {
    setAmount(props.value);
  }
  async function handleSubmit() {
    if (props.cbdc) {
      try {
        setLoading(true);
        const response = await props.cbdc.approve(spender, utils.parseUnits(amount, 2).toString());
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
        <label>approve</label>
        <Form.Input width={8} placeholder="spender" onChange={handleChangeSpender} />
        <Form.Input width={8} placeholder="amount" onChange={handleChangeAmount} />
        <Button loading={loading}>Submit</Button>
      </Form.Group>
      <Message className={styles.message} success content={result} />
      <Message className={styles.message} error content={err} />
    </Form>
  );
};

export default Approve;
