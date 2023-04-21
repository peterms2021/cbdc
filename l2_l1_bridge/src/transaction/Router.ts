/**
 * Required External Modules and Interfaces
 */

 import express, { Request, Response } from "express";
 import * as WorkerService from "./CbdcWorker.js";
 import { transferFundsFrom,  transferFundsFromResp, Accnt, accntBalance } from "./Interface.js";


 export const cbdcRouter = express.Router();
/**
 * Controller Definitions
 */

// GET account balance

cbdcRouter.get("/balance/:id", async (req: Request, res: Response) => {
    try {
      const id: string =  req.params.id; 
      let bal:any;
      console.log("cbdcRouter/balance... ");
      bal = await WorkerService.getAccountBalance(id);
       if(bal){
            res.status(200).send(bal);
       }else{
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
        let bal:any;
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
      const trans: transferFundsFrom = req.body;
  
      let tr = await WorkerService.transferFrom(trans);
      if(tr === undefined){
        res.status(400).json("Bad request");
      }
      res.status(201).json(tr);
    } catch (e) {
      res.status(500).send(e.message);
    }
  });
  
  /*
  // PUT items/:id
  
  cbdcRouter.put("/:id", async (req: Request, res: Response) => {
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