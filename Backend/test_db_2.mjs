import { config } from 'dotenv';
config();
import('./src/config/db.js').then(async (db) => {
  await db.connectDB();
  const mongoose = await import('mongoose');
  const Zone = mongoose.model('FoodZone', new mongoose.Schema({}, {strict: false, collection: 'foodzones'}));
  const Restaurant = mongoose.model('Restaurant', new mongoose.Schema({}, {strict: false, collection: 'restaurants'}));
  
  const punjabRests = await Restaurant.find({ 
    $or: [
      { city: { $regex: /samana|punjab/i } },
      { 'location.city': { $regex: /samana|punjab/i } },
      { 'location.state': { $regex: /samana|punjab/i } },
      { state: { $regex: /samana|punjab/i } }
    ]
  });
  console.log('Punjab restaurants:', punjabRests.map(r => ({ id: r._id, name: r.restaurantName, city: r.city, state: r.state, status: r.status, isAcceptingOrders: r.isAcceptingOrders })));
  
  process.exit(0);
}).catch(console.error);
