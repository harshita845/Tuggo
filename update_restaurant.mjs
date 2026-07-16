import dotenv from 'dotenv';
dotenv.config({ path: './Backend/.env' });

import('./Backend/src/config/db.js').then(async (db) => {
  await db.connectDB();
  const mongoose = await import('mongoose');
  const Restaurant = mongoose.model('Restaurant', new mongoose.Schema({}, {strict: false, collection: 'restaurants'}));
  
  const result = await Restaurant.updateMany(
    { restaurantName: "The Royal Maratha" },
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
  
  process.exit(0);
}).catch(console.error);
