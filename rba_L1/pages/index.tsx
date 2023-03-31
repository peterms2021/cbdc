import styles from "../styles/index.module.css";
import Transaction from "./Transaction";
import type { NextPage } from "next";
import Head from "next/head";

const Home: NextPage = () => {
  return (
    <div className={styles.container}>
      <Head>
        <title>CDBC Demo Page</title>
      </Head>

      <Transaction />
    </div>
  );
};

export default Home;
