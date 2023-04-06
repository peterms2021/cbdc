import styles from "../../styles/index.module.css";
import { Contract } from "ethers";
import { FC, FormEvent, useState } from "react";
import { Button, Message, Form, FormProps } from "semantic-ui-react";

const RefundHTLC: FC<{ cbdc?: Contract }> = (props: { cbdc?: Contract }) => {
  const [htlc, setHtlc] = useState<string>();
  const [result, setResult] = useState<string>();
  const [err, setErr] = useState<string>();
  const [loading, setLoading] = useState(false);
  function handleChangeHtlc(e: FormEvent, props: FormProps) {
    setHtlc(props.value);
  }
  async function handleSubmit() {
    if (props.cbdc) {
      try {
        setLoading(true);
        const response = await props.cbdc.refundHTLC(htlc);
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
        <label>refundHTLC</label>
        <Form.Input width={16} placeholder="htlc" onChange={handleChangeHtlc} />
        <Button loading={loading}>Submit</Button>
      </Form.Group>
      <Message className={styles.message} success content={result} />
      <Message className={styles.message} error content={err} />
    </Form>
  );
};

export default RefundHTLC;
