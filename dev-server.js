const fse = require('fs-extra');
const path = require('path');
const { pick } = require('lodash');
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
  let categories;
  if (!fse.existsSync('./public/categories.json')) {
    categories = require('./build-categories');
  } else {
    categories = require('./public/categories.json');
  }
  res.render('pages/categories', { categories });
});

app.get('/categories/:categoryPath', (req, res) => {
  const { categoryPath } = req.params;
  const categoryName = titleCase(categoryPath);
  let categories;
  if (!fse.existsSync('./public/categories.json')) {
    categories = require('./build-categories');
  } else {
    categories = require('./public/categories.json');
  }

  console.log(categories);
  const categoryFullName = Object.keys(categories).find((fullName) => {
    return fullName.split('~').pop() === categoryPath;
  });
  if (!categoryFullName) {
    // TODO: return error or whatever
  }
  const filteredCategories = pick(
    categories,
    Object.keys(categories).filter((c) => c.startsWith(categoryFullName))
  );

  res.render('pages/categories', { categories: filteredCategories });
});

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
