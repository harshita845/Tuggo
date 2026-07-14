import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
    const db = mongoose.connection.db;
    const result = await db.collection('food_restaurants').updateOne(
        { restaurantName: 'Bombay Brasserie' },
        { 
            $set: { 
                "location.city": "Indore",
                "location.area": "Indore",
                "location.formattedAddress": "Indore, Madhya Pradesh, India"
            } 
        }
    );
    console.log("Matched:", result.matchedCount, "Modified:", result.modifiedCount);
    process.exit(0);
}).catch(console.error);
