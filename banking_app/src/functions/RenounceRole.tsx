import styles from "../../styles/index.module.css";
import { Contract, utils } from "ethers";
import { FC, FormEvent, useState } from "react";
import { Button, Message, Form, FormProps } from "semantic-ui-react";

const RenounceRole: FC<{ cbdc?: Contract }> = (props: { cbdc?: Contract }) => {
  const [role, setRole] = useState<string>("");
  const [result, setResult] = useState<string>();
  const [err, setErr] = useState<string>();
  const [loading, setLoading] = useState(false);
  function handleChangeRole(e: FormEvent, props: FormProps) {
    setRole(props.value);
  }
  async function handleSubmit() {
    if (props.cbdc) {
      try {
        setLoading(true);
        const response = await props.cbdc.renounceRole(utils.id(role));
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
        <label>renounceRole</label>
        <Form.Input width={16} placeholder="role" onChange={handleChangeRole} />
        <Button loading={loading}>Submit</Button>
      </Form.Group>
      <Message className={styles.message} success content={result} />
      <Message className={styles.message} error content={err} />
    </Form>
  );
};

export default RenounceRole;
