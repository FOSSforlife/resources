const fs = require('fs');
const { titleCase } = require('title-case');
const { noCase } = require('change-case');
const yaml = require('js-yaml');
const ejs = require('ejs');
const sass = require('sass');

// Create folders
if(!fs.existsSync('dist')) {
  fs.mkdirSync('dist');
};
if(!fs.existsSync('dist/css')) {
  fs.mkdirSync('dist/css');
};

// Build CSS
const sassResult = sass.renderSync({
  file: 'views/scss/style.scss',
  sourceMap: true,
  outFile: 'dist/css/style.css'
})
fs.writeFileSync('dist/css/style.css', sassResult.css.toString());
fs.writeFileSync('dist/css/style.css.map', sassResult.map.toString());

// TODO: Copy from public dir
// Build HTML
const entryTemplate = ejs.compile(fs.readFileSync('./views/pages/entry.ejs').toString());
for (const dataDir of fs.readdirSync(`data`)) {
  for(const entryFile of fs.readdirSync(`data/${dataDir}`, {})) {
    const entryName = titleCase(noCase(entryFile.split('.')[0]));;
    const entryData = yaml.load(fs.readFileSync(`data/${dataDir}/${entryFile}`));

    const html = entryTemplate({ entry: entryData, entryName, distUrl: '/', publicUrl: '/' });

    fs.writeFileSync(`dist/${entryName}.html`, html);
  }
}
