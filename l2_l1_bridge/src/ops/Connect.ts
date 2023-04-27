

import Web3 from 'web3';
import { Contract, ethers, providers, Wallet } from "ethers";

import { extractL1AccountDetails, extractNumberEnvVar, L1_CHAIN_ID, L1_URL, L1_USER_CONNECT_URL, L1_USER_NAME, L1_USER_PWD } from "./Env.js";
import { BANK_A_NAME, BANK_B_NAME, KYCER_NAME, ESCROW_BANK_NAME, BANK_A_PKEY, BANK_B_PKEY, KYC_PKEY, MSFT_PKEY } from "./Env.js";

import kycerAbi from "../IKYCer-abi.json" assert { type: "json" };
import userAbi from "../IUser-abi.json" assert { type: "json" };
import { SigningKey } from "ethers/lib/utils";
import { Network, Networkish } from "@ethersproject/networks";
import { ConnectionInfo, fetchJson, poll } from "@ethersproject/web";
import { BalanceOf } from "../functions/BalanceOf.js";
import { ContractMap, WalletMap } from './EventInterface.js';

export interface contractInterface { 
  ready:boolean,
  cbdcMap: ContractMap,
  walByNameMap:WalletMap,  //using bank name/alias
  wallByAddrMap:WalletMap, //using the account addr
  prov: ethers.providers.JsonRpcProvider,
  web3:Web3,
  envInfo:Map<string,string>
};
//the global scope connection infor
export var gConnectionInfo:contractInterface;

let enInfo = extractL1AccountDetails();

async function testWallet(cbdc: ethers.Contract, wallet: ethers.Wallet, provider: ethers.providers.JsonRpcProvider) {
  const [account] = await provider.listAccounts();
  console.log(`Signer account: ${account}`);
  let signer = provider.getSigner(account);
  let block;
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

async function testWallets(cbdc:ContractMap, wallets:WalletMap, provider: ethers.providers.JsonRpcProvider){
  
  wallets.forEach((value: ethers.Wallet, key: string) => {
    console.log(key, value);
    let contract = cbdc.get(key);
    testWallet(contract,value,provider);
  });
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

export function getAAllccountWallets(provider: ethers.providers.JsonRpcProvider): [WalletMap, WalletMap, ContractMap] {
  let actMap = new Map<string, ethers.Wallet>();
  let actMap2 = new Map<string, ethers.Wallet>();
  let cbdcMap = new Map<string, ethers.Contract>();

  let v:ethers.Wallet;
  let s:string;                                                                                 
  let [m1,m2] = getWalletForAccnt(MSFT_PKEY,provider);
  actMap.set(s=enInfo.get(ESCROW_BANK_NAME), m1);
  actMap2.set(m1.address,m1);
  cbdcMap.set(s,m2);

  [m1,m2] = getWalletForAccnt(KYC_PKEY,provider);
  actMap.set(s=enInfo.get(KYCER_NAME),m1 );
  actMap2.set(m1.address,m1);
  cbdcMap.set(s,m2);

  [m1,m2] = getWalletForAccnt(BANK_A_PKEY,provider);
  actMap.set(s=enInfo.get(BANK_A_NAME),m1 );
  actMap2.set(m1.address,m1);
  cbdcMap.set(s,m2);

  [m1,m2] = getWalletForAccnt(BANK_B_PKEY,provider);
  actMap.set(s=enInfo.get(BANK_B_NAME),m1 );
  actMap2.set(m1.address,m1);
  cbdcMap.set(s,m2);
  return [actMap,actMap2, cbdcMap];
}

 export async function setupConnection() :Promise<contractInterface>{
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

  let provider = await new ethers.providers.JsonRpcProvider(conInfo, net);
  let web3 = new Web3(provider);

  //generate wallets for the L1 account
  //use the KYC_ER account as we are attaching the ABI to it
  let pkey = enInfo.get(KYC_PKEY);
  let skey = new ethers.utils.SigningKey(pkey as string);
  let wallet = new ethers.Wallet(skey as SigningKey, provider);
  
  try {

    let [m,m2,contracts] = getAAllccountWallets(provider);
    const interfaceControls: contractInterface = {
        ready: true,
        cbdcMap: contracts,
        walByNameMap: m,
        wallByAddrMap: m2,
        prov: provider,
        web3:web3,
        envInfo:enInfo
    } ;

    await testWallets(contracts,m,provider);

    gConnectionInfo = interfaceControls;
    return interfaceControls;
  } catch (error) {
    let err = "Unable to connect with provider";
    console.error(err);
    throw new Error(err)
  }
}

