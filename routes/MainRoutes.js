import express from 'express';
const router=express.Router();

router.get("/", (req, res) => {

    res.send("Default route");
});

router.get("/Login",(req,res)=>{
    res.send("Login")
    
})

router.get("/AssignedRide",(req,res)=>{
    res.send("Ride assigned")
})
router.get("/updateRideStatus",(req,res)=>{
    res.send("Ride Status")
})
router.delete("/ride",(req,res)=>{
    res.send("Ride Cancelled")
})
router.get("/signup",(req,res)=>{
    res.send("Signup page")
})
    

export default router;