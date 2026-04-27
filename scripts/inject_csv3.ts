import fs from 'fs';

function parseN(val: string, f: string): number | null {
  if (!val) return null;
  val = val.trim();
  if (val.startsWith('"') && val.endsWith('"')) val = val.substring(1, val.length -1).trim();
  if (!val) return null;

  if (['density', 'landArea', 'armedForcesSize'].includes(f)) {
    val = val.replace(/,/g, '');
    return parseInt(val, 10);
  }
  
  if (['agriculturalLand', 'birthRate'].includes(f)) {
    val = val.replace('%', '').replace(/,/g, '.');
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
  csvMap[parts[0].toLowerCase()] = {
    density: parseN(parts[1], 'density'),
    agriculturalLand: parseN(parts[3], 'agriculturalLand'),
    landArea: parseN(parts[4], 'landArea'),
    armedForcesSize: parseN(parts[5], 'armedForcesSize'),
    birthRate: parseN(parts[6], 'birthRate')
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

for (let i = 0; i <= 3; i++) {
  const fn = `src/data/batch${i}.ts`;
  if (!fs.existsSync(fn)) continue;
  let content = fs.readFileSync(fn, 'utf-8');
  content = content.replace(/\{([^}]*name:\s*"([^"]+)"[^}]*)\}/g, (match, body, name) => {
    let n = name.trim().toLowerCase();
    let data = csvMap[n] || csvMap[aliases[n]];
    if (!data) return match;
    
    // Clean old
    body = body.replace(/ (density|agriculturalLand|landArea|armedForcesSize|birthRate):\s*[^,]+,/g, '');
    let inserts = "";
    if (data.density) inserts += ` density: ${data.density},`;
    if (data.agriculturalLand) inserts += ` agriculturalLand: ${data.agriculturalLand},`;
    if (data.landArea) inserts += ` landArea: ${data.landArea},`;
    if (data.armedForcesSize) inserts += ` armedForcesSize: ${data.armedForcesSize},`;
    if (data.birthRate) inserts += ` birthRate: ${data.birthRate},`;
    return `{${body}${inserts} }`;
  });
  fs.writeFileSync(fn, content);
  console.log('Fixed', fn);
}
