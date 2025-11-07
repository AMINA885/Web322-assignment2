/********************************************************************************
* WEB322 – Assignment 02
*
* I declare that this assignment is my own work in accordance with Seneca's
* Academic Integrity Policy:
* https://www.senecapolytechnic.ca/about/policies/academic-integrity-policy.html
*
* Name: Amina Mustak Dipoti     Student ID: 113299242  Date: 11-05-2025
* Published URL: ______________________________________________
********************************************************************************/
const express = require('express');
const app = express();
const { initialize, getAllProjects, getProjectById, getProjectsBySector } = require('./data/projects-service');

// static + view engine
app.use(express.static('public'));
app.set('view engine', 'ejs');

// routes: static views
app.get('/', (req, res) => res.render('home'));
app.get('/about', (req, res) => res.render('about'));

// dynamic: project details
app.get('/solutions/projects/:id', async (req, res) => {
  try {
    const project = await getProjectById(Number(req.params.id));
    res.render('project', { project });
  } catch (err) {
    res.status(404).render('404', { message: err });
  }
});

// dynamic: projects list with optional ?sector
app.get('/solutions/projects', async (req, res) => {
  try {
    if (req.query.sector) {
      const projects = await getProjectsBySector(req.query.sector);
      if (projects.length) return res.render('projects', { projects });
      return res.status(404).render('404', { message: `No projects found for sector: ${req.query.sector}` });
    }
    const projects = await getAllProjects();
    res.render('projects', { projects });
  } catch (err) {
    res.status(404).render('404', { message: err });
  }
});

// 404 fallback LAST
app.use((req, res) =>
  res.status(404).render('404', { message: "I'm sorry, we're unable to find what you're looking for" })
);

// start
initialize().then(() => {
  const PORT = process.env.PORT || 8080;
  app.listen(PORT, () => console.log(`http://localhost:${PORT}`));
}).catch(err => {
  console.error(err);
});
