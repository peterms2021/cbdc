#!/bin/bash
user0_id=$(openssl x509 -in "./.prod_certs/user0.cer" -noout -fingerprint -sha256 | cut -d "=" -f 2 | sed 's/://g' | awk '{print tolower($0)}')
user1_id=$(openssl x509 -in "./.prod_certs/user1.cer" -noout -fingerprint -sha256 | cut -d "=" -f 2 | sed 's/://g' | awk '{print tolower($0)}')

echo $user0_id
echo $user1_id