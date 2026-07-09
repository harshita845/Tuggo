import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

// Define schemas locally or import them to avoid path issues
const coordinateSchema = new mongoose.Schema(
    {
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true }
    },
    { _id: false }
);

const zoneSchema = new mongoose.Schema({
    name: { type: String, required: true },
    country: { type: String, default: 'India' },
    coordinates: { type: [coordinateSchema], required: true },
    isActive: { type: Boolean, default: true }
}, { collection: 'food_zones' });

const geoPointSchema = new mongoose.Schema({
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: { type: [Number], default: undefined },
    latitude: { type: Number },
    longitude: { type: Number },
}, { _id: false });

const restaurantSchema = new mongoose.Schema({
    restaurantName: { type: String, required: true },
    ownerName: { type: String, required: true },
    ownerPhone: { type: String, required: true },
    city: { type: String, default: 'Indore' },
    pureVegRestaurant: { type: Boolean, default: false },
    zoneId: { type: mongoose.Schema.Types.ObjectId, ref: 'FoodZone' },
    status: { type: String, default: 'approved' },
    location: geoPointSchema
}, { collection: 'food_restaurants', strict: false });

const deliveryPartnerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    city: { type: String, default: 'Indore' },
    status: { type: String, default: 'approved' },
    availabilityStatus: { type: String, default: 'online' }
}, { collection: 'food_delivery_partners', strict: false });

const Zone = mongoose.models.FoodZone || mongoose.model('FoodZone', zoneSchema);
const Restaurant = mongoose.models.FoodRestaurant || mongoose.model('FoodRestaurant', restaurantSchema);
const DeliveryPartner = mongoose.models.FoodDeliveryPartner || mongoose.model('FoodDeliveryPartner', deliveryPartnerSchema);

async function run() {
    try {
        const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/Tuggo';
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to DB');

        // 1. Create Zone
        let zone = await Zone.findOne({ name: 'Indore Zone' });
        if (!zone) {
            zone = new Zone({
                name: 'Indore Zone',
                coordinates: [
                    { latitude: 22.7, longitude: 75.8 },
                    { latitude: 22.8, longitude: 75.8 },
                    { latitude: 22.8, longitude: 75.9 },
                    { latitude: 22.7, longitude: 75.9 }
                ]
            });
            await zone.save();
            console.log('Created Indore Zone');
        } else {
            console.log('Indore Zone already exists');
        }

        // 2. Create 2 Restaurants
        const rest1Phone = '9876543210';
        let rest1 = await Restaurant.findOne({ ownerPhone: rest1Phone });
        if (!rest1) {
            rest1 = new Restaurant({
                restaurantName: 'Indore Special Poha',
                ownerName: 'Rahul Verma',
                ownerPhone: rest1Phone,
                city: 'Indore',
                pureVegRestaurant: true,
                zoneId: zone._id,
                status: 'approved',
                location: {
                    type: 'Point',
                    coordinates: [75.8577, 22.7196],
                    latitude: 22.7196,
                    longitude: 75.8577
                }
            });
            await rest1.save();
            console.log('Created Restaurant 1: Indore Special Poha');
        } else {
            console.log('Restaurant 1 already exists');
        }

        const rest2Phone = '9876543211';
        let rest2 = await Restaurant.findOne({ ownerPhone: rest2Phone });
        if (!rest2) {
            rest2 = new Restaurant({
                restaurantName: 'Sarafa Night Sweets',
                ownerName: 'Amit Sharma',
                ownerPhone: rest2Phone,
                city: 'Indore',
                pureVegRestaurant: true,
                zoneId: zone._id,
                status: 'approved',
                location: {
                    type: 'Point',
                    coordinates: [75.8580, 22.7200],
                    latitude: 22.7200,
                    longitude: 75.8580
                }
            });
            await rest2.save();
            console.log('Created Restaurant 2: Sarafa Night Sweets');
        } else {
            console.log('Restaurant 2 already exists');
        }

        // 3. Create Delivery Partner
        const dpPhone = '9988776655';
        let dp = await DeliveryPartner.findOne({ phone: dpPhone });
        if (!dp) {
            dp = new DeliveryPartner({
                name: 'Raju Rider',
                phone: dpPhone,
                city: 'Indore',
                status: 'approved',
                availabilityStatus: 'online',
                vehicleType: 'bike',
                vehicleNumber: 'MP09 AB 1234'
            });
            await dp.save();
            console.log('Created Delivery Partner: Raju Rider');
        } else {
            console.log('Delivery Partner already exists');
        }

        console.log('Done!');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

run();
