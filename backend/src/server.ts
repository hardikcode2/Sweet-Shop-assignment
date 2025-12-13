import "dotenv/config";
import { createApp } from "./app";
import { initDb } from "./db/init";
import { seedSweets } from "./db/seed";

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

const app = createApp();
async function start() {
  await initDb();
  await seedSweets();
  app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
  });
}

start();

