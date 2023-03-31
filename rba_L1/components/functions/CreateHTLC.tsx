import styles from "../../styles/index.module.css";
import { Contract, utils } from "ethers";
import { FC, FormEvent, useState } from "react";
import { Button, Message, Form, FormProps } from "semantic-ui-react";

const CreateHTLC: FC<{ cbdc?: Contract }> = (props: { cbdc?: Contract }) => {
  const [receiver, setReceiver] = useState<string>();
  const [hashlock, setHashlock] = useState<string>();
  const [timelock, setTimelock] = useState<string>();
  const [amount, setAmount] = useState<string>("");
  const [result, setResult] = useState<string>();
  const [err, setErr] = useState<string>();
  const [loading, setLoading] = useState(false);

  function handleChangeReceiver(e: FormEvent, props: FormProps) {
    setReceiver(props.value);
  }
  function handleChangeHashlock(e: FormEvent, props: FormProps) {
    setHashlock(props.value);
  }
  function handleChangeTimelock(e: FormEvent, props: FormProps) {
    setTimelock(props.value);
  }
  function handleChangeAmount(e: FormEvent, props: FormProps) {
    setAmount(props.value);
  }
  async function handleSubmit() {
    if (props.cbdc) {
      try {
        setLoading(true);
        const response = await props.cbdc.createHTLC(
          receiver,
          hashlock,
          timelock,
          utils.parseUnits(amount, 2).toString(),
        );
        const receipt = await response.wait();
        const htlcAddress = receipt.events?.find((e: { event: string }) => e.event == "HTLCCreated")?.args?.[0];
        if (!htlcAddress) throw Error("HTLCCreated event not emitted.");
        setResult(`HTLC address: ${htlcAddress}`);
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
        <label>createHTLC</label>
        <Form.Input width={4} placeholder="receiver" onChange={handleChangeReceiver} />
        <Form.Input width={4} placeholder="hashlock" onChange={handleChangeHashlock} />
        <Form.Input width={4} placeholder="timelock" onChange={handleChangeTimelock} />
        <Form.Input width={4} placeholder="amount" onChange={handleChangeAmount} />
        <Button loading={loading}>Submit</Button>
      </Form.Group>
      <Message className={styles.message} success content={result} />
      <Message className={styles.message} error content={err} />
    </Form>
  );
};

export default CreateHTLC;
