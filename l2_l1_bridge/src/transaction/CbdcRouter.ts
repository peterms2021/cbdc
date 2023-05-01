/**
 * Required External Modules and Interfaces
 */

import express, { Request, Response } from "express";
import * as WorkerService from "./CbdcWorker.js";
import { transferFundsFrom, transferFundsFromResp, Accnt, accntBalance, transferFunds, transferFundsResp, allowAnce } from "./TransInterface.js";
import { approveFunds,  approveFundsResp } from "./TransInterface.js";

export const cbdcRouter = express.Router();

/**
 * Controller Definitions
 */

// GET account balance

cbdcRouter.get("/balance", async (req: Request, res: Response) => {
    try {
        //const id: string = req.params.acct;
        let bal: any;
        console.log("cbdcRouter/balance... ");
        bal = await WorkerService.getAccountBalance();
        if (bal) {
            res.status(200).send(bal);
        } else {
            res.status(400).send("Count not find account");
        }
    } catch (e) {
        res.status(500).send(e.message);
    }
});

// GET money supply
cbdcRouter.get("/total_supply", async (req: Request, res: Response) => {
    //const id: number = parseInt(req.params.id, 10);

    try {
        let bal: any;
        bal = await WorkerService.getMoneySupply();

        if (bal) {
            return res.status(200).send(bal);
        }

        res.status(404).send("failed to read money supply");
    } catch (e) {
        res.status(500).send(e.message);
    }
});


// POST items
cbdcRouter.post("/transfer_from", async (req: Request, res: Response) => {
    try {
        console.log(`transfer_from: ...`);
        const trans: transferFundsFrom = req.body;

        let tr = await WorkerService.transferFrom(trans);
        if (tr === undefined) {
            res.status(400).json("Bad request");
        }
        if (tr.err.length){
            res.status(400).send(tr.err);
        }else{
            res.status(201).json(tr);
        }
    } catch (e) {
        console.log(`transfer_from: ${e.message}`);
        res.status(500).send(e.message);
    }
});




// POST items
cbdcRouter.post("/transfer", async (req: Request, res: Response) => {
    try {
        console.log(`transfer_from: ...`);
        const trans: transferFunds = req.body;

        let tr = await WorkerService.transfer(trans);
        if (tr === undefined) {
            res.status(400).json("Bad request");
        }
        if (tr.err.length){
            res.status(400).send(tr.err);
        }else{
            res.status(201).json(tr);
        }
    } catch (e) {
        console.log(`transfer: ${e.message}`);
        res.status(500).send(e.message);
    }
});


// POST items
cbdcRouter.post("/allowance", async (req: Request, res: Response) => {
    try {
        
        const trans: allowAnce = req.body;
        //console.log(`allowance: ... ${trans}`);

        let tr = await WorkerService.allowance(trans);
        if (tr === undefined) {
            res.status(400).json("Bad request");
        }
        if (tr.err.length){
            res.status(400).send(tr.err);
        }else{
            res.status(201).json(tr);
        }
    } catch (e) {
        console.log(`allowance: ${e.message}`);
        res.status(500).send(e.message);
    }
});


cbdcRouter.post("/approve", async (req: Request, res: Response) => {
    try {    
        const trans: approveFunds = req.body;

        let tr = await WorkerService.approve(trans);
        if (tr === undefined) {
            res.status(400).json("Bad request");
        }
        if (tr.err.length){
            res.status(400).send(tr.err);
        }else{
            res.status(201).json(tr);
        }
    } catch (e) {
        console.log(`approve: ${e.message}`);
        res.status(500).send(e.message);
    }
});


cbdcRouter.post("/increase", async (req: Request, res: Response) => {
    try {
        
        const trans: approveFunds = req.body;
        //console.log(`increase: ... ${trans}`);

        let tr = await WorkerService.increaseAllowance(trans);
        if (tr === undefined) {
            res.status(400).json("Bad request");
        }
        if (tr.err.length){
            res.status(400).send(tr.err);
        }else{
            res.status(201).json(tr);
        }
    } catch (e) {
        console.log(`increase: ${e.message}`);
        res.status(500).send(e.message);
    }
});

cbdcRouter.post("/decrease", async (req: Request, res: Response) => {
    try {
        
        const trans: approveFunds = req.body;
        console.log(`decrease: ... ${trans}`);

        let tr = await WorkerService.decreaseAllowance(trans);
        if (tr === undefined) {
            res.status(400).json("Bad request");
        }
        if (tr.err.length){
            res.status(400).send(tr.err);
        }else{
            res.status(201).json(tr);
        }
    } catch (e) {
        console.log(`decrease: ${e.message}`);
        res.status(500).send(e.message);
    }
});


