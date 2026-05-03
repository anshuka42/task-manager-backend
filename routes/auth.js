const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db");
require("dotenv").config();


function isValidEmail(email) {
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}


function checkPasswordStrength(password) {
  if (password.length < 6) {
    return "Password must be at least 6 characters";
  }
  if (!/[A-Z]/.test(password)) {
    return "Password must have at least one uppercase letter (A-Z)";
  }
  if (!/[0-9]/.test(password)) {
    return "Password must have at least one number (0-9)";
  }
  return null; 
}


router.post("/signup", (req, res) => {
  const { name, email, password, role } = req.body;

  
  if (!name || !email || !password) {
    return res.status(400).json({ message: "Please fill all fields" });
  }

  
  if (!isValidEmail(email)) {
    return res.status(400).json({ message: "Please enter a valid email (example@gmail.com)" });
  }

  
  const passwordError = checkPasswordStrength(password);
  if (passwordError) {
    return res.status(400).json({ message: passwordError });
  }

  
  db.query("SELECT * FROM users WHERE email = ? AND is_active = 1", [email], (err, results) => {
    if (err) return res.status(500).json({ message: "Database error" });

    if (results.length > 0) {
      return res.status(400).json({ message: "This email is already registered" });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const userRole = role === "Admin" ? "Admin" : "Member";

    db.query(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
      [name, email, hashedPassword, userRole],
      (err, result) => {
        if (err) return res.status(500).json({ message: "Could not create account" });
        res.status(201).json({ message: "Account created successfully!" });
      }
    );
  });
});


router.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Please enter email and password" });
  }

  
  if (!isValidEmail(email)) {
    return res.status(400).json({ message: "Please enter a valid email format" });
  }

  
  db.query("SELECT * FROM users WHERE email = ? AND is_active = 1", [email], (err, results) => {
    if (err) return res.status(500).json({ message: "Database error" });

    if (results.length === 0) {
      return res.status(400).json({ message: "Email not found" });
    }

    const user = results[0];
    const isMatch = bcrypt.compareSync(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Wrong password" });
    }

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      process.env.JWT_SECRET || "secret123",
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token: token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  });
});

module.exports = router;
