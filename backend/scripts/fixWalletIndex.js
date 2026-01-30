// Script to fix wallet index migration issue
// Run this with: node scripts/fixWalletIndex.js

require('dotenv').config();
const mongoose = require('mongoose');

async function fixWalletIndexes() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('wallets');

    // Get all indexes
    const indexes = await collection.indexes();
    console.log('\n📋 Current indexes:', indexes);

    // Drop the old 'user_1' index if it exists
    const hasOldUserIndex = indexes.some(idx => idx.name === 'user_1');
    
    if (hasOldUserIndex) {
      console.log('\n🗑️  Dropping old "user_1" index...');
      await collection.dropIndex('user_1');
      console.log('✅ Old index dropped');
    } else {
      console.log('\n✓ No old "user_1" index found');
    }

    // Delete any wallet documents with null userId
    console.log('\n🧹 Cleaning up wallets with null userId...');
    const deleteResult = await collection.deleteMany({ 
      $or: [
        { userId: null },
        { user: null },
        { userId: { $exists: false } },
        { user: { $exists: true } }
      ]
    });
    console.log(`✅ Deleted ${deleteResult.deletedCount} invalid wallet(s)`);

    // Ensure the correct userId index exists
    console.log('\n📝 Creating userId index...');
    await collection.createIndex({ userId: 1 }, { unique: true, sparse: false });
    console.log('✅ userId index created');

    // Verify final state
    const finalIndexes = await collection.indexes();
    console.log('\n✅ Final indexes:', finalIndexes);

    console.log('\n🎉 Migration complete! You can now create wallets.');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
    process.exit(0);
  }
}

fixWalletIndexes();
