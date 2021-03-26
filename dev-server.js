const fse = require('fs-extra');
const path = require('path');
const flatten = require('flat');
const { get, set } = require('lodash');
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
  const categories = {};
  for (const dataDir of fse.readdirSync(`data`)) {
    for (const entryFile of fse.readdirSync(`data/${dataDir}`, {})) {
      const entryData = yaml.load(fse.readFileSync(`data/${dataDir}/${entryFile}`));
      const entryName =
        (entryData.config && entryData.config.title) || titleCase(noCase(entryFile.split('.')[0]));

      if (entryData.config && entryData.config.categories) {
        const categoriesToAdd = flatten(entryData.config.categories, { delimiter: '~' });
        for (const category of Object.keys(categoriesToAdd)) {
          // make sure all upper categories exist
          for (const [index, subcategory] of category.split('~').entries()) {
            const subcategoryFullName = category
              .split('~')
              .slice(0, index + 1)
              .join('~');
            const subcategoryPages = categories[subcategoryFullName] || [];
            categories[subcategoryFullName] = subcategoryPages;
          }

          const categoryPages = categories[category] || [];
          categoryPages.push(entryName);
          categories[category] = categoryPages;

          // const categoryPath = category.split('~');
          // const categoryPages = get(categories, categoryPath, []);
          // categoryPages.push(entryName);
          // instead of set, we need array push
          // 'three': ['a', 'b', 'c', {deep: ['d', 'e', 'f']}, ],
          // set(categories, categoryPath, categoryPages);
        }
      }
    }
  }
  res.render('pages/categories', { categories });
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
