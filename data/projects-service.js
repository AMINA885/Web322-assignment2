const fs = require('fs');
const path = require('path');
let projects = [];

function initialize() {
  return new Promise((resolve, reject) => {
    fs.readFile(path.join(__dirname, '../projects.json'), 'utf8', (err, data) => {
      if (err) return reject('unable to load projects');
      try {
        projects = JSON.parse(data);
        resolve();
      } catch {
        reject('invalid projects.json');
      }
    });
  });
}

function getAllProjects() {
  return Promise.resolve(projects);
}

function getProjectById(id) {
  return new Promise((resolve, reject) => {
    const p = projects.find(x => Number(x.id) === Number(id));
    p ? resolve(p) : reject('No project found');
  });
}

function getProjectsBySector(sector) {
  return new Promise((resolve, reject) => {
    if (!sector) return reject('Sector required');
    const list = projects.filter(x => (x.sector || '').toLowerCase() === sector.toLowerCase());
    list.length ? resolve(list) : reject('No projects found for sector');
  });
}

module.exports = { initialize, getAllProjects, getProjectById, getProjectsBySector };
