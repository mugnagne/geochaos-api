export interface Country {
  name: string;
  abbreviation: string;
  flagUrl?: string;
  capital: string;
  population: number; // Gardé pour les calculs de base
  latitude: number;
  longitude: number;
  
  // Les 15 catégories CSV strictement
  alcoholConsumption?: number | null;
  averageTemp?: number | null;
  coffeeProduction?: number | null;
  corruptionIndex?: number | null;
  democracyScore?: number | null;
  riceProduction?: number | null;
  highestPoint?: number | null;
  homicideRate?: number | null;
  obesityRate?: number | null;
  over65Rate?: number | null;
  under15Rate?: number | null;
  annualPrecipitation?: number | null;
  populationGrowthRate?: number | null;
  fruitProduction?: number | null;
  childLabour?: number | null;
  roadTrafficDeaths?: number | null;

  // Nouveaux ajouts CSV
  density?: number | null;
  agriculturalLand?: number | null;
  landArea?: number | null;
  armedForcesSize?: number | null;
  birthRate?: number | null;
  co2Emissions?: number | null;
  fertilityRate?: number | null;
  forestedArea?: number | null;
  gasolinePrice?: number | null;
  gdp?: number | null;
  grossPrimaryEducationEnrollment?: number | null;
  grossTertiaryEducationEnrollment?: number | null;
  infantMortality?: number | null;
  lifeExpectancy?: number | null;
  maternalMortalityRatio?: number | null;
  minimumWage?: number | null;
  outOfPocketHealthExpenditure?: number | null;
  physiciansPerThousand?: number | null;
  laborForceParticipation?: number | null;
  taxRevenue?: number | null;
  totalTaxRate?: number | null;
  unemploymentRate?: number | null;
  urbanPopulation?: number | null;

  // Ranks
  alcoholConsumptionRank?: number | null;
  averageTempRank?: number | null;
  coffeeProductionRank?: number | null;
  corruptionIndexRank?: number | null;
  democracyScoreRank?: number | null;
  riceProductionRank?: number | null;
  highestPointRank?: number | null;
  homicideRateRank?: number | null;
  obesityRateRank?: number | null;
  over65RateRank?: number | null;
  under15RateRank?: number | null;
  annualPrecipitationRank?: number | null;
  populationGrowthRateRank?: number | null;
  fruitProductionRank?: number | null;
  childLabourRank?: number | null;
  roadTrafficDeathsRank?: number | null;
  
  densityRank?: number | null;
  agriculturalLandRank?: number | null;
  landAreaRank?: number | null;
  armedForcesSizeRank?: number | null;
  birthRateRank?: number | null;
  co2EmissionsRank?: number | null;
  fertilityRateRank?: number | null;
  forestedAreaRank?: number | null;
  gasolinePriceRank?: number | null;
  gdpRank?: number | null;
  grossPrimaryEducationEnrollmentRank?: number | null;
  grossTertiaryEducationEnrollmentRank?: number | null;
  infantMortalityRank?: number | null;
  lifeExpectancyRank?: number | null;
  maternalMortalityRatioRank?: number | null;
  minimumWageRank?: number | null;
  outOfPocketHealthExpenditureRank?: number | null;
  physiciansPerThousandRank?: number | null;
  laborForceParticipationRank?: number | null;
  taxRevenueRank?: number | null;
  totalTaxRateRank?: number | null;
  unemploymentRateRank?: number | null;
  urbanPopulationRank?: number | null;

  // Métadonnées système
  region?: string;
  isMissing?: Record<string, boolean>;
}

export type ChallengeDirection = 'HIGHER' | 'LOWER';

export interface GameCategory extends CategorySpec {
  direction: ChallengeDirection;
}

export interface CategorySpec {
  id: keyof Country;
  label: string;
  labelHigher: string;
  labelLower: string;
  unit: string;
  description: string;
}

export type GameState = 'HOME' | 'START' | 'BONUS_WHEEL' | 'PLAYING' | 'END' | 'TUTORIAL' | 'SHOP' | 'COLLECTION';
export type GameMode = 'ENDLESS' | 'DAILY';

export type BonusType = 'RELOCATION' | 'REROLL' | 'ZOMBIE' | 'CLAIRVOYANT' | 'DOUBLE_OR_NOTHING' | 'FORESHADOWING';

export interface Bonus {
  id: BonusType;
  name: string;
  description: string;
  icon: string;
}

export interface Round {
  country: Country;
  category: GameCategory;
  rank: number;
  value: number | null;
}

export type Rarity = 'COMMUN' | 'RARE' | 'EPIQUE' | 'LEGENDAIRE' | 'GEOCHAOS';

export interface OwnedCard {
  countryName: string;
  obtainedAt: number;
  count: number;
}
