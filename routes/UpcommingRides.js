import express from 'express';
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';
import { v4 as isUuid } from 'uuid';

const router = express.Router();
const secretKey = process.env.JWT_SECRET || 'your_secret_key';

router.use(bodyParser.json());

// In-memory data stores (REPLACE WITH A DATABASE)
const rides = [];

const authenticateToken = (req, res, next) => {
    next();

};

router.get('/rides/upcoming', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const upcomingRides = rides.filter(ride => {
            return (ride.rider === userId || ride.driver === userId) &&
                   (ride.status === 'requested' || ride.status === 'accepted' || ride.status === 'in_progress');
        });

        res.json(upcomingRides);
    } catch (error) {
        console.error("Error getting upcoming rides:", error);
        res.status(500).json({ message: 'An error occurred while getting upcoming rides' });
    }
});

router.get('/rides/:id', authenticateToken, (req, res) => {
    try {
        const rideId = req.params.id;
        if(!isUuid(rideId)){
            return res.status(400).json({message: "Invalid ride id provided"});
        }
        const ride = rides.find(r => r.id === rideId && (r.rider === req.user.id || r.driver === req.user.id));
        if (!ride) {
            return res.status(404).json({ message: 'Ride not found' });
        }
        res.json(ride);
    } catch (error) {
        console.error("Error getting ride:", error);
        res.status(500).json({ message: 'An error occurred while getting the ride' });
    }
});

export default router;