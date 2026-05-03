const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();


app.use(cors());


app.use(express.json());


const authRoutes = require("./routes/auth");
const projectRoutes = require("./routes/projects");
const taskRoutes = require("./routes/tasks");
const userRoutes = require("./routes/users");


app.use("/auth", authRoutes);
app.use("/projects", projectRoutes);
app.use("/tasks", taskRoutes);
app.use("/users", userRoutes);


app.get("/", (req, res) => {
  res.json({ message: "Task Manager API is running!" });
});


const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
console.log(`Server running on http://localhost:${PORT}`);
});
