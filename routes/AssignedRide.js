
import express from 'express';
import Ride from './models/Ride.js';
const router = express.Router();



router.post('/assign', async (req, res) => {
    const { driverName, riderName, pickupLocation, dropoffLocation, fare } = req.body;

    if (!driverName || !riderName || !pickupLocation || !dropoffLocation || !fare) {
        return res.status(400).json({ error: 'Please fill all the required fields' });
    }

    try {
        const newRide = new Ride({
            driverName,
            riderName,
            pickupLocation,
            dropoffLocation,
            fare,
        });

        const savedRide = await newRide.save();
        res.status(201).json({ message: 'Ride assigned successfully', ride: savedRide });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to assign ride' });
    }
});


router.get('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const ride = await Ride.findById(id);

        if (!ride) {
            return res.status(404).json({ error: 'Ride not found' });
        }

        res.status(200).json({ ride });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to retrieve ride details' });
    }
});


router.put('/:id/status', async (req, res) => {
    const { id } = req.params;
    const { rideStatus } = req.body;

    if (!rideStatus || !['Pending', 'In Progress', 'Completed'].includes(rideStatus)) {
        return res.status(400).json({ error: 'Invalid ride status' });
    }

    try {
        const updatedRide = await Ride.findByIdAndUpdate(
            id,
            { rideStatus },
            { new: true } // Return the updated document
        );

        if (!updatedRide) {
            return res.status(404).json({ error: 'Ride not found' });
        }

        res.status(200).json({ message: 'Ride status updated', ride: updatedRide });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update ride status' });
    }
});

// Delete a ride
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const deletedRide = await Ride.findByIdAndDelete(id);

        if (!deletedRide) {
            return res.status(404).json({ error: 'Ride not found' });
        }

        res.status(200).json({ message: 'Ride deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete ride' });
    }
});

export default router;
