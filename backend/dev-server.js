// Development server with in-memory MongoDB
// Usage: node dev-server.js

const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const seedData = require('./seed');

async function startDevServer() {
  console.log('🔧 Starting development server with in-memory MongoDB...\n');

  const mongod = await MongoMemoryServer.create();
  const mongoUri = mongod.getUri();
  process.env.MONGO_URI = mongoUri;

  console.log('✅ In-memory MongoDB started');
  console.log(`📍 URI: ${mongoUri}\n`);

  // Connect and seed data
  await mongoose.connect(mongoUri);
  await seedData();
  await mongoose.disconnect();

  console.log('\n🚀 Starting Express server...\n');

  // Start the actual server (server.js will connect to the same URI)
  require('./server');

  // Graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n\n🛑 Shutting down...');
    await mongod.stop();
    console.log('✅ In-memory MongoDB stopped');
    process.exit(0);
  });
}

startDevServer().catch((err) => {
  console.error('❌ Failed to start dev server:', err.message);
  process.exit(1);
});
