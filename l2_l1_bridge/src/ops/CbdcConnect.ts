

import Web3 from 'web3';
import { Contract, ethers, providers, Wallet } from "ethers";

import { extractL1AccountDetails, extractNumberEnvVar, L1_CHAIN_ID, L1_URL, L1_USER_CONNECT_URL, L1_USER_NAME, L1_USER_PWD } from "./Env.js";
import { L1_WALLET_PKEY } from "./Env.js";

import kycerAbi from "../IKYCer-abi.json" assert { type: "json" };
import userAbi from "../IUser-abi.json" assert { type: "json" };
import { SigningKey } from "ethers/lib/utils";
import { Network, Networkish } from "@ethersproject/networks";
import { ConnectionInfo, fetchJson, poll } from "@ethersproject/web";
import { BalanceOf } from "../functions/BalanceOf.js";


export interface contractInterface { 
  ready:boolean,
  cbdc: Contract,
  wallet:Wallet,  //using bank name/alias
  prov: ethers.providers.JsonRpcProvider,
  web3:Web3,
  envInfo:Map<string,string>
};
//the global scope connection infor
export var gConnectionInfo:contractInterface;

export let enInfo = extractL1AccountDetails();

async function testWallet(cbdc: ethers.Contract, wallet: ethers.Wallet, provider: ethers.providers.JsonRpcProvider) {
  const [account] = await provider.listAccounts();
  console.log(`Signer account: ${account}`);
  let signer = provider.getSigner(account);
  let block: number;
  try {
    // check that it works!
    block = await provider.getBlockNumber();
  } catch (err) {
    let networkError = `We were unable to connect to the Ethereum network`
    throw new Error(networkError)
  }

  let walletAddress = await wallet.getAddress();
  console.log(`wallet address : ${walletAddress}`);
  const balance = await provider.getBalance(walletAddress);
  const balanceInEther = ethers.utils.formatEther(balance);
  console.log(`accounts: ${account}  balance: ${balance} balanceInEther: ${balanceInEther} block: ${block}`);

  let resp = BalanceOf(cbdc, walletAddress);
  console.log(`Contract ballance: ${resp}`);
}

function getWalletForAccnt(name: string, provider: ethers.providers.JsonRpcProvider ): [ethers.Wallet, Contract] | null {
  let pkey = enInfo.get(name);
  console.log(`${name} pkey: ${pkey}`);
  let skey = new ethers.utils.SigningKey(pkey as string);
  let wallet = new ethers.Wallet(skey as SigningKey, provider);

  const CBDC_ADDRESS = "0xb82C4150d953fcCcE42d7D53246B5553016c5C71";
  const USER_ABI = userAbi;
  const KYCER_ABI = kycerAbi;
  const combinedABI = [...USER_ABI, ...KYCER_ABI];
  
  try{
     const cbdcContract = new ethers.Contract(CBDC_ADDRESS, combinedABI, wallet).connect(wallet);
     return [wallet,cbdcContract];
  } catch (error) {
    let err = "Unable to connect with provider";
    console.error(err);
    throw new Error(err)
  }
  return null;
}

var bInitialized:boolean = false;
 export async function setupConnection() :Promise<contractInterface>{

  if(bInitialized){
    return gConnectionInfo;
  }

  const CBDC_ADDRESS = "0xb82C4150d953fcCcE42d7D53246B5553016c5C71";
  const USER_ABI = userAbi;
  const KYCER_ABI = kycerAbi;
  const combinedABI = [...USER_ABI, ...KYCER_ABI];

  let conInfo: ConnectionInfo = {
    url: enInfo.get(L1_URL),
    user: enInfo.get(L1_USER_NAME),
    password: enInfo.get(L1_USER_PWD)
  };
  let net: Network = {
    chainId: extractNumberEnvVar(L1_CHAIN_ID),
    name: "CBDC"
  };

  let provider =  new ethers.providers.JsonRpcProvider(conInfo, net);
  let web3 = new Web3(provider);

  //generate wallets for the L1 account
  //use the KYC_ER account as we are attaching the ABI to it
  let pkey = enInfo.get(L1_WALLET_PKEY);
  let skey = new ethers.utils.SigningKey(pkey as string);
  let wallet = new ethers.Wallet(skey as SigningKey, provider);
  
  try {

    let [wal,contract] =  getWalletForAccnt(L1_WALLET_PKEY,provider);

    const interfaceControls: contractInterface = {
        ready: true,
        cbdc: contract,
        wallet: wal,
        prov: provider,
        web3:web3,
        envInfo:enInfo
    } ;

    await testWallet(contract,wal,provider);

    gConnectionInfo = interfaceControls;
    bInitialized=true;
    return interfaceControls;
  } catch (error) {
    let err = "Unable to connect with provider";
    console.error(err);
    throw new Error(err)
  }
}

