/********************************************************************************
* WEB322 – Assignment 02
*
* I declare that this assignment is my own work in accordance with Seneca's
* Academic Integrity Policy:
* https://www.senecapolytechnic.ca/about/policies/academic-integrity-policy.html
*
* Name: Amina Mustak Dipoti    Student ID: 113299242  Date: 11-07-2025
* Published URL: https://web322-assignment2-ten.vercel.app/
********************************************************************************/
require("dotenv").config();
const express = require("express");
const clientSessions = require("client-sessions");
const app = express();

// Import all service functions
const {
  initialize,
  getAllProjects,
  getProjectById,
  getProjectsBySector,
  addProject,
  editProject,
  deleteProject
} = require("./data/projects-service");

// Middleware - sessions
app.use(
  clientSessions({
    cookieName: "session",
    secret: process.env.SESSIONSECRET,
    duration: 24 * 60 * 60 * 1000,
    activeDuration: 5 * 60 * 1000
  })
);

// Expose session to all EJS files
app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

// Middleware for POST forms
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Static + EJS
app.use(express.static("public"));
app.set("view engine", "ejs");

// Protect routes middleware
function ensureLogin(req, res, next) {
  if (!req.session.user) {
    return res.redirect("/login");
  }
  next();
}

// Home + About
app.get("/", (req, res) => res.render("home"));
app.get("/about", (req, res) => res.render("about"));

/* ============================================
   LOGIN / LOGOUT ROUTES
============================================ */

// GET login page
app.get("/login", (req, res) => {
  res.render("login", { errorMessage: "", userName: "" });
});

// POST login
app.post("/login", (req, res) => {
  const { userName, password } = req.body;

  if (
    userName === process.env.ADMINUSER &&
    password === process.env.ADMINPASSWORD
  ) {
    req.session.user = { userName: process.env.ADMINUSER };
    return res.redirect("/solutions/projects");
  }

  // Invalid credentials
  res.render("login", {
    errorMessage: "Invalid User Name or Password",
    userName: userName
  });
});

// GET logout
app.get("/logout", (req, res) => {
  req.session.reset();
  res.redirect("/");
});

/* ============================================
   PROJECT ROUTES
============================================ */

// ALL projects (with optional sector)
app.get("/solutions/projects", async (req, res) => {
  try {
    if (req.query.sector) {
      const projects = await getProjectsBySector(req.query.sector);
      return res.render("projects", { projects });
    }

    const projects = await getAllProjects();
    res.render("projects", { projects });
  } catch (err) {
    res
      .status(404)
      .render("404", { message: `No projects found: ${err}` });
  }
});

// Single project
app.get("/solutions/projects/:id", async (req, res) => {
  try {
    const project = await getProjectById(req.params.id);
    res.render("project", { project });
  } catch (err) {
    res.status(404).render("404", { message: err });
  }
});

/* ============================================
   EDIT PROJECT ROUTES
============================================ */

// GET Edit Project
app.get("/solutions/editProject/:id", ensureLogin, async (req, res) => {
  try {
    const project = await getProjectById(req.params.id);
    res.render("editProject", { project });
  } catch (err) {
    res.status(404).render("404", { message: err });
  }
});

// POST Edit Project
app.post("/solutions/editProject", ensureLogin, (req, res) => {
  editProject(req.body.id, req.body)
    .then(() => res.redirect("/solutions/projects"))
    .catch((err) => {
      res.render("500", {
        message: `I'm sorry, but we encountered the following error: ${err}`
      });
    });
});

/* ============================================
   DELETE PROJECT ROUTE
============================================ */

app.get("/solutions/deleteProject/:id", ensureLogin, (req, res) => {
  deleteProject(req.params.id)
    .then(() => res.redirect("/solutions/projects"))
    .catch((err) => {
      res.render("500", {
        message: `I'm sorry, but we encountered the following error: ${err}`
      });
    });
});

/* ============================================
   404 CATCH-ALL
============================================ */

app.use((req, res) =>
  res.status(404).render("404", {
    message: "I'm sorry, we're unable to find what you're looking for"
  })
);

/* ============================================
   START SERVER
============================================ */

initialize()
  .then(() => {
    const PORT = process.env.PORT || 8080;
    app.listen(PORT, () =>
      console.log(`Server running at http://localhost:${PORT}`)
    );
  })
  .catch((err) => console.error(err));