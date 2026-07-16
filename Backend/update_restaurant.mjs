import dotenv from 'dotenv';
import mongoose from 'mongoose';
import dns from "node:dns/promises";

dns.setServers(["8.8.8.8", "1.1.1.1"]);
dotenv.config();

const uri = process.env.MONGODB_URI;

async function connectAndUpdate() {
  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 15000,
    });
    const Restaurant = mongoose.model('FoodRestaurant', new mongoose.Schema({}, {strict: false, collection: 'food_restaurants'}));
    
    // Find The Royal Maratha
    const royal = await Restaurant.findOne({ restaurantName: { $regex: /sarafa bites/i } });
    if (royal) {
        console.log(`Found ${royal.restaurantName}`);
        
        // Unset timings for this restaurant
        const result = await Restaurant.updateOne(
        { _id: royal._id },
        { 
            $set: { 
            isActive: true, 
            isAcceptingOrders: true 
            },
            $unset: {
            outletTimings: "",
            openingTime: "",
            closingTime: "",
            deliveryTimings: "",
            openDays: ""
            }
        }
        );
        console.log('Updated restaurant:', result);
    } else {
        console.log("Restaurant not found. Updating ALL restaurants to be active and have empty timings.");
        const result = await Restaurant.updateMany(
            {},
            { 
              $set: { 
                isActive: true, 
                isAcceptingOrders: true 
              },
              $unset: {
                outletTimings: "",
                openingTime: "",
                closingTime: "",
                deliveryTimings: "",
                openDays: ""
              }
            }
          );
          console.log('Updated restaurants:', result);
    }
    process.exit(0);
  } catch (err) {
    console.error('Connection failed:', err.message);
    process.exit(1);
  }
}

connectAndUpdate();
