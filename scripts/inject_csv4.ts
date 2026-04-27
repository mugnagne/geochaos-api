import fs from 'fs';

function parseN(val: string, f: string): number | null {
  if (!val) return null;
  val = val.trim();
  if (val.startsWith('"') && val.endsWith('"')) val = val.substring(1, val.length -1).trim();
  if (!val) return null;

  // Co2-Emissions, GDP, urbanPopulation
  if (['co2Emissions', 'gdp', 'urbanPopulation'].includes(f)) {
    val = val.replace(/,/g, '').replace(/\$/g, '').trim();
    return parseInt(val, 10);
  }
  
  // Percentages and floats
  if (['fertilityRate', 'forestedArea', 'gasolinePrice', 'grossPrimaryEducationEnrollment', 'grossTertiaryEducationEnrollment', 'infantMortality', 'lifeExpectancy', 'maternalMortalityRatio', 'minimumWage', 'outOfPocketHealthExpenditure', 'physiciansPerThousand', 'laborForceParticipation', 'taxRevenue', 'totalTaxRate', 'unemploymentRate'].includes(f)) {
    val = val.replace('%', '').replace(/\$/g, '').replace(/,/g, '.').trim();
    return parseFloat(val);
  }
  return parseFloat(val.replace(/,/g, '.'));
}

const lines = fs.readFileSync('data3.csv', 'utf-8').split('\n');

const csvMap: Record<string, any> = {};
for (const line of lines) {
  const parts = [];
  let inQuotes = false;
  let current = '';
  for (let i = 0; i < line.length; i++) {
    if (line[i] === '"') inQuotes = !inQuotes;
    else if (line[i] === ',' && !inQuotes) {
      parts.push(current);
      current = '';
    } else current += line[i];
  }
  parts.push(current);
  if (!parts[0]) continue;
  if (parts[0] === 'Country') continue;

  csvMap[parts[0].toLowerCase()] = {
    co2Emissions: parseN(parts[7], 'co2Emissions'),
    fertilityRate: parseN(parts[8], 'fertilityRate'),
    forestedArea: parseN(parts[9], 'forestedArea'),
    gasolinePrice: parseN(parts[10], 'gasolinePrice'),
    gdp: parseN(parts[11], 'gdp'),
    grossPrimaryEducationEnrollment: parseN(parts[12], 'grossPrimaryEducationEnrollment'),
    grossTertiaryEducationEnrollment: parseN(parts[13], 'grossTertiaryEducationEnrollment'),
    infantMortality: parseN(parts[14], 'infantMortality'),
    lifeExpectancy: parseN(parts[15], 'lifeExpectancy'),
    maternalMortalityRatio: parseN(parts[16], 'maternalMortalityRatio'),
    minimumWage: parseN(parts[17], 'minimumWage'),
    outOfPocketHealthExpenditure: parseN(parts[18], 'outOfPocketHealthExpenditure'),
    physiciansPerThousand: parseN(parts[19], 'physiciansPerThousand'),
    laborForceParticipation: parseN(parts[21], 'laborForceParticipation'),
    taxRevenue: parseN(parts[22], 'taxRevenue'),
    totalTaxRate: parseN(parts[23], 'totalTaxRate'),
    unemploymentRate: parseN(parts[24], 'unemploymentRate'),
    urbanPopulation: parseN(parts[25], 'urbanPopulation'),
  };
}

const aliases: Record<string, string> = {
  "united states": "united states of america",
  "the bahamas": "bahamas",
  "republic of ireland": "ireland",
  "the gambia": "gambia",
  "s": "sao tome and principe",
  "palestinian national authority": "palestine",
  "czech republic": "czechia",
  "slovakia": "slovakia",
  "serbia": "serbia",
  "north macedonia": "north macedonia",
  "eswatini": "eswatini",
  "nauru": "nauru",
  "vatican city": "vatican city"
};

const attrs = [
    'co2Emissions',
    'fertilityRate',
    'forestedArea',
    'gasolinePrice',
    'gdp',
    'grossPrimaryEducationEnrollment',
    'grossTertiaryEducationEnrollment',
    'infantMortality',
    'lifeExpectancy',
    'maternalMortalityRatio',
    'minimumWage',
    'outOfPocketHealthExpenditure',
    'physiciansPerThousand',
    'laborForceParticipation',
    'taxRevenue',
    'totalTaxRate',
    'unemploymentRate',
    'urbanPopulation',
];

for (let i = 0; i <= 3; i++) {
  const fn = `src/data/batch${i}.ts`;
  if (!fs.existsSync(fn)) continue;
  let content = fs.readFileSync(fn, 'utf-8');
  content = content.replace(/\{([^}]*name:\s*"([^"]+)"[^}]*)\}/g, (match, body, name) => {
    let n = name.trim().toLowerCase();
    let data = csvMap[n] || csvMap[aliases[n]];
    if (!data) return match;
    
    // Clean old
    const regexRemove = new RegExp(` (${attrs.join('|')}):\\s*[^,]+,`, 'g');
    body = body.replace(regexRemove, '');
    let inserts = "";
    
    for (const attr of attrs) {
        if (data[attr] !== null && data[attr] !== undefined && !isNaN(data[attr])) {
            inserts += ` ${attr}: ${data[attr]},`;
        }
    }
    
    return `{${body}${inserts} }`;
  });
  fs.writeFileSync(fn, content);
  console.log('Fixed', fn);
}
