const fs = require('fs');
const { titleCase } = require('title-case');
const { noCase } = require('change-case');
const yaml = require('js-yaml');
const ejs = require('ejs');

// TODO: Copy from public dir
const template = ejs.compile(fs.readFileSync('./views/pages/entry.ejs').toString());
for (const dataDir of fs.readdirSync(`data`)) {
  for(const entryFile of fs.readdirSync(`data/${dataDir}`, {})) {
    const entryName = entryFile.split('.')[0];
    const entryData = yaml.load(fs.readFileSync(`data/${dataDir}/${entryFile}`));

    const html = template({ entry: entryData });
    if(!fs.existsSync('dist')) {
      fs.mkdirSync('dist');
    };
    fs.writeFileSync(`dist/${titleCase(noCase(entryName))}.html`, html);
  }
}
