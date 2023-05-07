Follow instructions here to install typescript in node project https://www.pullrequest.com/blog/intro-to-using-typescript-in-a-nodejs-express-project/#:~:text=How%20to%20Use%20TypeScript%20in%20a%20Node.js%20and,web%20server.%20...%205%205.%20Create%20scripts%20

This app depends on evironment variables that must be set to interact with the L1 chain. See Evn.ts to see the variables expected. For security reasons, private keys are obtained out of band.

compile the app 
```bash
npm run build
```

To run the app use
```bash
npm run start 
```

Each instance of the app runs against one account on the L1. 
Set the account PKEY in environment variable 
# Set the port 
Set the <CBDC_PORT> environment varaible - the port the the app will listen on (defualts to 7001)

# read account balance of the  accounts
curl http://localhost:7001/balance/ -i


# Total Money Supply 
curl http://localhost:7001/total_supply -i 

# Transfer_from
curl -i -X POST -H 'Content-Type: application/json; charset=UTF-8' -d '{"from":"<from addr>", "to":"<toaddr>","amount":"<number>"}' http://localhost:7001/transfer_from 

# Transfer
curl -i -X POST -H 'Content-Type: application/json; charset=UTF-8' -d '{"to":"<toaddr>","amount":"<number>"}' http://localhost:7001/transfer 

# Example
curl -i -X POST -H 'Content-Type: application/json; charset=UTF-8' -d '{"to":"0xa3df034084078EBf20216b0789CF4901D8D6194E","amount":"100"}' http://localhost:7001/transfer 


# ----  Allowances ----
# request allowance balance that spender can spend on behalf of owner
curl -i -X POST  -H 'Content-Type: application/json; charset=UTF-8' -d '{"owner":"<raddr>", "spender":"<saddr>"}'   http://localhost:7001/allowance
curl -i -X POST  -H 'Content-Type: application/json; charset=UTF-8' -d '{"owner":"0xEDAC9E99e752107c8dE95DAd7cCD8bd0Ae352001", "spender":"0xa3df034084078EBf20216b0789CF4901D8D6194E"}'   http://localhost:7001/allowance

#  Approve allowance
curl -i -X POST  -H 'Content-Type: application/json; charset=UTF-8' -d '{"spender":"<raddr>", "amt":"<number>"}'   http://localhost:7001/approve
curl -i -X POST  -H 'Content-Type: application/json; charset=UTF-8' -d '{"spender":"0xa3df034084078EBf20216b0789CF4901D8D6194E", "amount": "100"}'   http://localhost:7001/approve


# Increase allowance 
curl -i -X POST  -H 'Content-Type: application/json; charset=UTF-8' -d '{"spender":"<raddr>", "amount":"<number>"}'   http://localhost:7001/increase

# Example frlow
# bank A (0xEDAC9E99e752107c8dE95DAd7cCD8bd0Ae352001) requesting allowance for the bridge (0xBF4961b1b32CA8873e0C760906745F2006878EF0) to spend on its behalf (note we use port for Bank A L1 client - 8001)
curl -i -X POST  -H 'Content-Type: application/json; charset=UTF-8' -d '{"spender":"0xBF4961b1b32CA8873e0C760906745F2006878EF0", "amount":10000}'   http://localhost:8001/increase 
# Watch for the approval (events log on bridge)
            {
                "spender": "0xBF4961b1b32CA8873e0C760906745F2006878EF0",
                "owner": "0xEDAC9E99e752107c8dE95DAd7cCD8bd0Ae352001",
                "value": {
                    "type": "BigNumber",
                    "hex": "0x0f4240"
                },
                "eventData": {
                    "blockNumber": 11680711,
                    "blockHash": "0xa64f607670b61b905169d5bfb02e2388b1c911adde242d78ba03679a6bfdf441",
                    "transactionIndex": 0,
                    "removed": false,
                    "address": "0xb82C4150d953fcCcE42d7D53246B5553016c5C71",
                    "data": "0x00000000000000000000000000000000000000000000000000000000000f4240",
                    "topics": [
                        "0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925",
                        "0x000000000000000000000000edac9e99e752107c8de95dad7ccd8bd0ae352001",
                        "0x000000000000000000000000bf4961b1b32ca8873e0c760906745f2006878ef0"
                    ],
                    "transactionHash": "0x720d830e485ef658bd45e20b4303bd1945c28e3231945d5808048b96b6a1da47",
                    "logIndex": 0,
                    "event": "Approval",
                    "eventSignature": "Approval(address,address,uint256)",
                    "args": [
                        "0xEDAC9E99e752107c8dE95DAd7cCD8bd0Ae352001",
                        "0xBF4961b1b32CA8873e0C760906745F2006878EF0",
                        {
                            "type": "BigNumber",
                            "hex": "0x0f4240"
                        }
                    ]
                }
            }

# call to check allowance by the bridge
curl -i -X POST  -H 'Content-Type: application/json; charset=UTF-8' -d '{"owner":"0xEDAC9E99e752107c8dE95DAd7cCD8bd0Ae352001", "spender":"0xBF4961b1b32CA8873e0C760906745F2006878EF0"}'   http://localhost:7001/allowance


curl -i -X POST  -H 'Content-Type: application/json; charset=UTF-8' -d '{"owner":"0xBF4961b1b32CA8873e0C760906745F2006878EF0", "spender":"0xEDAC9E99e752107c8dE95DAd7cCD8bd0Ae352001"}'   http://localhost:7001/allowance


