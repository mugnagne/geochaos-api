import fs from 'fs';
import path from 'path';

function normalize(name: string) {
    return name.toLowerCase().replace(/the /g, '').replace(/republic of /g, '').trim();
}

const keyMap: Record<string, string> = {
    "alcohol": "alcoholConsumption",
    "temperature": "averageTemp",
    "precipitation": "annualPrecipitation",
    "populationGrowth": "populationGrowthRate",
    "corruptionScore": "corruptionIndex"
};

function processData() {
  const data1 = JSON.parse(fs.readFileSync('scripts/data1.json', 'utf-8'));
  const data2 = JSON.parse(fs.readFileSync('scripts/data2.json', 'utf-8'));
  
  const allData = { ...data1, ...data2 };

  for (let i = 0; i <= 3; i++) {
    const filename = `src/data/batch${i}.ts`;
    if (!fs.existsSync(filename)) continue;
    
    let content = fs.readFileSync(filename, 'utf-8');
    
    const regex = /\{([^}]*name:\s*"([^"]+)"[^}]*)\}/g;
    
    let modifiedContent = content.replace(regex, (match, body, name) => {
        let addendums = "";
        
        for (const [category, countriesDict] of Object.entries(allData)) {
            let val = (countriesDict as any)[name];
            if (val === undefined) {
               const normName = normalize(name);
               const matchKey = Object.keys(countriesDict as any).find(k => normalize(k) === normName);
               if (matchKey) {
                   val = (countriesDict as any)[matchKey];
               }
            }
            if (val === undefined) {
               const normName = normalize(name);
               const matchKey = Object.keys(countriesDict as any).find(k => normalize(k).includes(normName) || normName.includes(normalize(k)));
               if (matchKey) {
                   val = (countriesDict as any)[matchKey];
               }
            }
            
            if (val !== undefined && val !== null) {
                const finalKey = keyMap[category] || category;
                addendums += ` ${finalKey}: ${val},`;
            }
        }

        if (addendums) {
            return `{${body},${addendums} }`;
        }
        
        return match;
    });
    
    fs.writeFileSync(filename, modifiedContent);
    console.log(`Updated ${filename}`);
  }
}

processData();
