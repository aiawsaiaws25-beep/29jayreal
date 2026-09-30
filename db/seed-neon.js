import dotenv from 'dotenv';
import { initDb, seedDatabase, getDbStatus } from './neon.js';

dotenv.config();

async function runSeed() {
  console.log('====================================================');
  console.log('   JAY REAL ESTATE - NEON DATABASE SEED SCRIPT');
  console.log('====================================================');
  
  const status = getDbStatus();
  console.log('Database Status:', status);

  if (!process.env.DATABASE_URL || !process.env.DATABASE_URL.trim().startsWith('postgres')) {
    console.error('\n❌ ERROR: DATABASE_URL is not configured in .env file.');
    console.log('Please paste your Neon database connection string into the .env file:');
    console.log('DATABASE_URL=postgresql://[user]:[password]@[endpoint].neon.tech/[dbname]?sslmode=require\n');
    process.exit(1);
  }

  try {
    await initDb();
    await seedDatabase();
    console.log('\n✅ Database setup & seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Error seeding Neon database:', err.message);
    process.exit(1);
  }
}

runSeed();
