import mongoose from 'mongoose';

// Define the schema for the Ride model
const rideSchema = new mongoose.Schema({
    driverName: {
        type: String,
        required: true,
    },
    riderName: {
        type: String,
        required: true,
    },
    pickupLocation: {
        type: String,
        required: true,
    },
    dropoffLocation: {
        type: String,
        required: true,
    },
    fare: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'ongoing', 'completed', 'cancelled'],
        default: 'pending',
    },
}, { timestamps: true });


const Ride = mongoose.model('Ride', rideSchema);


export default Ride;
