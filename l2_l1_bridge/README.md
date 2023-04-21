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

Set the CBDC_PORT environment varaible - the port the the app will listen on (defualts to 7000)

//read account balance of the  accounts
curl http://localhost:7000/balance/BANK_A -i
curl http://localhost:7000/balance/BANK_B -i
curl http://localhost:7000/balance/MSFT -i

