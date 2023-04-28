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

Each instance of the app runs against one account on the L1. 
Set the account PKEY in environment variable 
# Set the port 
Set the <CBDC_PORT> environment varaible - the port the the app will listen on (defualts to 7001)

# read account balance of the  accounts
curl http://localhost:7001/balance/ -i


# Total Money Supply 
curl http://localhost:7001/total_supply -i 

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

# Transfer 
curl -i -X POST -H 'Content-Type: application/json; charset=UTF-8' -d '{"from":"<from addr>", "to":"<toaddr>","amount":"100"}' http://localhost:7001/transfer_from 

# HTLC
curl http://localhost:7001/htlc/all
curl http://localhost:7001/htlc/active


# Testing HTLC we provide - API to get hash of secrete and expiration tim
curl -X PUT  -H 'Content-Type: application/json; charset=UTF-8' -d '{"secret":"My Big Big Elephant"}'   http://localhost:7001/htlc/hash_secret
curl -X PUT  -H 'Content-Type: application/json; charset=UTF-8' -d '{"dur_ms":"10000"}'   http://localhost:7001/htlc/duration

# now you can use the output of the secret and duration to create a hash timelock
curl -i -X POST  -H 'Content-Type: application/json; charset=UTF-8' -d '{"receiver":"<raddr>", "duration":"<duration>","amount":"<number>"}'   http://localhost:7001/htlc/create
curl -i -X POST  -H 'Content-Type: application/json; charset=UTF-8' -d '{ "sender":"<saddr>", "receiver":"<raddr>", "duration":"<duration>","amount":"<number>"}'   http://localhost:7001/htlc/create_for


# Bridge call