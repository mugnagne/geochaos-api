const fs = require('fs');

const { BATCH0 } = require('./src/data/batch0.js');
const { BATCH1 } = require('./src/data/batch1.js');
const { BATCH2 } = require('./src/data/batch2.js');
const { BATCH3 } = require('./src/data/batch3.js');

const allCountries = [...BATCH0, ...BATCH1, ...BATCH2, ...BATCH3];

const missingStats = [
  "density",
  "agriculturalLand",
  "landArea",
  "armedForcesSize",
  "birthRate",
  "co2Emissions",
  "fertilityRate",
  "forestedArea",
  "gasolinePrice",
  "gdp",
  "grossPrimaryEducationEnrollment",
  "grossTertiaryEducationEnrollment",
  "infantMortality",
  "lifeExpectancy",
  "maternalMortalityRatio"
];

let csv = "Country," + missingStats.join(",") + "\n";

allCountries.forEach(country => {
  let row = `"${country.name}"`;
  missingStats.forEach(stat => {
    row += "," + (country[stat] !== undefined && country[stat] !== null ? country[stat] : "");
  });
  csv += row + "\n";
});

fs.writeFileSync('missing_stats.csv', csv);
console.log('Created missing_stats.csv');
