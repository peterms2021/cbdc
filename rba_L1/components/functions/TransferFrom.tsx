import styles from "../../styles/index.module.css";
import { Contract, utils } from "ethers";
import { FC, FormEvent, useState } from "react";
import { Button, Message, Form, FormProps } from "semantic-ui-react";

const TransferFrom: FC<{ cbdc?: Contract }> = (props: { cbdc?: Contract }) => {
  const [from, setFrom] = useState<string>();
  const [to, setTo] = useState<string>();
  const [amount, setAmount] = useState<string>("");
  const [result, setResult] = useState<string>();
  const [err, setErr] = useState<string>();
  const [loading, setLoading] = useState(false);

  function handleChangeFrom(e: FormEvent, props: FormProps) {
    setFrom(props.value);
  }
  function handleChangeTo(e: FormEvent, props: FormProps) {
    setTo(props.value);
  }
  function handleChangeAmount(e: FormEvent, props: FormProps) {
    setAmount(props.value);
  }
  async function handleSubmit() {
    if (props.cbdc) {
      try {
        setLoading(true);
        const response = await props.cbdc.transferFrom(from, to, utils.parseUnits(amount, 2).toString());
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
        <label>transferFrom</label>
        <Form.Input width={6} placeholder="from" onChange={handleChangeFrom} />
        <Form.Input width={6} placeholder="to" onChange={handleChangeTo} />
        <Form.Input width={4} placeholder="amount" onChange={handleChangeAmount} />
        <Button loading={loading}>Submit</Button>
      </Form.Group>
      <Message className={styles.message} success content={result} />
      <Message className={styles.message} error content={err} />
    </Form>
  );
};

export default TransferFrom;
