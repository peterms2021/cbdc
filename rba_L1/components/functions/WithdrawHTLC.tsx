import styles from "../../styles/index.module.css";
import { Contract } from "ethers";
import { FC, FormEvent, useState } from "react";
import { Button, Message, Form, FormProps } from "semantic-ui-react";

const WithdrawHTLC: FC<{ cbdc?: Contract }> = (props: { cbdc?: Contract }) => {
  const [htlc, setHtlc] = useState<string>();
  const [preimage, setPreimage] = useState<string>();
  const [result, setResult] = useState<string>();
  const [err, setErr] = useState<string>();
  const [loading, setLoading] = useState(false);

  function handleChangeHtlc(e: FormEvent, props: FormProps) {
    setHtlc(props.value);
  }
  function handleChangePreimage(e: FormEvent, props: FormProps) {
    setPreimage(props.value);
  }
  async function handleSubmit() {
    console.log(preimage);
    if (props.cbdc) {
      try {
        setLoading(true);
        const response = await props.cbdc.withdrawHTLC(htlc, preimage);
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
        <label>withdrawHTLC</label>
        <Form.Input width={8} placeholder="htlc" onChange={handleChangeHtlc} />
        <Form.Input width={8} placeholder="preimage" onChange={handleChangePreimage} />
        <Button loading={loading}>Submit</Button>
      </Form.Group>
      <Message className={styles.message} success content={result} />
      <Message className={styles.message} error content={err} />
    </Form>
  );
};

export default WithdrawHTLC;
