const fs = require('fs');
const { titleCase } = require('title-case');
const { noCase } = require('change-case');
const yaml = require('js-yaml');
const ejs = require('ejs');

const template = ejs.compile(fs.readFileSync('./views/pages/entry.ejs').toString());
for (const dataDir of fs.readdirSync(`./data`)) {
  for(const entryFile of fs.readdirSync(`./data/${dataDir}`, {})) {
    const entryName = entryFile.split('.')[0];
    const entryData = yaml.load(fs.readFileSync(`./data/${dataDir}/${entryFile}`));
    console.log(entryData);

    const html = template({ entry: entryData });
    fs.writeFileSync(`./dist/${titleCase(noCase(entryName))}.html`, html);
  }
}
