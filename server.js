const fs = require('fs');
const { paramCase } = require('change-case');
const yaml = require('js-yaml');
const express = require('express');
const app = express();

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.render('pages/index');
});

app.get('/:entry', (req, res) => {
  const { entry } = req.params;
  const firstLetter = entry[0].toLowerCase();
  const entryFile = `./data/${firstLetter}/${paramCase(entry)}.yml`;
  const entryData = yaml.load(fs.readFileSync(entryFile));
  console.log(entryData);

  res.render('pages/entry', { entry: entryData })
})

app.listen(8080);
console.log('Listening on 8080');
