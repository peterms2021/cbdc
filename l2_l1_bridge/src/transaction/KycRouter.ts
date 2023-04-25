/**
 * Required External Modules and Interfaces
 */

 import express, { Request, Response } from "express";
 import * as WorkerService from "./KycWorker.js";
 import { transferFundsFrom, transferFundsFromResp, Accnt, accntBalance } from "./Interface.js";
 
 
 export const kycRouter = express.Router();
 

 
 //KYC 
 kycRouter.get("/check/:acct", async (req: Request, res: Response) => {
     const id: string = req.params.acct;
     console.log(`kyc_check: ... ${id}`);
     try {
         let bal: any;
         bal = await WorkerService.checkKyc(id);
        
         return res.status(200).send(bal);
         //res.status(404).send("kyc_check failed");
     } catch (e) {
         res.status(500).send(e.message);
     }
 });
 
 kycRouter.put("/grant/:acct", async (req: Request, res: Response) => {
     const id: string = req.params.acct;
     try {
         let bal: any;
         bal = await WorkerService.grantKyc(id);
        
         return res.status(200).send(bal);
         //res.status(404).send("kyc_grant failed");
     } catch (e) {
         res.status(500).send(e.message);
     }
 });
 
 kycRouter.get("/num/:acct", async (req: Request, res: Response) => {
     const id: string = req.params.acct;
     try {
         let bal: any;
         bal = await WorkerService.numKyc(id);
 
         if (bal) {
             return res.status(200).send(bal);
         }
 
         res.status(404).send("kyc_num failed");
     } catch (e) {
         res.status(500).send(e.message);
     }
 });
 
 kycRouter.put("/revoke/:acct", async (req: Request, res: Response) => {
     const id: string = req.params.acct;
     try {
         let bal: any;
         bal = await WorkerService.revokeKyc(id);
 
         if (bal) {
             return res.status(200).send(bal);
         }
 
         res.status(404).send("kyc_num failed");
     } catch (e) {
         res.status(500).send(e.message);
     }
 });
 
 