const mysql = require("mysql2");

require("dotenv").config();

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    ca:process.env.CA_PATH
  }
});

db.connect((err) => {
  if (err) {
    console.error("❌ TiDB connection failed:", err);
    throw err;
  }
  console.log("✅ TiDB Cloud connected!");
});

module.exports = db;