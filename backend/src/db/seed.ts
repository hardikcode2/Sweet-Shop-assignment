import { pool } from "../db";

const sampleSweets = [
  { name: "Gulab Jamun", category: "Traditional", price: 25.00, quantity: 50 },
  { name: "Rasgulla", category: "Traditional", price: 20.00, quantity: 40 },
  { name: "Jalebi", category: "Traditional", price: 30.00, quantity: 35 },
  { name: "Kaju Katli", category: "Dry", price: 500.00, quantity: 20 },
  { name: "Barfi", category: "Milk", price: 350.00, quantity: 30 },
  { name: "Ladoo", category: "Traditional", price: 200.00, quantity: 45 },
  { name: "Rasmalai", category: "Milk", price: 400.00, quantity: 25 },
  { name: "Peda", category: "Milk", price: 300.00, quantity: 30 },
  { name: "Soan Papdi", category: "Dry", price: 250.00, quantity: 40 },
  { name: "Halwa", category: "Traditional", price: 150.00, quantity: 35 },
  { name: "Chocolate Barfi", category: "Milk", price: 400.00, quantity: 28 },
  { name: "Besan Ladoo", category: "Traditional", price: 180.00, quantity: 42 },
  { name: "Kalakand", category: "Milk", price: 320.00, quantity: 22 },
  { name: "Gajar Halwa", category: "Traditional", price: 280.00, quantity: 30 },
  { name: "Badam Halwa", category: "Dry", price: 450.00, quantity: 18 },
  { name: "Mysore Pak", category: "Dry", price: 380.00, quantity: 25 },
  { name: "Kheer", category: "Milk", price: 120.00, quantity: 15 },
  { name: "Sandesh", category: "Milk", price: 280.00, quantity: 32 },
  { name: "Modak", category: "Traditional", price: 35.00, quantity: 50 },
  { name: "Puran Poli", category: "Traditional", price: 40.00, quantity: 38 },
];

export async function seedSweets() {
  try {
    // Check if sweets already exist
    const existingSweets = await pool.query("SELECT COUNT(*) FROM sweets");
    if (parseInt(existingSweets.rows[0].count) > 0) {
      console.log("Sweets already exist, skipping seed");
      return;
    }

    console.log("Seeding sweets data...");
    
    for (const sweet of sampleSweets) {
      await pool.query(
        `INSERT INTO sweets (name, category, price, quantity)
         VALUES ($1, $2, $3, $4)`,
        [sweet.name, sweet.category, sweet.price, sweet.quantity]
      );
    }

    console.log(`Successfully seeded ${sampleSweets.length} sweets`);
  } catch (error) {
    console.error("Error seeding sweets:", error);
    throw error;
  }
}
