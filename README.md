# 📋 Team Task Manager

A full-stack web application for managing team projects and tasks. Admins can create projects, add members, and assign tasks. Members can view and update their assigned tasks in real time.

🔗 **Live Demo:** [your-frontend.onrender.com](https://your-frontend.onrender.com)  
🔗 **Backend API:** [your-backend.onrender.com](https://your-backend.onrender.com)

---

## 🚀 Features

- 🔐 JWT-based authentication with role-based access (Admin / Member)
- 📁 Create and manage multiple projects
- ✅ Create tasks with title, description, priority, due date, and status
- 👥 Add members to projects and assign tasks to them
- 📊 Member dashboard showing personal task stats (Todo, In Progress, Done, Overdue)
- 🗑️ Soft delete — data is never permanently lost
- 📱 Responsive UI built with React

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, React Router v6 |
| Backend | Node.js, Express.js |
| Database | MySQL (TiDB Cloud) |
| Auth | JWT (JSON Web Tokens), bcryptjs |
| Deployment | Render (frontend + backend) |

---

## 📁 Project Structure

```
project/
├── backend/
│   ├── routes/
│   │   ├── auth.js        # Signup, Login
│   │   ├── projects.js    # Project CRUD + members
│   │   ├── tasks.js       # Task CRUD + stats
│   │   └── users.js       # User listing
│   ├── db.js              # MySQL connection
│   ├── middleware.js       # JWT auth middleware
│   ├── server.js          # Express app entry point
│   ├── database.sql       # Database schema
│   └── .env               # Environment variables
├── frontend/
│   ├── src/
│   │   ├── pages/         # React page components
│   │   ├── components/    # Reusable UI components
│   │   ├── api.js         # Axios API calls
│   │   └── App.js         # Routes and app entry
│   └── public/
│       └── _redirects     # Render routing fix
```

---

## ⚙️ Local Setup

### Prerequisites

- [Node.js](https://nodejs.org) v16+
- [MySQL](https://dev.mysql.com/downloads/installer/) (or use TiDB Cloud)
- [Git](https://git-scm.com)

---

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/team-task-manager.git
cd team-task-manager
```

---

### 2. Set up the database

Open MySQL and run:

```bash
mysql -u root -p < backend/database.sql
```

Or paste the contents of `backend/database.sql` directly into your MySQL client.

---

### 3. Configure backend environment

Create a `.env` file inside the `backend/` folder:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=task_manager
JWT_SECRET=yourRandomSecretKey123
```

---

### 4. Start the backend

```bash
cd backend
npm install
npm run dev
```

Backend runs at: `http://localhost:8000`

---

### 5. Configure frontend environment

Create a `.env` file inside the `frontend/` folder:

```env
REACT_APP_API_URL=http://localhost:8000
```

---

### 6. Start the frontend

```bash
cd frontend
npm install
npm start
```

Frontend runs at: `http://localhost:3000`

---

## 🌐 Deployment (Render)

### Backend — Web Service

| Setting | Value |
|---|---|
| Build Command | `npm install` |
| Start Command | `node server.js` |
| Environment Variables | Add all vars from `.env` in Render dashboard |

### Frontend — Static Site

| Setting | Value |
|---|---|
| Build Command | `npm install && npm run build` |
| Publish Directory | `build` |
| Environment Variable | `REACT_APP_API_URL` = your backend Render URL |

> After deploying, make sure `public/_redirects` contains `/*  /index.html  200` to fix React Router page refresh issues.

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/signup` | Register a new user |
| POST | `/auth/login` | Login and receive JWT token |

### Projects
| Method | Endpoint | Description |
|---|---|---|
| GET | `/projects` | Get all projects (role-based) |
| GET | `/projects/:id` | Get a single project |
| POST | `/projects` | Create a new project (Admin) |
| PUT | `/projects/:id` | Update a project (Admin) |
| DELETE | `/projects/:id` | Soft delete a project (Admin) |
| POST | `/projects/:id/members` | Add a member to a project |
| GET | `/projects/:id/members` | Get all members of a project |

### Tasks
| Method | Endpoint | Description |
|---|---|---|
| GET | `/tasks/project/:projectId` | Get all tasks in a project |
| GET | `/tasks/my-tasks` | Get tasks assigned to logged-in user |
| GET | `/tasks/my-owned-tasks` | Get all tasks in admin's projects |
| GET | `/tasks/stats` | Get task stats for logged-in user |
| POST | `/tasks` | Create a new task |
| PUT | `/tasks/:id` | Update a task |
| DELETE | `/tasks/:id` | Soft delete a task |

> All endpoints except `/auth/signup` and `/auth/login` require a Bearer token in the `Authorization` header.

---

## 🗄️ Database Schema

```sql
users         → id, name, email, password, role, is_active, created_at
projects      → id, name, description, owner_id, is_active, created_at
project_members → id, project_id, user_id, is_active
tasks         → id, title, description, status, priority, due_date,
                project_id, assigned_to, created_by, last_updated_by,
                is_active, created_at, updated_at
```

---

## 👤 Roles & Permissions

| Action | Admin | Member |
|---|---|---|
| Create / Delete projects | ✅ | ❌ |
| Add members to projects | ✅ | ❌ |
| Create / Assign tasks | ✅ | ❌ |
| View assigned tasks | ✅ | ✅ |
| Update task status | ✅ | ✅ |
| View personal task stats | ✅ | ✅ |

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 🙋‍♂️ Author

Built by **[Your Name]**  
GitHub: [@your-username](https://github.com/your-username)
