#!/bin/bash
set -euox pipefail

declare server="https://127.0.0.1:8000"



# Define user accounts Id
#bridge_id='foo'
user0_id=$(openssl x509 -in "user0_cert.pem" -noout -fingerprint -sha256 | cut -d "=" -f 2 | sed 's/://g' | awk '{print tolower($0)}')
user1_id=$(openssl x509 -in "user1_cert.pem" -noout -fingerprint -sha256 | cut -d "=" -f 2 | sed 's/://g' | awk '{print tolower($0)}')#

# Run The testFunction
curl ${server}/app/testing -X POST --cacert service_cert.pem --cert user0_cert.pem --key user0_privk.pem


#Define cbdcAddresses
#bridge_address='0x5A84099345D666F5FC7FE644D0A7B0D2B51D84AD' #Dummy address
#user0_address='0xFBCC5EE4EA0AF205EBCB22017A221C0FA5569BAF' #Dummy address
#user1_address='0xB678AC4F4D06E21EF11E858940333692EC2C80BA' #Dummy address


# Register cbdcUsers
#curl ${server}/app/cbdcuser/"$user0_id"/$user0_address -X PUT --cacert service_cert.pem --cert member0_cert.pem --key member0_privk.pem
#curl ${server}/app/cbdcuser/"$user1_id"/$user1_address -X PUT --cacert service_cert.pem --cert member0_cert.pem --key member0_privk.pem

# Register security holdings
#curl ${server}/app/securities/"$user0_id" -X POST --cacert service_cert.pem --cert user0_cert.pem --key user0_privk.pem -H 'Content-Type: application/json' --data-binary "{ \"userId\": \"$user0_id\", \"holdings\": [{\"securityId\":\"MSFT\",\"quantity\":500}]}"
#curl ${server}/app/securities/"$user0_id" -X POST --cacert service_cert.pem --cert user0_cert.pem --key user0_privk.pem -H 'Content-Type: application/json' --data-binary "{ \"userId\": \"$user0_id\", \"holdings\": [{\"securityId\":\"AAPL\",\"quantity\":100}]}"

# Request security loan
#curl ${server}/app/loans/"$user1_id" -X POST --cacert service_cert.pem --cert user1_cert.pem --key user1_privk.pem -H 'Content-Type: application/json' --data-binary "{ \"userId\": \"$user1_id\", \"securityId\":\"MSFT\",\"quantity\":200}"

# Create account for user 1
#curl ${server}/app/account/"$user1_id"/$account_type1 -X PUT --cacert service_cert.pem --cert member0_cert.pem --key member0_privk.pem

# Deposit: user0, 100
#curl ${server}/app/deposit/"$user0_id"/$account_type0 -X POST --cacert service_cert.pem --cert member0_cert.pem --key member0_privk.pem -H "Content-Type: application/json" --data-binary '{ "value": 100 }'

# Transfer 40 from user0 to user1
#transfer_transaction_id=$(curl ${server}/app/transfer/"$account_type0" -X POST -i --cacert service_cert.pem --cert user0_cert.pem --key user0_privk.pem -H "Content-Type: application/json" --data-binary "{ \"value\": 40, \"user_id_to\": \"$user1_id\", \"account_name_to\": \"$account_type1\" }" | grep -i x-ms-ccf-transaction-id | awk '{print $2}' | sed -e 's/\r//g')
# "transaction ID of the transfer: $transfer_transaction_id"

# Wait until the receipt becomes available
#only_status_code="-s -o /dev/null -w %{http_code}"
#while [ "200" != "$(curl ${server}/app/receipt?transaction_id="$transfer_transaction_id" --cacert service_cert.pem --key user0_privk.pem --cert user0_cert.pem -s -o /dev/null -w %{http_code})" ]
#do
#    sleep 1
#done

# Verify receipt
#curl ${server}/app/receipt?transaction_id="$transfer_transaction_id" --cacert service_cert.pem --key user0_privk.pem --cert user0_cert.pem -s | ../../verify_receipt.sh

# Check user0 balance
#curl ${server}/app/balance/"$account_type0" -X GET --cacert service_cert.pem --cert user0_cert.pem --key user0_privk.pem

# Check user1 balance
#curl ${server}/app/balance/"$account_type1" -X GET --cacert service_cert.pem --cert user1_cert.pem --key user1_privk.pem

