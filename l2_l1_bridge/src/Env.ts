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


export const BANK_A_NAME="BANK_A_NAME";
export const BANK_B_NAME="BANK_B_NAME";
export const KYC_NAME="KYC";
export const MSFT_NAME="MSFT";

export const BANK_A_ADDRESS="BANK_A_ADDRESS";
export const BANK_B_ADDRESS="BANK_B_ADDRESS";

export const BANK_A_PKEY="BANK_A_PKEY";
export const BANK_B_PKEY="BANK_B_PKEY";

export const KYC_ADDR="KYC_ADDR";
export const KYC_PKEY="KYC_PKEY";

export const MSFT_ADDR="MSFT_ADDR";
export const MSFT_PKEY="MSFT_PKEY";

export const L1_URL="L1_URL";
export const L1_USER_NAME="L1_USER_NAME";
export const L1_USER_PWD="L1_USER_PWD";
export const L1_USER_CONNECT_URL="L1_USER_CONNECT_URL";
export const L1_CHAIN_ID="L1_CHAIN_ID";

export function extractL1AccountDetails(): Map<string, string>{
    //const dotenv = require("dotenv");
    //load the contents of .env file
    dotenv.config()

    let hashmap = new Map<string, string>();

    hashmap.set(BANK_A_NAME,  extractStringEnvVar(BANK_A_NAME));
    hashmap.set(BANK_B_NAME,  extractStringEnvVar(BANK_B_NAME));

    hashmap.set(BANK_A_ADDRESS,  extractStringEnvVar(BANK_A_ADDRESS));
    hashmap.set(BANK_B_ADDRESS,  extractStringEnvVar(BANK_B_ADDRESS));

    hashmap.set(BANK_A_PKEY,  extractStringEnvVar(BANK_A_PKEY));
    hashmap.set(BANK_B_PKEY,  extractStringEnvVar(BANK_B_PKEY));

    hashmap.set(KYC_ADDR,  extractStringEnvVar(KYC_ADDR));
    hashmap.set(KYC_PKEY,  extractStringEnvVar(KYC_PKEY));

    hashmap.set(MSFT_ADDR,  extractStringEnvVar(MSFT_ADDR));
    hashmap.set(MSFT_PKEY,  extractStringEnvVar(MSFT_PKEY));

    hashmap.set(L1_URL,  extractStringEnvVar(L1_URL)); //need to be without https
    hashmap.set(L1_USER_NAME,  extractStringEnvVar(L1_USER_NAME));
    hashmap.set(L1_USER_PWD,  extractStringEnvVar(L1_USER_PWD));
    hashmap.set(L1_CHAIN_ID, extractStringEnvVar(L1_CHAIN_ID));
     
    let connectUrl = "https://" + hashmap.get(L1_USER_NAME) + ":" +  hashmap.get(L1_USER_PWD) + "@" + hashmap.get(L1_URL);

    hashmap.set(L1_USER_CONNECT_URL,  connectUrl);

    return hashmap;
}