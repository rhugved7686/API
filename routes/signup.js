import express from 'express';
import bodyParser from 'body-parser';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();
const secretKey = process.env.JWT_SECRET || 'your_secret_key';

router.use(bodyParser.json());

// In-memory user storage (REPLACE WITH A DATABASE)
const users = [];

router.post('/', async (req, res) => {
    try {
        const { name, empid, email, phone, gender, password, pickupLat, pickupLong, pickupAddress, dropLat, dropLong, dropAddress } = req.body;

        // Basic input validation (expand as needed)
        if (!name || !empid || !email || !phone || !gender || !password || !pickupLat || !pickupLong || !pickupAddress || !dropLat || !dropLong || !dropAddress) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        if (typeof pickupLat !== 'number' || typeof pickupLong !== 'number' || typeof dropLat !== 'number' || typeof dropLong !== 'number') {
            return res.status(400).json({ message: 'Latitude and longitude must be numbers' });
        }
        const userExists = users.some(user => user.empid === empid || user.email === email);
        if (userExists) {
            return res.status(409).json({ message: "User with this email or employee id already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = {
            id: uuidv4(),
            name,
            empid,
            email,
            phone,
            gender,
            password: hashedPassword,
            pickupLocation: {
                latitude: pickupLat,
                longitude: pickupLong,
                address: pickupAddress
            },
            dropoffLocation: {
                latitude: dropLat,
                longitude: dropLong,
                address: dropAddress
            }
        };

        users.push(newUser);

        // Generate JWT after successful signup
        const token = jwt.sign({ userId: newUser.id, email: newUser.email, username: newUser.name }, secretKey);

        res.status(201).json({ message: 'User created successfully', token }); // Return token in response
    } catch (error) {
        console.error("Error during signup:", error);
        res.status(500).json({ message: 'An error occurred during signup' });
    }
});

// ... (rest of your routes: login, profile, etc.)

export default router;