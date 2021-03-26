const fse = require('fs-extra');
const path = require('path');
const { paramCase, noCase } = require('change-case');
const { titleCase } = require('title-case');
const yaml = require('js-yaml');
const md = require('markdown-it')();
const express = require('express');
const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));

fse.copySync('src/assets', 'public', { overwrite: true });
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.render('pages/index');
});

// This is so we can access the src js instead of dist
app.get('/js/*.js', (req, res) => {
  res.download(`src${req.path}`);
});

app.get('/categories', (req, res) => {
  if (!fse.existsSync('./public/categories.json')) {
    require('./build-categories');
  }
  const categories = require('./public/categories.json');
  res.render('pages/categories', { categories });
});

app.get('/category/:categoryPath', (req, res) => {});
app.get('/:entryPath', (req, res) => {
  const { entryPath } = req.params;

  const firstLetter = entryPath[0].toLowerCase();
  const entryFile = `data/${firstLetter}/${paramCase(entryPath)}.yml`;
  const entryData = yaml.load(fse.readFileSync(entryFile));
  const entryFileShortened = entryFile.split('/')[2];
  const entryName =
    (entryData.config && entryData.config.title) ||
    titleCase(noCase(entryFileShortened.split('.')[0]));

  res.render('pages/entry', { entryData, entryName, md });
});

app.listen(8080);
console.log('Listening on 8080');
