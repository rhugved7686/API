import express from 'express';
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';
import { v4 as uuid } from 'uuid';

const router = express.Router();
const secretKey = process.env.JWT_SECRET || 'your_secret_key';

router.use(bodyParser.json());

// In-memory data stores (REPLACE WITH A DATABASE)
const rides = [];

const authenticateToken = (req, res, next) => {
    next();
    // ... (Your existing authentication middleware)
};

// ... (Your other routes: create ride, assign driver, etc.)

// Update ride completion status
router.put('/rides/:id/complete', authenticateToken, async (req, res) => {
    try {
        const rideId = req.params.id;
        if(!uuid(rideId)){
            return res.status(400).json({message: "Invalid ride id provided"});
        }
        const { isCompleted } = req.body; // Expecting a boolean value

        if (typeof isCompleted !== 'boolean') {
            return res.status(400).json({ message: 'isCompleted must be a boolean value (true or false)' });
        }

        const rideIndex = rides.findIndex(r => r.id === rideId);
        if (rideIndex === -1) {
            return res.status(404).json({ message: 'Ride not found' });
        }

        const ride = rides[rideIndex];
        if (ride.rider !== req.user.id && ride.driver !== req.user.id) {
            return res.status(403).json({message: "You are not authorized to change this ride's status"});
        }

        if (ride.status === 'completed' && isCompleted){
            return res.status(400).json({message: "Ride is already completed"});
        } else if (ride.status !== 'in_progress' && isCompleted){
            return res.status(400).json({message: "Ride should be in progress before completing it"});
        }

        ride.isCompleted = isCompleted;
        if(isCompleted){
            ride.status = "completed";
            ride.endTime = new Date();
        } else {
            ride.status = "in_progress";
            ride.endTime = null;
        }

        res.json({ message: `Ride completion status updated to ${isCompleted}`, ride });
    } catch (error) {
        console.error("Error updating ride completion status:", error);
        res.status(500).json({ message: 'An error occurred while updating the completion status' });
    }
});

export default router;