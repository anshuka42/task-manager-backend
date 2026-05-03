const express = require("express");
const router = express.Router();
const db = require("../db");
const { authMiddleware } = require("../middleware");


router.get("/", authMiddleware, (req, res) => {
  db.query("SELECT id, name, email, role FROM users", (err, results) => {
    if (err) return res.status(500).json({ message: "Database error" });
    res.json(results);
  });
});


router.get("/me", authMiddleware, (req, res) => {
  db.query(
    "SELECT id, name, email, role, created_at FROM users WHERE id = ?",
    [req.user.id],
    (err, results) => {
      if (err) return res.status(500).json({ message: "Database error" });
      if (results.length === 0) return res.status(404).json({ message: "User not found" });
      res.json(results[0]);
    }
  );
});

module.exports = router;
