import express from 'express';
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';
import { v4 as Uuid } from 'uuid';

const router = express.Router();
const secretKey = process.env.JWT_SECRET || 'your_secret_key';

router.use(bodyParser.json());

// In-memory data stores (REPLACE WITH A DATABASE)
const rides = [];

const authenticateToken = (req, res, next) => {
    next();
    // ... (Your existing authentication middleware)
};

// ... (Your other routes)

// Cancel a ride
router.put('/rides/:id/cancel', authenticateToken, async (req, res) => {
    try {
        const rideId = req.params.id;
        if(!isUuid(rideId)){
            return res.status(400).json({message: "Invalid ride id provided"});
        }

        const rideIndex = rides.findIndex(r => r.id === rideId);
        if (rideIndex === -1) {
            return res.status(404).json({ message: 'Ride not found' });
        }

        const ride = rides[rideIndex];

        if (ride.rider !== req.user.id) { // Only the rider can cancel
            return res.status(403).json({ message: 'You are not authorized to cancel this ride' });
        }

        if (ride.status === 'completed') {
            return res.status(400).json({ message: 'Cannot cancel a completed ride' });
        } else if (ride.status === 'cancelled') {
            return res.status(400).json({ message: 'Ride is already cancelled' });
        }

        ride.status = 'cancelled';
        ride.isCompleted = false; // Important to set isCompleted to false if it was true before
        ride.endTime = null;

        res.json({ message: 'Ride cancelled successfully', ride });
    } catch (error) {
        console.error("Error cancelling ride:", error);
        res.status(500).json({ message: 'An error occurred while cancelling the ride' });
    }
});

export default router;