Project setup - https://www.digitalocean.com/community/tutorials/setting-up-a-node-project-with-typescript

1. Setup clef for account management with g-eth client. See https://geth.ethereum.org/docs/getting-started for details on setting up clef
Initialize clef master
clef init geth/clefdata 


2. We use geth/keystore here, but this should be understood to be wherever the keystore location is on the server running the geth client
Use the <geth/keystore> as the location relative to where the clef client is started
clef --keystore geth/keystore importraw <key1.data>
clef --keystore geth/keystore importraw <key2.data>
...
clef --keystore geth/keystore importraw <key4.data>



3. Locate the chain ID (for the kaleido test site is the Environment Info under the Environment settings)
#clef --chainid <ID> --keystore geth/keystore --configdir geth/clef --http

clef --chainid 763928235  --keystore geth/keystore --configdir geth/clef --http

4. Run the Go-Ethereum client
geth --datadir geth --signer=geth/clef/clef.ipc

geth --sepolia --datadir geth --authrpc.addr localhost --authrpc.port 8551 --authrpc.vhosts localhost --authrpc.jwtsecret geth/jwtsecret --http --http.api eth,net --signer=geth/clef/clef.ipc --http

geth --sepolia --datadir geth --authrpc.addr localhost --authrpc.port 8551 --authrpc.vhosts localhost --authrpc.jwtsecret geth/jwtsecret --http --http.api eth,net --signer=geth/clef/clef.ipc --http

geth  --signer=geth/clef/clef.ipc --http 
