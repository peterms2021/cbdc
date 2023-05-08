import util from "util";
import fs from "fs";
import untildify from "untildify";

import { enInfo } from "./CbdcConnect.js";
import {
  CCF_CLIENT_CERT_FILE,
  CCF_CLIENT_KEY_FILE,
  CCF_SERVER_NAME,
  CCF_SERVER_PORT,
  CCF_SERVICE_CERT_FILE,
  extractNumberEnvVar,
  extractStringEnvVar,
} from "./Env.js";

export var CCF_CLIENT_KEY_BUFFER: Buffer;
export var CCF_CLIENT_CERT_BUFFER: Buffer;
export var CCF_SERVICE_CERT_BUFFER: Buffer;
export var CCF_PORT: number;

export const prettyPrint = (o: any) => {
  return util.inspect(o, { showHidden: false, depth: null, colors: true });
};

export function loadCcfBridgeData() {
  CCF_PORT = extractNumberEnvVar(CCF_SERVER_PORT);
  var url: string;
  enInfo.set(CCF_SERVER_NAME, (url = extractStringEnvVar(CCF_SERVER_NAME))); //need to be without https
  enInfo.set(CCF_SERVER_PORT, extractStringEnvVar(CCF_SERVER_PORT));

  let key = untildify(extractStringEnvVar(CCF_CLIENT_KEY_FILE));
  let cert = untildify(extractStringEnvVar(CCF_CLIENT_CERT_FILE));
  let service = untildify(extractStringEnvVar(CCF_SERVICE_CERT_FILE));

  console.log(`ccf url:${url} port:${CCF_PORT}`);
  console.log(`key file: ${key}`);
  console.log(`cert file: ${cert}`);
  console.log(`service file: ${service}`);

  try {
    CCF_CLIENT_KEY_BUFFER = fs.readFileSync(key); // Secret client key
    CCF_CLIENT_CERT_BUFFER = fs.readFileSync(cert); // Public client key
    CCF_SERVICE_CERT_BUFFER = fs.readFileSync(service); //mutual TLS cert
  } catch (err) {
    console.log(` Error ${err}`);
  }
}
