/**
 * Required External Modules and Interfaces
 */

 import { BigNumber, utils } from "ethers";
 import express, { Request, Response } from "express";
 import * as htlcService from "./HtlcWorker.js";
 import { transferFundsFrom, transferFundsFromResp, Accnt, accntBalance, transferFunds, transferFundsResp, htlcLock, htlcLockFor, htlcWithdraw, htlcSecret, htlcSecretResp, htlcDuration, htlcDurationResp } from "./Interface.js";
 import { approveFunds,  approveFundsResp } from "./Interface.js";
 
 export const htlcRouter = express.Router();
 

 // Post account balance

 htlcRouter.post("/create", async (req: Request, res: Response) => {
    try {
        
        console.log(`htlc/create: ...`);
        const trans: htlcLock = req.body;
        let a: BigNumber = utils.parseUnits(trans.amount.toString(), 2);
        let resp = await htlcService.createHTLC(trans.receiver, trans.duration.toString(),a );
        if (resp) {
            let [r,e] = resp;
            if(e.length == 0){
                res.status(200).json(resp);
            }else{

                res.status(400).send(resp);
            }
        } else {
            res.status(400).send("createHTLC failed");
        }
    } catch (e) {
        res.status(500).send(e.message);
    }
});


htlcRouter.post("/create_for", async (req: Request, res: Response) => {
    try {
        
        console.log(`htlc/create_for: ...`);
        const trans: htlcLockFor = req.body;
        let a: BigNumber = utils.parseUnits(trans.amount.toString(), 2);
        let resp = await htlcService.createHTLCFor( trans.sender, trans.receiver, trans.duration.toString(),a );
        if (resp) {
            let [r,e] = resp;
            if(e.length == 0){
                res.status(200).json(resp);
            }else{

                res.status(400).send(resp);
            }
        } else {
            res.status(400).send("createHTLCFor failed");
        }
    } catch (e) {
        res.status(500).send(e.message);
    }
});


htlcRouter.get("/active", async (req: Request, res: Response) => {
    try {

        console.log("htlc/active... ");
        let resp = await htlcService.getActiveHTLCs();
        if (resp) {
            let [r,e] = resp;
            if(e.length == 0){
                res.status(200).json(resp);
            }else{
                res.status(400).json(resp);
            }
        } else {
            res.status(400).send("getActiveHTLCs failed");
        }
    } catch (e) {
        res.status(500).send(e.message);
    }
});

htlcRouter.get("/all", async (req: Request, res: Response) => {
    try {

        console.log("htlc/all... ");
        let resp = await htlcService.getAllHTLCs();
        if (resp) {
            let [r,e] = resp;
            if(e.length == 0){
                res.status(200).json(resp);
            }else{
                res.status(400).json(resp);
            }
        } else {
            res.status(400).send("getAllHTLCs failed");
        }
    } catch (e) {
        res.status(500).send(e.message);
    }
});

htlcRouter.get("/inactive", async (req: Request, res: Response) => {
    try {

        console.log("htlc/inactive... ");
        let resp = await htlcService.getInactiveHTLCs();
        if (resp) {
            let [r,e] = resp;
            if(e.length == 0){
                res.status(200).json(resp);
            }else{
                res.status(400).json(resp);
            }
        } else {
            res.status(400).send("getInactiveHTLCs failed");
        }
    } catch (e) {
        res.status(500).send(e.message);
    }
});

htlcRouter.get("/amount/:id", async (req: Request, res: Response) => {
    const id: string = req.params.id;
    try {
        console.log(`htlc/amount... ${id}`);
        let resp = await htlcService.getHtlcAmount(id);
        if (resp) {
            let [r,e] = resp;
            if(e.length == 0){
                res.status(200).json(resp);
            }else{
                res.status(400).json(resp);
            }
        } else {
            res.status(400).send("getHtlcAmount failed");
        }
    } catch (e) {
        res.status(500).send(e.message);
    }
});

htlcRouter.get("/balance/:id", async (req: Request, res: Response) => {
    const id: string = req.params.id;
    try {
        console.log(`htlc/balance... ${id}`);
        let resp = await htlcService.getHtlcBalance(id);
        if (resp) {
            let [r,e] = resp;
            if(e.length == 0){
                res.status(200).json(resp);
            }else{
                res.status(400).json(resp);
            }
        } else {
            res.status(400).send("getHtlcBalance failed");
        }
    } catch (e) {
        res.status(500).send(e.message);
    }
});

htlcRouter.get("/enabled/:id", async (req: Request, res: Response) => {
    const id: string = req.params.id;
    try {
        console.log(`htlc/inactive... ${id}`);
        let resp = await htlcService.getHtlcEnabled(id);
        if (resp) {
            let [r,e] = resp;
            if(e.length == 0){
                res.status(200).json(resp);
            }else{
                res.status(400).json(resp);
            }
        } else {
            res.status(400).send("getHtlcEnabled failed");
        }
    } catch (e) {
        res.status(500).send(e.message);
    }
});

htlcRouter.put("/lock/:id", async (req: Request, res: Response) => {
    const id: string = req.params.id;
    try {

        console.log(`htlc/lock... ${id}`);
        let resp = await htlcService.htlcHashLock(id);
        if (resp) {
            let [r,e] = resp;
            if(e.length == 0){
                res.status(200).json(resp);
            }else{
                res.status(400).json(resp);
            }
        } else {
            res.status(400).send("htlcHashLock failed");
        }
    } catch (e) {
        res.status(500).send(e.message);
    }
});

