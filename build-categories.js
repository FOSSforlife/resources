const fs = require('fs');
const yaml = require('js-yaml');
const { titleCase } = require('title-case');
const { noCase } = require('change-case');
const flatten = require('flat');

function buildCategories(outFile) {
  const categories = {};
  for (const dataDir of fs.readdirSync(`data`)) {
    for (const entryFile of fs.readdirSync(`data/${dataDir}`, {})) {
      const entryData = yaml.load(fs.readFileSync(`data/${dataDir}/${entryFile}`));
      if (!entryData) {
        continue;
      }
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
        }
      }
    }
  }

  fs.writeFileSync(outFile, JSON.stringify(categories));
  return categories;
}

if (require.main === module) {
  // Called directly in console
  const outFile = process.argv[2] || 'public/categories.json';
  buildCategories(outFile);
} else {
  // Called in build.js or dev-server.js
  module.exports = buildCategories('public/categories.json');
}
