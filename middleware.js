const jwt = require("jsonwebtoken");
require("dotenv").config();


function authMiddleware(req, res, next) {
  
  const token = req.headers["authorization"];

  if (!token) {
    return res.status(401).json({ message: "No token, please login first" });
  }

  try {
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret123");
    req.user = decoded; 
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token, please login again" });
  }
}


function adminOnly(req, res, next) {
  if (req.user.role !== "Admin") {
    return res.status(403).json({ message: "Only Admins can do this action" });
  }
  next();
}

module.exports = { authMiddleware, adminOnly };
