const fse = require('fs-extra');
const path = require('path');
const { paramCase } = require('change-case');
const yaml = require('js-yaml');
const express = require('express');
const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));

app.get('/', (req, res) => {
  res.render('pages/index');
});

app.get('/:entryName', (req, res) => {
  const { entryName } = req.params;
  const firstLetter = entryName[0].toLowerCase();
  const entryFile = `./data/${firstLetter}/${paramCase(entryName)}.yml`;
  const entryData = yaml.load(fse.readFileSync(entryFile));

  res.render('pages/entry', { entryData, entryName });
});

fse.copySync('src/assets', 'dist', { overwrite: true });
app.use(express.static('public'));

app.listen(8080);
console.log('Listening on 8080');
