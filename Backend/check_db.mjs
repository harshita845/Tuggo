import dotenv from 'dotenv';
import mongoose from 'mongoose';
import dns from "node:dns/promises";

dns.setServers(["8.8.8.8", "1.1.1.1"]);
dotenv.config();

const uri = process.env.MONGODB_URI;

async function checkCollections() {
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 15000 });
    
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log('Collections:', collections.map(c => c.name));

    for (let c of collections) {
      if (c.name.includes('restaurant')) {
        const count = await db.collection(c.name).countDocuments();
        console.log(`Collection ${c.name} has ${count} documents`);
      }
    }
    process.exit(0);
  } catch (err) {
    console.error('Failed:', err.message);
    process.exit(1);
  }
}

checkCollections();
