/**
 * Required External Modules and Interfaces
 */

import express, { Request, Response } from "express";
import * as WorkerService from "./CbdcWorker.js";
import { transferFundsFrom, transferFundsFromResp, Accnt, accntBalance, transferFunds, transferFundsResp } from "./Interface.js";
import { approveFunds,  approveFundsResp } from "./Interface.js";

export const cbdcRouter = express.Router();

/**
 * Controller Definitions
 */

// GET account balance

cbdcRouter.get("/balance/:acct", async (req: Request, res: Response) => {
    try {
        const id: string = req.params.acct;
        let bal: any;
        console.log("cbdcRouter/balance... ");
        bal = await WorkerService.getAccountBalance(id);
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



cbdcRouter.put("/approve", async (req: Request, res: Response) => {
    try {
        console.log(`transfer_from: ...`);
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
        console.log(`transfer: ${e.message}`);
        res.status(500).send(e.message);
    }
});


/*
// PUT items/:id
 
cbdcRouter.put("/approve", async (req: Request, res: Response) => {
  const id: number = parseInt(req.params.id, 10);
 
  try {
    const itemUpdate: Item = req.body;
 
    const existingItem: Item = await WorkerService.find(id);
 
    if (existingItem) {
      const updatedItem = await WorkerService.update(id, itemUpdate);
      return res.status(200).json(updatedItem);
    }
 
    const newItem = await WorkerService.create(itemUpdate);
 
    res.status(201).json(newItem);
  } catch (e) {
    res.status(500).send(e.message);
  }
});
 
// DELETE items/:id
 
cbdcRouter.delete("/:id", async (req: Request, res: Response) => {
  try {
    const id: number = parseInt(req.params.id, 10);
    await WorkerService.remove(id);
 
    res.sendStatus(204);
  } catch (e) {
    res.status(500).send(e.message);
  }
});
*/