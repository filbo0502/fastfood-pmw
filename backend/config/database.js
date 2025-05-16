import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

if(!process.env.MONGO_URI){
    console.error("Error: MONGO_URI not found");
}

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB is connected");
    } catch (err) {
        console.error("Error", err);
        process.exit(1);
    }
};

export default connectDB;