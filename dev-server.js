const fs = require('fs');
const { paramCase } = require('change-case');
const yaml = require('js-yaml');
const express = require('express');
const app = express();

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.render('pages/index');
});

app.get('/:entryName', (req, res) => {
  const { entryName } = req.params;
  const firstLetter = entryName[0].toLowerCase();
  const entryFile = `./data/${firstLetter}/${paramCase(entryName)}.yml`;
  const entryData = yaml.load(fs.readFileSync(entryFile));

  res.render('pages/entry', { entry: entryData, entryName, distUrl: '/dist/', publicUrl: '/public/' })
})

app.listen(8080);
console.log('Listening on 8080');
