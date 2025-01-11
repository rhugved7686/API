import express from 'express';
const router=express.Router();
    router.get("/",(req,res)=>{
        res.send("assigned  ride page")
    })
    router.get("/dashboard",(req,res)=>{
        res.send("Assigned ride Dashboard  page")
    })

export default router;