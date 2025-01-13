import express from 'express';
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';

const router = express.Router();
const secretKey = process.env.JWT_SECRET || 'your_secret_key';

router.use(bodyParser.json());

// In-memory data stores (REPLACE WITH A DATABASE)
const rides = [];

const authenticateToken = (req, res, next) => {
   next();
};


router.get('/rides/completed', authenticateToken, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1; // Get page number from query params (default 1)
        const limit = 10; // Number of rides per page
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;

        const completedRides = rides.filter(ride => ride.isCompleted === true);

        const paginatedRides = completedRides.slice(startIndex, endIndex);

        res.json({
            rides: paginatedRides,
            totalRides: completedRides.length,
            totalPages: Math.ceil(completedRides.length / limit),
            currentPage: page
        });
    } catch (error) {
        console.error("Error getting completed rides:", error);
        res.status(500).json({ message: 'An error occurred while getting completed rides' });
    }
});

//Get completed rides for a specific user with pagination
router.get('/rides/completed/:userId', authenticateToken, async (req, res) => {
    try {
        const userId = req.params.userId;
        const page = parseInt(req.query.page) || 1; // Get page number from query params (default 1)
        const limit = 10; // Number of rides per page
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;

        const completedRides = rides.filter(ride => ride.isCompleted === true && (ride.rider === userId || ride.driver === userId));
        const paginatedRides = completedRides.slice(startIndex, endIndex);

        res.json({
            rides: paginatedRides,
            totalRides: completedRides.length,
            totalPages: Math.ceil(completedRides.length / limit),
            currentPage: page
        });
    } catch (error) {
        console.error("Error getting completed rides:", error);
        res.status(500).json({ message: 'An error occurred while getting completed rides' });
    }
});

export default router;