Follow instructions here to install typescript in node project https://www.pullrequest.com/blog/intro-to-using-typescript-in-a-nodejs-express-project/#:~:text=How%20to%20Use%20TypeScript%20in%20a%20Node.js%20and,web%20server.%20...%205%205.%20Create%20scripts%20

This app depends on evironment variables that must be set to interact with the L1 chain. See Evn.ts to see the variables expected. For security reasons, private keys are obtained out of band.

compile the app 
```bash
nmp run build
```

To run the app use
```bash
npm run start 
```

Set the CBDC_PORT environment varaible - the port the the app will listen on (defualts to 7001)

# read account balance of the  accounts
curl http://localhost:7001/balance/BankA -i
curl http://localhost:7001/balance/BankB 
curl http://localhost:7001/balance/MsBank 

# Total Money Supply 
curl http://localhost:7001/total_supply -i 

# KYC checking
curl http://localhost:7001/kyc/check/BankB 
curl http://localhost:7001/kyc/check/MsBank 

# KYC Grant
curl -i -X PUT http://localhost:7001/kyc/grant/BankB 
curl -i -X PUT http://localhost:7001/kyc/grant/BankA
curl -i -X PUT http://localhost:7001/kyc/grant/MsBank 

# KYC Revoke
curl -i -X PUT http://localhost:7001/kyc/revoke/BankB 

# KYC Count
curl http://localhost:7001/kyc/num/BankB 
curl http://localhost:7001/kyc/num/BankA
curl http://localhost:7001/kyc/num/MsBank

# Transfer 
curl -i -X POST -H 'Content-Type: application/json; charset=UTF-8' -d '{"from":"MsBank", "to":"BankA","amount":"100"}' http://localhost:7001/transfer_from 

# HTLC
curl http://localhost:7001/htlc/all
curl http://localhost:7001/htlc/active


# Testing HTLC we provide - API to get hash of secrete and expiration tim
curl -X PUT  -H 'Content-Type: application/json; charset=UTF-8' -d '{"secret":"My Big Big Elephant"}'   http://localhost:7001/htlc/hash_secret
curl -X PUT  -H 'Content-Type: application/json; charset=UTF-8' -d '{"dur_ms":"10000"}'   http://localhost:7001/htlc/duration

# now you can use the output of the secret and duration to create a hash timelock
curl -i -X POST  -H 'Content-Type: application/json; charset=UTF-8' -d '{"receiver":"MsBank", "duration":"<duration>","amount":"<number>"}'   http://localhost:7001/htlc/create
curl -i -X POST  -H 'Content-Type: application/json; charset=UTF-8' -d '{ "sender":"<bank>", "receiver":"<bank>", "duration":"<duration>","amount":"<number>"}'   http://localhost:7001/htlc/create_for