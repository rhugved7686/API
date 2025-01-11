import express from 'express';
import jwt from 'jsonwebtoken';
// Import your database connection/model here
// Example: import User from '../models/User';

const router = express.Router();
const secretKey = process.env.JWT_SECRET || 'your_secret_key';

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'No token provided' });

  jwt.verify(token, secretKey, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user; // Make user information available in req.user
    next();
  });
};

router.get('/', authenticateToken, async (req, res) => {
  try {
    //Important Step Fetch user by id
    const user = await User.findById(req.user.userId); // req.user.userId comes from the JWT

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Create a safe profile object (excluding password or sensitive data)
    const profile = {
      id: user._id, // If using MongoDB _id
      name: user.name,
      empid: user.empid,
      email: user.email,
      phone: user.phone,
      gender: user.gender,
      pickupLocation: user.pickupLocation,
      dropoffLocation: user.dropoffLocation,
      // ...other non-sensitive fields
    };
    res.json(profile);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Error fetching profile' });
  }
});

export default router;