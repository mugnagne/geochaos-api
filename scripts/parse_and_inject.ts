import fs from 'fs';
import path from 'path';

// Define standard types for our structure
interface Country {
  name: string;
  abbreviation: string;
  flagUrl?: string;
  capital: string;
  population: number; // Gardé pour les calculs de base
  latitude: number;
  longitude: number;
  
  [key: string]: any;
}

// Function to convert comma separated string format numbers to actual numbers
function parseNumber(value: string | undefined): number | null {
  if (!value) return null;
  // Handle empty or whitespace
  if (!value.trim()) return null;
  
  // Strip quotes
  let cleaned = value.replace(/"/g, '');
  
  // Format specific handling like % or $
  cleaned = cleaned.replace(/%/g, '');
  cleaned = cleaned.replace(/\$/g, '');
  
  // Handle dots as separators, and commas as decimals like "10,5" -> "10.5" or "10.5M"
  if (cleaned.includes(',') && cleaned.split(',').length === 2 && cleaned.split(',')[1].length <= 2) {
      cleaned = cleaned.replace(/\./g, '');
      cleaned = cleaned.replace(/,/g, '.');
  } else {
      // standard thousands separator cleanup
      cleaned = cleaned.replace(/,/g, '');
  }

  // Final parse
  const parsed = Number(cleaned);
  return isNaN(parsed) ? null : parsed;
}

// Function to parse the additional CSV data
function parseCsv(csvPath: string) {
  const content = fs.readFileSync(csvPath, 'utf-8');
  const lines = content.split('\n');
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  
  const results: Record<string, any> = {};
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    
    // A more robust CSV parsing for a single line dealing with quotes
    const values: string[] = [];
    let insideQuote = false;
    let currentValue = '';
    
    for (let char of line) {
        if (char === '"') {
            insideQuote = !insideQuote;
        } else if (char === ',' && !insideQuote) {
            values.push(currentValue);
            currentValue = '';
        } else {
            currentValue += char;
        }
    }
    values.push(currentValue); // Add the last value
    
    if (values.length > 0 && values[0]) {
      const countryCode = values[2]?.trim(); // Based on abbreviation since names might not match exactly
      const countryName = values[0]?.trim();
      
      if (!results[countryName]) {
        results[countryName] = {};
      }
      
      // Map relevant columns to new properties
      const mapVal = (headerSubstring: string, fieldName: string) => {
          const index = headers.findIndex(h => h.includes(headerSubstring));
          if (index !== -1 && values[index]) {
             results[countryName][fieldName] = parseNumber(values[index]!!);
          }
      };

      mapVal("Density", "density");
      mapVal("Agricultural Land", "agriculturalLand");
      mapVal("Land Area", "landArea");
      mapVal("Armed Forces", "armedForcesSize");
      mapVal("Birth Rate", "birthRate");
      mapVal("Co2-Emissions", "co2Emissions");
      mapVal("Fertility Rate", "fertilityRate");
      mapVal("Forested Area", "forestedArea");
      mapVal("Gasoline Price", "gasolinePrice");
      mapVal("GDP", "gdp");
      mapVal("Gross primary education", "grossPrimaryEducationEnrollment");
      mapVal("Gross tertiary education", "grossTertiaryEducationEnrollment");
      mapVal("Infant mortality", "infantMortality");
      mapVal("Life expectancy", "lifeExpectancy");
      mapVal("Maternal mortality", "maternalMortalityRatio");
      mapVal("Minimum wage", "minimumWage");
      mapVal("Out of pocket health", "outOfPocketHealthExpenditure");
      mapVal("Physicians per thousand", "physiciansPerThousand");
      mapVal("Labor force participation", "laborForceParticipation");
      mapVal("Tax revenue", "taxRevenue");
      mapVal("Total tax rate", "totalTaxRate");
      mapVal("Unemployment rate", "unemploymentRate");
      mapVal("Urban_population", "urbanPopulation");
    }
  }
  return results;
}

// Function to read all batch files and merge the new data
function processData() {
  const csvData = parseCsv('data.csv');
  
  // Read existing files
  for (let i = 0; i <= 3; i++) {
    const filename = `src/data/batch${i}.ts`;
    if (!fs.existsSync(filename)) continue;
    
    let content = fs.readFileSync(filename, 'utf-8');
    
    // Quick regex to find the object block for each country
    // Since we output it ourselves earlier, it should be uniformly formatted
    const regex = /\{([^}]*name:\s*"([^"]+)"[^}]*)\}/g;
    
    let modifiedContent = content.replace(regex, (match, body, name) => {
        const extraData = csvData[name];
        if (extraData) {
            let addendums = "";
            for (const [key, value] of Object.entries(extraData)) {
                if (value !== null && value !== undefined) {
                     addendums += ` ${key}: ${value},`;
                }
            }
            if (addendums) {
                // insert right before the closing brace
                return `{${body},${addendums} }`;
            }
        }
        return match;
    });
    
    fs.writeFileSync(filename, modifiedContent);
    console.log(`Updated ${filename}`);
  }
}

processData();
