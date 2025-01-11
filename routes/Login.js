import express from 'express';
const router=express.Router();
   
router.post("/", (req, res) => {
    const { username, password } = req.body;


    const validUser = {
        username: "user1",
        password: "password1"
    };

    
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required." });
    }

    
    if (username === validUser.username && password === validUser.password) {
        return res.status(200).json({
            message: "Login successful",
            token: "your_jwt_token_here" 
        });
    } else {
        return res.status(401).json({ message: "Invalid username or password." });
    }
});

export default router;