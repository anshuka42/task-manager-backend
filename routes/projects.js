const express = require("express");
const router = express.Router();
const db = require("../db");
const { authMiddleware } = require("../middleware");


router.get("/", authMiddleware, (req, res) => {
  const userId = req.user.id;

  let query;
  let params;

  if (req.user.role === "Admin") {
    
    query = `
      SELECT projects.*, users.name as owner_name 
      FROM projects 
      JOIN users ON projects.owner_id = users.id
      WHERE projects.is_active = 1
    `;
    params = [];
  } else {
    
    query = `
      SELECT projects.*, users.name as owner_name 
      FROM projects 
      JOIN users ON projects.owner_id = users.id
      JOIN project_members ON projects.id = project_members.project_id
      WHERE (project_members.user_id = ? OR projects.owner_id = ?)
        AND projects.is_active = 1
        AND project_members.is_active = 1
    `;
    params = [userId, userId];
  }

  db.query(query, params, (err, results) => {
    if (err) return res.status(500).json({ message: "Database error" });
    res.json(results);
  });
});


router.get("/:id", authMiddleware, (req, res) => {
  db.query(
    `SELECT projects.*, users.name as owner_name 
     FROM projects 
     JOIN users ON projects.owner_id = users.id 
     WHERE projects.id = ? AND projects.is_active = 1`,
    [req.params.id],
    (err, results) => {
      if (err) return res.status(500).json({ message: "Database error" });
      if (results.length === 0) return res.status(404).json({ message: "Project not found" });
      res.json(results[0]);
    }
  );
});


router.post("/", authMiddleware, (req, res) => {
  const { name, description } = req.body;
  const ownerId = req.user.id;

  if (!name) {
    return res.status(400).json({ message: "Project name is required" });
  }

  
  db.query(
    "SELECT id FROM projects WHERE name = ? AND owner_id = ? AND is_active = 1",
    [name, ownerId],
    (err, results) => {
      if (err) return res.status(500).json({ message: "Database error" });

      if (results.length > 0) {
        return res.status(400).json({ message: "You already have a project with this name" });
      }

      db.query(
        "INSERT INTO projects (name, description, owner_id) VALUES (?, ?, ?)",
        [name, description, ownerId],
        (err, result) => {
          if (err) return res.status(500).json({ message: "Could not create project" });

          
          db.query("INSERT INTO project_members (project_id, user_id) VALUES (?, ?)", [result.insertId, ownerId]);

          res.status(201).json({ message: "Project created!", id: result.insertId });
        }
      );
    }
  );
});


router.put("/:id", authMiddleware, (req, res) => {
  const { name, description } = req.body;
  const projectId = req.params.id;

  db.query(
    "UPDATE projects SET name = ?, description = ? WHERE id = ? AND owner_id = ? AND is_active = 1",
    [name, description, projectId, req.user.id],
    (err, result) => {
      if (err) return res.status(500).json({ message: "Database error" });
      if (result.affectedRows === 0) return res.status(403).json({ message: "Not allowed or project not found" });
      res.json({ message: "Project updated!" });
    }
  );
});


router.delete("/:id", authMiddleware, (req, res) => {
  const projectId = req.params.id;

  
  db.query(
    "UPDATE projects SET is_active = 0 WHERE id = ? AND owner_id = ?",
    [projectId, req.user.id],
    (err, result) => {
      if (err) return res.status(500).json({ message: "Database error" });
      if (result.affectedRows === 0) return res.status(403).json({ message: "Not allowed or project not found" });

      
      db.query("UPDATE tasks SET is_active = 0 WHERE project_id = ?", [projectId]);

      res.json({ message: "Project removed (data kept safely)" });
    }
  );
});


router.post("/:id/members", authMiddleware, (req, res) => {
  const { userId } = req.body;
  const projectId = req.params.id;

  
  db.query(
    "SELECT id, is_active FROM project_members WHERE project_id = ? AND user_id = ?",
    [projectId, userId],
    (err, results) => {
      if (err) return res.status(500).json({ message: "Database error" });

      if (results.length > 0) {
        if (results[0].is_active === 1) {
          return res.status(400).json({ message: "User is already a member" });
        }
        
        db.query(
          "UPDATE project_members SET is_active = 1 WHERE project_id = ? AND user_id = ?",
          [projectId, userId],
          (err) => {
            if (err) return res.status(500).json({ message: "Database error" });
            res.json({ message: "Member added back!" });
          }
        );
      } else {
        db.query(
          "INSERT INTO project_members (project_id, user_id) VALUES (?, ?)",
          [projectId, userId],
          (err) => {
            if (err) return res.status(500).json({ message: "Could not add member" });
            res.json({ message: "Member added!" });
          }
        );
      }
    }
  );
});


router.get("/:id/members", authMiddleware, (req, res) => {
  db.query(
    `SELECT users.id, users.name, users.email, users.role 
     FROM users 
     JOIN project_members ON users.id = project_members.user_id 
     WHERE project_members.project_id = ? 
       AND project_members.is_active = 1
       AND users.is_active = 1`,
    [req.params.id],
    (err, results) => {
      if (err) return res.status(500).json({ message: "Database error" });
      res.json(results);
    }
  );
});

module.exports = router;
