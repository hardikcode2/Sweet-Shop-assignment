import "dotenv/config";
import { initDb } from "../db/init";
import { seedSweets } from "../db/seed";
import { pool } from "../db";

async function runSeed() {
  try {
    console.log("Initializing database...");
    await initDb();
    
    console.log("Seeding data...");
    await seedSweets();
    
    console.log("Seed completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runSeed();
