const express = require("express");
const router = express.Router();
const db = require("../db");
const { authMiddleware } = require("../middleware");


router.get("/project/:projectId", authMiddleware, (req, res) => {
  const projectId = req.params.projectId;

  db.query(
    `SELECT tasks.*, 
      assignee.name as assigned_to_name,
      creator.name as created_by_name,
      updater.name as last_updated_by_name
     FROM tasks 
     LEFT JOIN users as assignee ON tasks.assigned_to = assignee.id
     LEFT JOIN users as creator ON tasks.created_by = creator.id
     LEFT JOIN users as updater ON tasks.last_updated_by = updater.id
     WHERE tasks.project_id = ? AND tasks.is_active = 1
     ORDER BY tasks.updated_at DESC`,
    [projectId],
    (err, results) => {
      if (err) return res.status(500).json({ message: "Database error" });
      res.json(results);
    }
  );
});


router.get("/my-owned-tasks", authMiddleware, (req, res) => {
  const userId = req.user.id;

  db.query(
    `SELECT tasks.*, 
      projects.name as project_name,
      assignee.name as assigned_to_name,
      creator.name as created_by_name,
      updater.name as last_updated_by_name
     FROM tasks 
     JOIN projects ON tasks.project_id = projects.id
     LEFT JOIN users as assignee ON tasks.assigned_to = assignee.id
     LEFT JOIN users as creator ON tasks.created_by = creator.id
     LEFT JOIN users as updater ON tasks.last_updated_by = updater.id
     WHERE projects.owner_id = ? AND tasks.is_active = 1 AND projects.is_active = 1
     ORDER BY projects.name ASC, tasks.due_date ASC`,
    [userId],
    (err, results) => {
      if (err) return res.status(500).json({ message: "Database error" });
      res.json(results);
    }
  );
});


router.get("/my-tasks", authMiddleware, (req, res) => {
  const userId = req.user.id;

  db.query(
    `SELECT tasks.*, 
      projects.name as project_name,
      updater.name as last_updated_by_name
     FROM tasks 
     LEFT JOIN projects ON tasks.project_id = projects.id
     LEFT JOIN users as updater ON tasks.last_updated_by = updater.id
     WHERE tasks.assigned_to = ? AND tasks.is_active = 1 AND projects.is_active = 1
     ORDER BY tasks.due_date ASC`,
    [userId],
    (err, results) => {
      if (err) return res.status(500).json({ message: "Database error" });
      res.json(results);
    }
  );
});


router.get("/stats", authMiddleware, (req, res) => {
  const userId = req.user.id;

  db.query(
    `SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN status = 'Todo' THEN 1 ELSE 0 END) as todo,
      SUM(CASE WHEN status = 'In Progress' THEN 1 ELSE 0 END) as inprogress,
      SUM(CASE WHEN status = 'Done' THEN 1 ELSE 0 END) as done,
      SUM(CASE WHEN due_date < CURDATE() AND status != 'Done' THEN 1 ELSE 0 END) as overdue
     FROM tasks 
     WHERE assigned_to = ? AND is_active = 1`,
    [userId],
    (err, results) => {
      if (err) return res.status(500).json({ message: "Database error" });
      res.json(results[0]);
    }
  );
});


router.post("/", authMiddleware, (req, res) => {
  const { title, description, status, priority, due_date, project_id, assigned_to } = req.body;

  if (!title || !project_id) {
    return res.status(400).json({ message: "Title and project are required" });
  }

  
  db.query(
    "SELECT id FROM tasks WHERE title = ? AND project_id = ? AND is_active = 1",
    [title, project_id],
    (err, results) => {
      if (err) return res.status(500).json({ message: "Database error" });

      if (results.length > 0) {
        return res.status(400).json({ message: "A task with this name already exists in this project" });
      }

      db.query(
        `INSERT INTO tasks 
          (title, description, status, priority, due_date, project_id, assigned_to, created_by, last_updated_by) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          title,
          description,
          status || "Todo",
          priority || "Medium",
          due_date || null,
          project_id,
          assigned_to || null,
          req.user.id,
          req.user.id, 
        ],
        (err, result) => {
          if (err) return res.status(500).json({ message: "Could not create task" });
          res.status(201).json({ message: "Task created!", id: result.insertId });
        }
      );
    }
  );
});


router.put("/:id", authMiddleware, (req, res) => {
  const { title, description, status, priority, due_date, assigned_to } = req.body;
  const taskId = req.params.id;

  db.query(
    `UPDATE tasks 
     SET title = ?, description = ?, status = ?, priority = ?, 
         due_date = ?, assigned_to = ?, last_updated_by = ?
     WHERE id = ? AND is_active = 1`,
    [title, description, status, priority, due_date || null, assigned_to || null, req.user.id, taskId],
    (err, result) => {
      if (err) return res.status(500).json({ message: "Database error" });
      if (result.affectedRows === 0) return res.status(404).json({ message: "Task not found" });
      res.json({ message: "Task updated!" });
    }
  );
});


router.delete("/:id", authMiddleware, (req, res) => {
  const taskId = req.params.id;

  db.query(
    "UPDATE tasks SET is_active = 0, last_updated_by = ? WHERE id = ?",
    [req.user.id, taskId],
    (err, result) => {
      if (err) return res.status(500).json({ message: "Database error" });
      if (result.affectedRows === 0) return res.status(404).json({ message: "Task not found" });
      res.json({ message: "Task removed (data kept safely)" });
    }
  );
});

module.exports = router;