# now bridge do transfer from Bank A  to Bank B (0xa3df034084078EBf20216b0789CF4901D8D6194E) to pay fees
curl -i -X POST -H 'Content-Type: application/json; charset=UTF-8' -d '{"from":"0xEDAC9E99e752107c8dE95DAd7cCD8bd0Ae352001", "to":"0xa3df034084078EBf20216b0789CF4901D8D6194E","amount":1000}' http://localhost:7001/transfer_from 




# Decrease allowance 
curl -i -X POST  -H 'Content-Type: application/json; charset=UTF-8' -d '{"spender":"<raddr>", "amount":"<number>"}'   http://localhost:7001/decrease





# With KYCer account
# checking
curl http://localhost:7001/kyc/check/<addr>
curl http://localhost:7001/kyc/check/0xEDAC9E99e752107c8dE95DAd7cCD8bd0Ae352001

# KYC Grant
curl -i -X PUT http://localhost:7001/kyc/grant/<addr> 

# KYC Revoke
curl -i -X PUT http://localhost:7001/kyc/revoke/<addr> 

# KYC Count
curl http://localhost:7001/kyc/num/<addr> 




# ----------  HTLC
curl http://localhost:7001/htlc/all
curl http://localhost:7001/htlc/active

# Testing HTLC we provide - API to get hash of secrete and expiration tim
curl -X PUT  -H 'Content-Type: application/json; charset=UTF-8' -d '{"secret":"My Big Big Elephant"}'   http://localhost:7001/htlc/hash_secret
curl -X PUT  -H 'Content-Type: application/json; charset=UTF-8' -d '{"dur_ms":"30000"}'   http://localhost:7001/htlc/duration

# now you can use the output of the secret and duration to create a hash timelock
curl -i -X POST  -H 'Content-Type: application/json; charset=UTF-8' -d '{"receiver":"<raddr>", "secret":"<lock>",   "duration":"<duration>","amount":"<number>"}'   http://localhost:7001/htlc/create
curl -i -X POST  -H 'Content-Type: application/json; charset=UTF-8' -d '{ "sender":"<saddr>", "receiver":"<raddr>",  "secret":"<lock>", "duration":"<duration>","amount":"<number>"}'   http://localhost:7001/htlc/create_for


# example using the hash_secret and duration to do create and create_for
curl -X POST  -H 'Content-Type: application/json; charset=UTF-8' -d '{ "sender":"0xa3df034084078EBf20216b0789CF4901D8D6194E", "receiver":"0xEDAC9E99e752107c8dE95DAd7cCD8bd0Ae352001", "secret":"0x51dad7a4cd2ff63ef69ac8716ec45726784d3d77900e9c46761f14a44db6083e", "duration":"1682970634067","amount":"100"}'   http://localhost:7001/htlc/create_for

curl -X POST  -H 'Content-Type: application/json; charset=UTF-8' -d '{ "receiver":"0xEDAC9E99e752107c8dE95DAd7cCD8bd0Ae352001", "secret":"0x51dad7a4cd2ff63ef69ac8716ec45726784d3d77900e9c46761f14a44db6083e", "duration":"1682969581947","amount":"100"}'   http://localhost:7001/htlc/create



# --------- Bridge API -----
# private key
export CCF_CLIENT_KEY_FILE="~/.ccf_key/privk.pem"
# public key
export CCF_CLIENT_CERT_FILE="~/.ccf_key/cert.pem"
# mutual TLS service cert
export CCF_SERVICE_CERT_FILE="~/.ccf_key/service_cert.pem"

# see <loanDetails> in src/ops/CcfInterface.ts for interface definitions - the JSON data passed between these calls
# get pending loans - returns loanDetails
export API_GET_TRANSACTION="/pending_tx"  

# get loan returns the details of loan that needs to processed by bridge. See src/ops/CcfInterface.ts 
export API_GET_LOAN="/get_loan"

# called after Allowance approval is recieved.  See  <approvalLoanFees>  src/ops/CcfInterface.ts 
export API_CONFIRM_LOAN="/confirm_loan"

# called after transfer event is recieved for the accounts involved. See  <approvalLoanFees> in src/ops/CcfInterface.ts 
export API_CONFIRM_TRANSFER="/confirm_transfer"

# Register the HTLC Lock created with a loan. loanResponse in src/ops/CcfInterface.ts 
export API_REG_LOAN_HTLC="/reg_loan_htlc"


# TODO
# called to notify return of shares and updat
export API_RETURN_SHARES="/return_shares"
export API_UPDATE_PRICE="/update_price"


# Bridge management calls. We want to know what accounts to watch for transaction. This is necessary as the time between the
# Polling for events from the CCF app can cause the bridge to ignore allowance events because 
# the events may arrive before the polling sees the pending transaction in the account.
 
 # NB - change the HTTP port to match the port of the bridge is listening on
 # Get the accounts being watched
curl  http://localhost:7001/bridge/list_watch 
curl -X PUT  http://localhost:7001/bridge/add_watch/<accnt_addr> 
curl -X DELETE  http://localhost:7001/bridge/del_watch/<accnt_addr> 

example 
curl -X PUT  http://localhost:7001/bridge/add_watch/0xa3df034084078EBf20216b0789CF4901D8D6194E
curl -X DELETE  http://localhost:7001/bridge/del_watch/0xa3df034084078EBf20216b0789CF4901D8D6194E