import kycerAbi from "../IKYCer-abi.json";
import userAbi from "../IUser-abi.json";
import KYCer from "../components/KYCer";
import SampleCode from "../components/SampleCode";
import User from "../components/User";
import styles from "../styles/index.module.css";
import detectEthereumProvider from "@metamask/detect-provider";
import { MetaMaskInpageProvider } from "@metamask/providers";
import { ethers, providers } from "ethers";
import { FC, useEffect, useState } from "react";
import { Button, Menu, Message, Segment } from "semantic-ui-react";

/**
 * cbdc contract info
 */
const CBDC_ADDRESS = "0xb82C4150d953fcCcE42d7D53246B5553016c5C71";
const USER_ABI = userAbi;
const KYCER_ABI = kycerAbi;
const combinedABI = [...USER_ABI, ...KYCER_ABI];
const INTERFACES = {
  KYCER: "KYC",
  USER: "User\u2215UCP",
  CODE: "Sample Code",
};

const Transaction: FC = () => {
  const [activeInterface, setActiveInterface] = useState<string | undefined>(INTERFACES.USER);
  const [inPageProvider, setInPageProvider] = useState<MetaMaskInpageProvider>();
  const [error, showError] = useState<string | null>(null);
  const [account, setAccount] = useState<string>();

  const connected = inPageProvider?.isConnected() && account !== undefined;
  // wrap in-page provider with ethersjs
  const ethProvider = connected
    ? new ethers.providers.Web3Provider(window.ethereum as providers.ExternalProvider)
    : undefined;
  const cbdcContract = ethProvider
    ? new ethers.Contract(CBDC_ADDRESS, combinedABI, ethProvider).connect(ethProvider.getSigner())
    : undefined;

  function handleAccountsChanged(...args: unknown[]) {
    const accounts = args[0] as string[];
    if (accounts.length === 0) {
      // user disconnect or lock
      setAccount(undefined);
      showError("Please connect to MetaMask.");
    } else {
      setAccount(accounts[0] as string);
      showError(null);
    }
  }

  useEffect(() => {
    // detect the in-page ethereum provider (window.ethereum)
    detectEthereumProvider({ mustBeMetaMask: true }).then(provider => {
      if (provider) {
        const p = provider as MetaMaskInpageProvider;
        setInPageProvider(p);
        // register accounts listener
        p.on("accountsChanged", handleAccountsChanged);
      } else {
        showError("Please install MetaMask.");
      }
    });

    return () => {
      // cleanup accounts listener
      inPageProvider?.removeListener("accountsChanged", handleAccountsChanged);
    };
  }, [inPageProvider]);

  // connect metamask with the webpage
  async function connect() {
    inPageProvider
      ?.request({ method: "eth_requestAccounts" })
      .then(accounts => {
        setAccount((accounts as string[])[0]);
      })
      .catch(err => {
        if (err.code === 4001) {
          // the user rejected the connection request.
          showError("Please connect to MetaMask.");
        }
      });
  }

  return (
    <main className={styles.main}>
      <Menu size="massive" widths={3}>
        <Menu.Item
          name={INTERFACES.KYCER}
          active={activeInterface === INTERFACES.KYCER}
          onClick={(_, { name }) => setActiveInterface(name)}
        />
        <Menu.Item
          name={INTERFACES.USER}
          active={activeInterface === INTERFACES.USER}
          onClick={(_, { name }) => setActiveInterface(name)}
        />
        <Menu.Item
          name={INTERFACES.CODE}
          active={activeInterface === INTERFACES.CODE}
          onClick={(_, { name }) => setActiveInterface(name)}
        />
      </Menu>
      <h1 className={styles.title}>Welcome to CBDC Demo App</h1>
      <p className={styles.description}>Get started by connecting with Metamask</p>

      {error && (
        <Message negative>
          <Message.Header>{error}</Message.Header>
        </Message>
      )}

      <Button primary size="huge" onClick={connect} disabled={connected}>
        {connected ? "Connected" : "Connect"}
      </Button>

      <Segment style={{ width: "80%", margin: "2rem 0 2rem 0" }}>
        {activeInterface === INTERFACES.USER && <User cbdc={cbdcContract} />}
        {activeInterface === INTERFACES.KYCER && <KYCer cbdc={cbdcContract} />}
        {activeInterface === INTERFACES.CODE && <SampleCode cbdc={cbdcContract} />}
      </Segment>
    </main>
  );
};

export default Transaction;
