import * as dotenv from 'dotenv';

export function extractStringEnvVar(
    key: keyof NodeJS.ProcessEnv,
): string {
    const value = process.env[key];

    if (value === undefined) {
        const message = `The environment variable "${key}" cannot be "undefined".`;

        throw new Error(message);
    }

    return value;
}

export function extractNumberEnvVar(
    key: keyof NodeJS.ProcessEnv,
): number {
    const stringValue = extractStringEnvVar(key);

    const numberValue = parseFloat(stringValue);

    if (Number.isNaN(numberValue)) {
        const message = `The environment variable "${key}" has to hold a stringified number value - not ${stringValue}`;

        throw new Error(message);
    }

    return numberValue;
}

export function extractIntegerEnvVar(
    key: keyof NodeJS.ProcessEnv,
): number {
    const stringValue = extractStringEnvVar(key);

    const numberValue = parseInt(stringValue, 10);

    if (Number.isNaN(numberValue)) {
        const message = `The environment variable "${key}" has to hold a stringified integer value - not ${stringValue}`;

        throw new Error(message);
    }

    return numberValue;
}

export function extractBooleanEnvVar(
    key: keyof NodeJS.ProcessEnv,
): boolean {
    const value = extractIntegerEnvVar(key);

    return Boolean(value);
}

/*
export const BANK_A_NAME="BANK_A_NAME";
export const BANK_B_NAME="BANK_B_NAME";

export const BANK_A_ADDRESS="BANK_A_ADDRESS";
export const BANK_B_ADDRESS="BANK_B_ADDRESS";

export const BANK_A_PKEY="BANK_A_PKEY";
export const BANK_B_PKEY="BANK_B_PKEY";

export const KYCER_NAME="KYCER_NAME";
export const KYC_ADDR="KYC_ADDR";
export const KYC_PKEY="KYC_PKEY";

export const ESCROW_BANK_NAME="ESCROW_BANK_NAME";
export const MSFT_ADDR="MSFT_ADDR";
export const MSFT_PKEY="MSFT_PKEY";
*/

//the single Wallet we want to attach to. This could be KCYER, BRIDGE or bank 
export const L1_WALLET_PKEY="WALLET_PKEY";

export const L1_URL="L1_URL";
export const L1_USER_NAME="L1_USER_NAME";
export const L1_USER_PWD="L1_USER_PWD";
export const L1_USER_CONNECT_URL="L1_USER_CONNECT_URL";
export const L1_CHAIN_ID="L1_CHAIN_ID";

export const  CCF_URL="CCF_URL";
export const  CCF_NEW_TRANSACTION="API_GET_TRANSACTION";

export const  CCF_POLL_NEW_TRANS="API_POLL_NEW_TRANS_SEC";
export const  CCF_POLL_ORACLE="API_UPDATE_ORACLE_SEC";

export const  CCF_GET_LOAN="API_GET_LOAN";
export const  CCF_CONFIRM_LOAN="API_CONFIRM_LOAN";
export const  CCF_CONFIRM_TRANSFER="API_CONFIRM_TRANSFER";
export const  CCF_RETURN_SHARES="API_RETURN_SHARES";
export const  CCF_UPDATE_PRICE="API_UPDATE_PRICE";
export const   CCF_LOAN_LOCK="API_REG_LOAN_HTLC";

//The run mode of the app 
export enum AppRunMode { 
    NORMAL_MODE=0,
    LOG_SUBSCRIBER = 1, 
    EVENT_SUBSCRIBER = 2,
    TX_EVENT_WRITER = 3,
}
export const APP_RUN_MODE="L1_APP_MODE"


export function envRunMode():number {
    let n = extractIntegerEnvVar(APP_RUN_MODE);
    console.log(`Env run mode:= ${n}`);
    return n;
}

export function extractL1AccountDetails(): Map<string, string>{
    //const dotenv = require("dotenv");
    //load the contents of .env file
    dotenv.config()

    let hashmap = new Map<string, string>();

    hashmap.set(L1_WALLET_PKEY,  extractStringEnvVar(L1_WALLET_PKEY));

    hashmap.set(L1_URL,  extractStringEnvVar(L1_URL)); //need to be without https
    hashmap.set(L1_USER_NAME,  extractStringEnvVar(L1_USER_NAME));
    hashmap.set(L1_USER_PWD,  extractStringEnvVar(L1_USER_PWD));
    hashmap.set(L1_CHAIN_ID, extractStringEnvVar(L1_CHAIN_ID));

    let connectUrl = "https://" + hashmap.get(L1_USER_NAME) + ":" +  hashmap.get(L1_USER_PWD) + "@" + hashmap.get(L1_URL);
    hashmap.set(L1_USER_CONNECT_URL,  connectUrl);


    let ccf_url = extractStringEnvVar(CCF_URL);
    hashmap.set(CCF_URL,  ccf_url); //need to be without https
    hashmap.set(CCF_NEW_TRANSACTION,  ccf_url + extractStringEnvVar(CCF_NEW_TRANSACTION));

    hashmap.set(CCF_POLL_NEW_TRANS,  extractStringEnvVar(CCF_POLL_NEW_TRANS));
    hashmap.set(CCF_POLL_ORACLE,  extractStringEnvVar(CCF_POLL_ORACLE));

    hashmap.set(CCF_GET_LOAN,  ccf_url + extractStringEnvVar(CCF_GET_LOAN));
    hashmap.set(CCF_CONFIRM_LOAN, ccf_url + extractStringEnvVar(CCF_CONFIRM_LOAN)); 
    hashmap.set(CCF_CONFIRM_TRANSFER, ccf_url + extractStringEnvVar(CCF_CONFIRM_TRANSFER));
    hashmap.set(CCF_LOAN_LOCK, ccf_url + extractStringEnvVar(CCF_LOAN_LOCK));

    hashmap.set(CCF_RETURN_SHARES,  ccf_url + extractStringEnvVar(CCF_RETURN_SHARES));
    hashmap.set(CCF_UPDATE_PRICE, ccf_url + extractStringEnvVar(CCF_UPDATE_PRICE));


    
    
    return hashmap;
}