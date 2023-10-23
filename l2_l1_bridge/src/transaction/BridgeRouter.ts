/**
 * Required External Modules and Interfaces
 */

 import express, { Request, Response } from "express";
import { processCloseLoanEarly, processGetSecrets } from "../ops/CcfBridgeServices.js";
 import * as WorkerService from "./CbdcWorker.js";
 import { transferFundsFrom, transferFundsFromResp, Accnt, accntBalance, transferFunds, transferFundsResp } from "./TransInterface.js";
 import { approveFunds,  approveFundsResp } from "./TransInterface.js";
 
 export const bridgeRouter = express.Router();

 export const gAccountsWatchedByBridge: string[] = [];
// PUT items/:id
 
export function addAccountToWatch(s:string){
    //check if account is on array already
    gAccountsWatchedByBridge.forEach(element => {
        if(element === s){
            console.log(` addAccountToWatch: ${s} is already on watch list`);
            return;
        }
    });

    gAccountsWatchedByBridge.push(s);
    console.log(` addAccountToWatch: ${s} added to watch list ${gAccountsWatchedByBridge}`);
}

export function removeAccountToWatch(s:string): boolean{
    let found:boolean = false;
    gAccountsWatchedByBridge.forEach( (item, index) => {
      if(item === s) {
        gAccountsWatchedByBridge.splice(index,1);
        found= true;
        console.log(` removeAccountToWatch: ${s} remove from list ${gAccountsWatchedByBridge}`);
      }
    });
    if(!found){
        console.log(` removeAccountToWatch: ${s} is not in watch list ${gAccountsWatchedByBridge}`);
    }
    return found;
 }

 export function isAccountBridgeWatchList(s:string): boolean {

    gAccountsWatchedByBridge.forEach(element => {
        if(element === s){
            //console.log(` addAccountToWatch: ${s} is already on watch list`);
            return true;
        }
    });  

    return false;
 }


 bridgeRouter.get("/list_watch", async (req: Request, res: Response) => {
    try {     
        res.status(200).json(gAccountsWatchedByBridge);
    } catch (e) {
        res.status(500).send(e.message);
    }
});

bridgeRouter.put("/add_watch/:id", async (req: Request, res: Response) => {
    const id: string = req.params.id;

    try {
        addAccountToWatch(id);     
        res.status(200).json("added");
    } catch (e) {
        res.status(500).send(e.message);
    }
});

 
// DELETE items/:id
 
bridgeRouter.delete("/del_watch/:id", async (req: Request, res: Response) => {
  try {

    let b = removeAccountToWatch(req.params.id,)    
    res.sendStatus(b?200:404);
  } catch (e) {
    res.status(500).send(e.message);
  }
});


bridgeRouter.get("/dump_secrets", async (req: Request, res: Response) => {
    try {
        let b = await processGetSecrets();   
        console.log(`dump_secrets: ${b as string}`);         
        if(b){
            res.status(200).json( b as string);         
        }else{
            res.status(200).json( "{[]}"); 
        }
       
    } catch (e) {
      res.status(500).send(e.message);
    }
  });


  bridgeRouter.get("/closeloanearly/:id", async (req: Request, res: Response) => {
    try {
        const id: string = req.params.id;
        console.log(`closeloanearly: ${id}`)
        let b = await processCloseLoanEarly(id);      
        console.log(`close_early: ${b as string}`);      
        res.status(200).json(b);
    } catch (e) {
      res.status(500).send(e.message);
    }
  });