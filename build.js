const fse = require('fs-extra');
const { titleCase } = require('title-case');
const { noCase } = require('change-case');
const yaml = require('js-yaml');
const ejs = require('ejs');
const sass = require('sass');

// Create folders
if (!fse.existsSync('dist')) {
  fse.mkdirpSync('dist/css');
  fse.mkdirSync('dist/js');
}

// Copy static assets
fse.copySync('src/assets', 'dist', { overwrite: true });
fse.copySync('src/js', 'dist/js', { overwrite: true });

// Build CSS
const sassResult = sass.renderSync({
  file: 'src/scss/style.scss',
  sourceMap: true,
  outFile: 'dist/css/style.css',
});
fse.writeFileSync('dist/css/style.css', sassResult.css.toString());
fse.writeFileSync('dist/css/style.css.map', sassResult.map.toString());

// Build HTML
const entryTemplate = ejs.compile(
  fse.readFileSync('src/views/pages/entry.ejs').toString(),
  { filename: 'src/views/pages/entry.ejs' }
);
for (const dataDir of fse.readdirSync(`data`)) {
  for (const entryFile of fse.readdirSync(`data/${dataDir}`, {})) {
    const entryName = titleCase(noCase(entryFile.split('.')[0]));
    const entryData = yaml.load(
      fse.readFileSync(`data/${dataDir}/${entryFile}`)
    );

    const html = entryTemplate({
      entryData,
      entryName,
      distUrl: '/',
      publicUrl: '/',
    });

    fse.writeFileSync(`dist/${entryName}.html`, html);
  }
}
