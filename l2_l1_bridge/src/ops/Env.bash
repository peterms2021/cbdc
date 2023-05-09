

# export  MS_ESCROW="0xBF4961b1b32CA8873e0C760906745F2006878EF0"
# export  MS_ESCROW_PKEY="0x29b4526f5aed0509a7b7a9ed7927f4aa87986f60691dc780691346c0e3765749"

# export  BANK_B_ADDRESS="0xa3df034084078EBf20216b0789CF4901D8D6194E"
# export  BANK_B_PKEY="0xbedb65454ea3fe4e64f97d79655a6650f1ed0838aaadd94ca69350ad1f52ab97"

# export  KYCER_NAME="Kycer"
# export  KYC_ADDR="0x8b40c24C086FD50DA4D5B61d1D2Fbc46c3055D7d"
# export  KYC_PKEY="0x74379ebabfc890e43d0175a6421b7135e9e7d947be5467cc014510cac073b390"
]
# export  BANK_A="0xEDAC9E99e752107c8dE95DAd7cCD8bd0Ae352001"
# export  BANK_A_PKEY="0xb3eb9d9441bd67b03136ded6f0bfaaade05a12be2897e93ced0860cfbe79c8ce"


bankA 0xEDAC9E99e752107c8dE95DAd7cCD8bd0Ae352001
bankB 0xa3df034084078EBf20216b0789CF4901D8D6194E


#set WALLET_PKEY to whatever wallet we want to attach to
export WALLET_PKEY="0xb3eb9d9441bd67b03136ded6f0bfaaade05a12be2897e93ced0860cfbe79c8ce"

export  L1_URL="https://a0jq79osep-a0yjwjns56-rpc.au0-aws.kaleido.io/"
export  L1_USER_NAME="a0n86s1kp7"
export  L1_USER_PWD="kyXESMkfs9TpmqeljCYv35x1QBNxOxCE7j8YxHfWpX0"
# export  L1_USER_CONNECT_URL="https://a0n86s1kp7:kyXESMkfs9TpmqeljCYv35x1QBNxOxCE7j8YxHfWpX0@a0jq79osep-a0yjwjns56-rpc.au0-aws.kaleido.io/"

export L1_CHAIN_ID="1007845588"

#set the URL to the CCF instance
export CCF_HOST_NAME="cbdc-test1.confidential-ledger.azure.com"
export CCF_SERVER_PORT=443
export CCF_HOST_NAME="cbdc-test1.confidential-ledger.azure.com"
#private key
export CCF_CLIENT_KEY_FILE="~/.ccf_key/user0.key"
export CCF_CLIENT_CERT_FILE="~/.ccf_key/user0.cer"
export CCF_SERVICE_CERT_FILE="~/.ccf_key/service_cert.pem"

# THe L1 Member
export CCF_CLIENT_KEY_FILE="~/.ccf_key/peterwalker_privk.pem"
export CCF_CLIENT_CERT_FILE="~/.ccf_key/peterwalker_cert.pem"
export CCF_SERVICE_CERT_FILE="~/.ccf_key/service_cert.pem"


export CCF_CLIENT_CERT_FILE="~/workspace/cbdc/banking_app/workspace/sandbox_common/member0_cert.pem"
export CCF_CLIENT_KEY_FILE="~/workspace/cbdc/banking_app/workspace/sandbox_common/member0_privk.pem"
export CCF_SERVICE_CERT_FILE="~/workspace/cbdc/banking_app/workspace/sandbox_common/service_cert.pem"


export API_GET_TRANSACTION="/app/pendingtransactions"
export API_GET_LOAN="/get_loan"
export API_CONFIRM_LOAN="/confirm_loan"
export API_CONFIRM_TRANSFER="/confirm_transfer"
export API_REG_LOAN_HTLC="/reg_loan_htlc"
export API_RETURN_SHARES="/return_shares"
export API_UPDATE_PRICE="/update_price"

#how frequently to poll for transactions and send market updates
export API_POLL_NEW_TRANS_SEC="10"
export API_UPDATE_ORACLE_SEC="10"

# this env variable needs to change if we are running multiple instance on the same machine
export CBDC_PORT=7001

#if 0 - connet to regular wallet mode. Else act as bridge to CCF
export L1_APP_MODE=0
