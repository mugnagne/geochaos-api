import { Country } from '../types';
import continentsData from '../data/continents.json';
import { CATEGORIES } from '../data/categories';

export function fillMissingData(countries: Country[]): Country[] {
  // 1. Assign continent (region) to each country
  const continents = continentsData as Record<string, string>;
  const ALIASES_REVERSE: Record<string, string> = {
    "USA": "United States",
    "United Kingdom": "Great Britain",
    "Czech Republic": "Czechia",
    "UAE": "United Arab Emirates",
    "Congo": "Republic of the Congo",
    "DR Congo": "Democratic Republic of the Congo",
    "Bahamas": "The Bahamas",
    "Micronesia": "Federated States of Micronesia",
    "Côte d'Ivoire": "Ivory Coast",
    "North Macedonia": "Macedonia",
    "Timor-Leste": "East Timor",
    "Vatican City": "Holy See",
    "Saint Martin": "Saintartin",
    "San Marino": "Sanarino",
    "Isle of Man": "Isle ofan",
    "Svalbard and Jan Mayen": "Svalbard and Janayen",
    "Saint Pierre and Miquelon": "Saint Pierre andiquelon",
    "Northern Mariana Islands": "Northernariana Islands",
    "Heard Island and McDonald Islands": "Heard Island andcDonald Islands",
    "United States Minor Outlying Islands": "United Statesinor Outlying Islands",
    "Sint Maarten": "Sintaarten"
  };

  countries.forEach(c => {
    let region = continents[c.name];
    if (!region && ALIASES_REVERSE[c.name]) {
      region = continents[ALIASES_REVERSE[c.name]];
    }
    c.region = region || 'Unknown';
  });

  const prodCategories = ['riceProduction', 'coffeeProduction', 'fruitProduction'];

  // 2. Compute averages per continent per category
  // also track all values to compute a global average just in case a continent has completely zero data
  const categoryIds = CATEGORIES.map(c => String(c.id));
  
  const continentSums: Record<string, Record<string, number>> = {};
  const continentCounts: Record<string, Record<string, number>> = {};
  
  const globalSums: Record<string, number> = {};
  const globalCounts: Record<string, number> = {};

  countries.forEach(c => {
    const region = c.region!;
    if (!continentSums[region]) {
      continentSums[region] = {};
      continentCounts[region] = {};
    }

    categoryIds.forEach(cat => {
      const val = c[cat as keyof Country] as number | null;
      if (val !== null && val !== undefined) {
        continentSums[region][cat] = (continentSums[region][cat] || 0) + val;
        continentCounts[region][cat] = (continentCounts[region][cat] || 0) + 1;
        
        globalSums[cat] = (globalSums[cat] || 0) + val;
        globalCounts[cat] = (globalCounts[cat] || 0) + 1;
      }
    });
  });

  // Calculate averages
  const getContinentAverage = (region: string, cat: string) => {
    if (continentCounts[region] && continentCounts[region][cat] > 0) {
      return continentSums[region][cat] / continentCounts[region][cat];
    }
    if (globalCounts[cat] > 0) return globalSums[cat] / globalCounts[cat];
    return 0; // fallback
  };

  // 3. Fill missing and generate ranks if we can
  countries.forEach(c => {
    categoryIds.forEach(cat => {
      const val = c[cat as keyof Country] as number | null;
      if (val === null || val === undefined) {
        if (!c.isMissing) c.isMissing = {};
        c.isMissing[cat] = true;
        
        if (prodCategories.includes(cat)) {
          // Rule: production means they don't produce if missing
          (c as any)[cat] = 0;
        } else {
          // Impute with continent average
          let avg = getContinentAverage(c.region!, cat);
		  // round to 2 decimals
		  avg = Math.round(avg * 100) / 100;
          (c as any)[cat] = avg;
        }
      } else {
        if (c.isMissing) c.isMissing[cat] = false;
      }
    });
  });

  return countries;
}
