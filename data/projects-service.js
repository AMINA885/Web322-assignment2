const { Pool } = require('pg');

// Create a PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DB_CONNECTION,
});

// Initialize: Test DB connection
function initialize() {
  return new Promise((resolve, reject) => {
    pool.connect()
      .then(client => {
        client.release();
        resolve();
      })
      .catch(err => reject("Unable to connect to database: " + err));
  });
}

// Get ALL projects
function getAllProjects() {
  return pool
    .query("SELECT * FROM projects ORDER BY id ASC")
    .then(res => res.rows)
    .catch(() => { throw "No projects found"; });
}

// Get project by ID
function getProjectById(id) {
  return pool
    .query("SELECT * FROM projects WHERE id = $1", [id])
    .then(res => {
      if (res.rows.length === 0) throw "No project found";
      return res.rows[0];
    })
    .catch(err => { throw err; });
}

// Get projects by sector
function getProjectsBySector(sector) {
  return pool
    .query("SELECT * FROM projects WHERE LOWER(sector) = LOWER($1)", [sector])
    .then(res => {
      if (res.rows.length === 0) throw "No projects found for sector";
      return res.rows;
    })
    .catch(err => { throw err; });
}

// Add a new project
function addProject(data) {
  const { title, featuredImage, sector, description } = data;

  return pool
    .query(
      `INSERT INTO projects (title, featuredImage, sector, description)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [title, featuredImage, sector, description]
    )
    .then(res => res.rows[0])
    .catch(err => { throw err; });
}

// Edit an existing project
function editProject(id, data) {
  const { title, featuredImage, sector, description } = data;

  return pool
    .query(
      `UPDATE projects 
       SET title=$1, featuredImage=$2, sector=$3, description=$4 
       WHERE id=$5`,
      [title, featuredImage, sector, description, id]
    )
    .then(() => {})
    .catch(err => { throw err; });
}

// Delete project
function deleteProject(id) {
  return pool
    .query("DELETE FROM projects WHERE id = $1", [id])
    .then(() => {})
    .catch(err => { throw err; });
}

module.exports = {
  initialize,
  getAllProjects,
  getProjectById,
  getProjectsBySector,
  addProject,
  editProject,
  deleteProject,
};
