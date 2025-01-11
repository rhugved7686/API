import express from 'express';
import bodyParser from 'body-parser';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid'; // Correct import

const router = express.Router();
const secretKey = process.env.JWT_SECRET || 'your_secret_key'; // Store secret in env vars in production

router.use(bodyParser.json());

// In-memory data stores (REPLACE WITH A DATABASE)
const users = [];
const rides = [];

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.sendStatus(401);

    jwt.verify(token, secretKey, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};
router.get('/', authenticateToken, async (req, res) => {
    try {
        // Access user ID from the decoded JWT in req.user
        const userId = req.user.userId;

        // Fetch user details from the database using the ID
        const user = await User.findById(userId); // Replace User.findById with your database query

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Create a safe profile object (exclude password)
        const profile = {
            id: user._id, // Or user.id depending on your DB
            name: user.name,
            empid: user.empid,
            email: user.email,
            phone: user.phone,
            gender: user.gender,
            pickupLocation: user.pickupLocation,
            dropoffLocation: user.dropoffLocation
        };

        res.json(profile);
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ message: 'Error fetching profile' });
    }
});


router.post('/', async (req, res) => {
    const { username, password, email } = req.body;
    if (!username || !password || !email) {
        return res.status(400).json({ message: 'Please provide all required fields' });
    }
    const userExists = users.some(user => user.username === username);
    if (userExists) {
        return res.status(409).json({ message: "Username already exists" });
    }
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        users.push({ username, password: hashedPassword, email, id: uuidv4() });
        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        console.error("Error during signup", error);
        res.status(500).json({ message: 'An error occurred during signup' });
    }
});

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Please provide username and password' });
    }
    const user = users.find(user => user.username === username);
    if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }
    try {
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (passwordMatch) {
            const token = jwt.sign({ username: user.username, id: user.id, email: user.email }, secretKey);
            res.status(200).json({ message: 'Login successful', token: token });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ message: 'An error occurred during login' });
    }
});

router.post('/rides', authenticateToken, (req, res) => {
    try {
        const { pickupLocation, dropoffLocation } = req.body;
        if (!pickupLocation || !dropoffLocation) {
            return res.status(400).json({ message: 'Please provide pickup and dropoff locations' });
        }

        const newRide = {
            id: uuidv4(),
            rider: req.user.id,
            driver: null,
            pickupLocation,
            dropoffLocation,
            status: 'requested',
            requestTime: new Date(),
            startTime: null,
            endTime: null
        };

        rides.push(newRide);
        res.status(201).json(newRide);
    }
    catch (error) {
        console.error("Error creating ride:", error);
        res.status(500).json({ message: 'An error occurred while creating the ride' });
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

router.put('/rides/:id/status', authenticateToken, (req, res) => {
    try {
        const rideId = req.params.id;
        if(!isUuid(rideId)){
            return res.status(400).json({message: "Invalid ride id provided"});
        }
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({ message: 'Please provide a status' });
        }

        const validStatuses = ['requested', 'accepted', 'in_progress', 'completed', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status provided' });
        }

        const rideIndex = rides.findIndex(r => r.id === rideId);
        if (rideIndex === -1) {
            return res.status(404).json({ message: 'Ride not found' });
        }

        const ride = rides[rideIndex];

        if (status === "accepted") {
            if (ride.driver) {
                return res.status(400).json({ message: "Ride is already accepted by a driver" });
            }
            ride.driver = req.user.id;
            ride.status = status;
        }
        else if (ride.rider !== req.user.id && ride.driver !== req.user.id) {
            return res.status(403).json({ message: "You are not authorized to change this ride's status" });
        } else if (status === "in_progress" && ride.status !== "accepted") {
            return res.status(400).json({ message: "Ride can only be started if it's accepted" });
        } else if (status === "completed" && ride.status !== "in_progress") {
            return res.status(400).json({ message: "Ride can only be completed if it's in progress" });
        } else if (status === "cancelled" && ride.status === "completed") {
            return res.status(400).json({ message: "Ride is already completed and cannot be cancelled" });
        }
        else if (status === "in_progress") {
            ride.startTime = new Date();
            ride.status = status;
        } else if (status === "completed") {
            ride.endTime = new Date();
            ride.status = status;
        } else if (status === "cancelled") {
            ride.status = status;
        }

        res.json({ message: 'Ride status updated successfully', ride });
    } catch (error) {
        console.error("Error updating ride status:", error);
        res.status(500).json({ message: 'An error occurred while updating the status' });
    }
});

export default router;