htlcRouter.get("/preimage/:id", async (req: Request, res: Response) => {
    const id: string = req.params.id;
    try {

        console.log(`htlc/htlcPreimage ... ${id}`);
        let resp = await htlcService.htlcPreimage(id);
        if (resp) {
            let [r,e] = resp;
            if(e.length == 0){
                res.status(200).json(resp);
            }else{
                res.status(400).json(resp);
            }
        } else {
            res.status(400).send("htlcPreimage failed");
        }
    } catch (e) {
        res.status(500).send(e.message);
    }
});

htlcRouter.get("/receiver/:id", async (req: Request, res: Response) => {
    const id: string = req.params.id;
    try {

        console.log(`htlc/htlcReceiver ... ${id}`);
        let resp = await htlcService.htlcReceiver(id);
        if (resp) {
            let [r,e] = resp;
            if(e.length == 0){
                res.status(200).json(resp);
            }else{
                res.status(400).json(resp);
            }
        } else {
            res.status(400).send("htlcReceiver failed");
        }
    } catch (e) {
        res.status(500).send(e.message);
    }
});

htlcRouter.get("/refund/:id", async (req: Request, res: Response) => {
    const id: string = req.params.id;
    try {

        console.log(`htlc/refund ... ${id}`);
        let resp = await htlcService.htlcRefund(id);
        if (resp) {
            let [r,e] = resp;
            if(e.length == 0){
                res.status(200).json(resp);
            }else{
                res.status(400).json(resp);
            }
        } else {
            res.status(400).send("htlcRefund failed");
        }
    } catch (e) {
        res.status(500).send(e.message);
    }
});

htlcRouter.get("/refunded/:id", async (req: Request, res: Response) => {
    const id: string = req.params.id;
    try {

        console.log(`htlc/refunded ... ${id}`);
        let resp = await htlcService.htlcRefunded(id);
        if (resp) {
            let [r,e] = resp;
            if(e.length == 0){
                res.status(200).json(resp);
            }else{
                res.status(400).json(resp);
            }
        } else {
            res.status(400).send("htlcRefunded failed");
        }
    } catch (e) {
        res.status(500).send(e.message);
    }
});


htlcRouter.get("/seized/:id", async (req: Request, res: Response) => {
    const id: string = req.params.id;
    try {

        console.log(`htlc/seized ... ${id}`);
        let resp = await htlcService.htlcSeized(id);
        if (resp) {
            let [r,e] = resp;
            if(e.length == 0){
                res.status(200).json(resp);
            }else{
                res.status(400).json(resp);
            }
        } else {
            res.status(400).send("htlcSeized failed");
        }
    } catch (e) {
        res.status(500).send(e.message);
    }
});


htlcRouter.get("/sender/:id", async (req: Request, res: Response) => {
    const id: string = req.params.id;
    try {

        console.log(`htlc/sender ... ${id}`);
        let resp = await htlcService.htlcSender(id);
        if (resp) {
            let [r,e] = resp;
            if(e.length == 0){
                res.status(200).json(resp);
            }else{
                res.status(400).json(resp);
            }
        } else {
            res.status(400).send("htlcSender failed");
        }
    } catch (e) {
        res.status(500).send(e.message);
    }
});

htlcRouter.get("/timelock/:id", async (req: Request, res: Response) => {
    const id: string = req.params.id;
    try {

        console.log(`htlc/timelock ... ${id}`);
        let resp = await htlcService.htlcTimeLock(id);
        if (resp) {
            let [r,e] = resp;
            if(e.length == 0){
                res.status(200).json(resp);
            }else{
                res.status(400).json(resp);
            }
        } else {
            res.status(400).send("htlcTimeLock failed");
        }
    } catch (e) {
        res.status(500).send(e.message);
    }
});


htlcRouter.get("/is_withdrawn/:id", async (req: Request, res: Response) => {
    const id: string = req.params.id;
    try {

        console.log(`htlc/withdrawn ... ${id}`);
        let resp = await htlcService.htlcWithdrawn(id);
        if (resp) {
            let [r,e] = resp;
            if(e.length == 0){
                res.status(200).json(resp);
            }else{
                res.status(400).json(resp);
            }
        } else {
            res.status(400).send("htlcWithdrawn failed");
        }
    } catch (e) {
        res.status(500).send(e.message);
    }
});


htlcRouter.post("/withdraw/:id", async (req: Request, res: Response) => {
    
    console.log(`htlc/withdraw: ...`);
    const trans: htlcWithdraw = req.body;
    try {

        console.log(`htlc/withdrawn ... ${trans}`);
        let resp = await htlcService.htlcWithdraw(trans.htlc, trans.preimage);
        if (resp) {
            let [r,e] = resp;
            if(e.length == 0){
                res.status(200).json(resp);
            }else{
                res.status(400).json(resp);
            }
        } else {
            res.status(400).send("htlcWithdraw failed");
        }
    } catch (e) {
        res.status(500).send(e.message);
    }
});



 const shash  = async (v:string) : Promise<[r:string]> => {
    let r =  utils.keccak256(utils.toUtf8Bytes(v));
    return [r];
};

//test function
htlcRouter.put("/hash_secret", async (req: Request, res: Response) => {
    const val: htlcSecret = req.body;
    console.log(`htlc/hash_secret: ...${val}`);
    
    let [r] = await shash(val.secret);
    console.log(`htlc/hash: ...${r}`);

    //let rr: htlcSecretResp;
    //rr.result = r;
    res.status(200).json(r);
});

//test function
htlcRouter.put("/duration", async (req: Request, res: Response) => {
    const val: htlcDuration = req.body;
    console.log(`htlc/duration: ...${val}`);
    
    //get how many milliseconds to add to the current time
    let f = val.dur_ms;
    let v = Date.now();
    let r = +v + +f;
    console.log(`duration: ${f} + now ${v} => ${r}`);
    
    //let rres: htlcDurationResp;
    //rres.result  = r;
    res.status(200).json(r);
});


