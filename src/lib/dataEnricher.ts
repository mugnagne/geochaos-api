import { Country } from '../types';
import { CSV_DATA } from './CSV_DATA';

const ALIASES: Record<string, string> = {
  "United States": "USA",
  "Great Britain": "United Kingdom",
  "Czechia": "Czech Republic",
  "United Arab Emirates": "UAE",
  "Republic of the Congo": "Congo",
  "Democratic Republic of the Congo": "DR Congo",
  "The Bahamas": "Bahamas",
  "Federated States of Micronesia": "Micronesia",
  "Ivory Coast": "Côte d'Ivoire",
  "Macedonia": "North Macedonia",
  "East Timor": "Timor-Leste",
  "Holy See": "Vatican City",
  "United Kingdom (England and Wales)": "United Kingdom",
  "Northacedonia": "North Macedonia",
  "Saintartin": "Saint Martin",
  "Sanarino": "San Marino",
  "Isle ofan": "Isle of Man",
  "Svalbard and Janayen": "Svalbard and Jan Mayen",
  "Saint Pierre andiquelon": "Saint Pierre and Miquelon",
  "Federated States oficronesia": "Micronesia",
  "Northernariana Islands": "Northern Mariana Islands",
  "Heard Island andcDonald Islands": "Heard Island and McDonald Islands",
  "United Statesinor Outlying Islands": "United States Minor Outlying Islands",
  "Sintaarten": "Sint Maarten"
};

export function enrichCountry(country: any): Country {
  const isMissing: Record<string, boolean> = {};
  
  const getValue = (key: string, csvKey: string) => {
    const possibleNames = [country.name, ALIASES[country.name] || ""].filter(Boolean);
    
    // Add reverse aliases
    for (const [keyAlias, valAlias] of Object.entries(ALIASES)) {
      if (valAlias === country.name) possibleNames.push(keyAlias);
    }

    for (const name of possibleNames) {
      if (CSV_DATA[csvKey] && CSV_DATA[csvKey][name] !== undefined) {
        return CSV_DATA[csvKey][name];
      }
    }
    
    isMissing[key] = true;
    return null;
  };

  return {
    ...country,
    isMissing,
    alcoholConsumption: getValue('alcoholConsumption', 'alcoholConsumption')?.value ?? null,
    alcoholConsumptionRank: getValue('alcoholConsumption', 'alcoholConsumption')?.rank ?? null,
    averageTemp: getValue('averageTemp', 'averageTemp')?.value ?? null,
    averageTempRank: getValue('averageTemp', 'averageTemp')?.rank ?? null,
    coffeeProduction: getValue('coffeeProduction', 'coffeeProduction')?.value ?? null,
    coffeeProductionRank: getValue('coffeeProduction', 'coffeeProduction')?.rank ?? null,
    corruptionIndex: getValue('corruptionIndex', 'corruptionIndex')?.value ?? null,
    corruptionIndexRank: getValue('corruptionIndex', 'corruptionIndex')?.rank ?? null,
    democracyScore: getValue('democracyScore', 'democracyScore')?.value ?? null,
    democracyScoreRank: getValue('democracyScore', 'democracyScore')?.rank ?? null,
    riceProduction: getValue('riceProduction', 'riceProduction')?.value ?? null,
    riceProductionRank: getValue('riceProduction', 'riceProduction')?.rank ?? null,
    highestPoint: getValue('highestPoint', 'highestPoint')?.value ?? null,
    highestPointRank: getValue('highestPoint', 'highestPoint')?.rank ?? null,
    homicideRate: getValue('homicideRate', 'homicideRate')?.value ?? null,
    homicideRateRank: getValue('homicideRate', 'homicideRate')?.rank ?? null,
    obesityRate: getValue('obesityRate', 'obesityRate')?.value ?? null,
    obesityRateRank: getValue('obesityRate', 'obesityRate')?.rank ?? null,
    over65Rate: getValue('over65Rate', 'over65Rate')?.value ?? null,
    over65RateRank: getValue('over65Rate', 'over65Rate')?.rank ?? null,
    under15Rate: getValue('under15Rate', 'under15Rate')?.value ?? null,
    under15RateRank: getValue('under15Rate', 'under15Rate')?.rank ?? null,
    annualPrecipitation: getValue('annualPrecipitation', 'annualPrecipitation')?.value ?? null,
    annualPrecipitationRank: getValue('annualPrecipitation', 'annualPrecipitation')?.rank ?? null,
    populationGrowthRate: getValue('populationGrowthRate', 'populationGrowthRate')?.value ?? null,
    populationGrowthRateRank: getValue('populationGrowthRate', 'populationGrowthRate')?.rank ?? null,
    fruitProduction: getValue('fruitProduction', 'fruitProduction')?.value ?? null,
    fruitProductionRank: getValue('fruitProduction', 'fruitProduction')?.rank ?? null,
    childLabour: getValue('childLabour', 'childLabour')?.value ?? null,
    childLabourRank: getValue('childLabour', 'childLabour')?.rank ?? null,
    roadTrafficDeaths: getValue('roadTrafficDeaths', 'roadTrafficDeaths')?.value ?? null,
    roadTrafficDeathsRank: getValue('roadTrafficDeaths', 'roadTrafficDeaths')?.rank ?? null,
  };
}
