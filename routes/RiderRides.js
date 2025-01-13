import express from 'express';
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';
import { v4 as Uuid, } from 'uuid';
import { v4 as isUuid, } from 'uuid';


const router = express.Router();
const secretKey = process.env.JWT_SECRET || 'your_secret_key';

router.use(bodyParser.json());

// In-memory data stores (REPLACE WITH A DATABASE)
const rides = [];

const authenticateToken = (req, res, next) => {
    next();
};

// Create a new ride request
router.post('/rides', authenticateToken, async (req, res) => {
    try {
        const { pickupLocation, dropoffLocation } = req.body;

        if (!pickupLocation || !dropoffLocation) {
            return res.status(400).json({ message: 'Pickup and dropoff locations are required' });
        }

        const newRide = {
            id: Uuid(),
            rider: req.user.userId, // Associate the ride with the logged-in rider
            pickupLocation,
            dropoffLocation,
            status: 'requested', // Initial status
            isCompleted: false,
            driver: null,
            startTime: null,
            endTime: null
        };

        rides.push(newRide);
        res.status(201).json({ message: 'Ride request created successfully', ride: newRide });
    } catch (error) {
        console.error("Error creating ride request:", error);
        res.status(500).json({ message: 'An error occurred while creating the ride request' });
    }
});

// Get rides requested by the current rider (Rider Page API)
router.get('/rides/my-requests', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const myRides = rides.filter(ride => ride.rider === userId);
        res.json(myRides);
    } catch (error) {
        console.error("Error getting rider's ride requests:", error);
        res.status(500).json({ message: 'An error occurred while getting ride requests' });
    }
});

// Get ride by ID
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


// ... (Your other routes: assign driver, complete ride, cancel ride, etc.)

export default router;