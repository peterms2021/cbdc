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


export const BANK_A_NAME="A";
export const BANK_B_NAME="B";

export const BANK_A_ADDRESS="A_Addr";
export const BANK_B_ADDRESS="B_Addr";

export const BANK_A_PKEY="A_Pkey";
export const BANK_B_PKEY="B_Pkey";

export const KYC_ADDR="K_Addr";
export const KYC_PKEY="K_Pkey";

export const MSFT_ADDR="MS_Addr";
export const MSFT_PKEY="MS_Pkey";

export const L1_URL="l1_url";
export const L1_USER_NAME="l1_user";
export const L1_USER_PWD="l1_pwd";
export const L1_USER_CONNECT_URL="l1_connect";



export function extractL1AccountDetails(): Map<string, string>{
    const dotenv = require("dotenv");
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
     
    let connectUrl = "https://" + hashmap.get(L1_USER_NAME) + ":" +  hashmap.get(L1_USER_PWD) + "@" + hashmap.get(L1_URL);

    hashmap.set(L1_USER_CONNECT_URL,  connectUrl);

    return hashmap;
}