import { BATCH0 } from './batch0';
import { BATCH1 } from './batch1';
import { BATCH2 } from './batch2';
import { BATCH3 } from './batch3';
import { SPECIAL_COUNTRIES } from './specialCountries';
import { enrichCountry } from '../lib/dataEnricher';
import { fillMissingData } from '../lib/fillMissingData';

// Combine all batches to cover ~195 countries and apply enrichment logic
const enrichedCountries = [
  ...BATCH0,
  ...BATCH1,
  ...BATCH2,
  ...BATCH3,
  ...SPECIAL_COUNTRIES
].map(enrichCountry);

export const COUNTRIES = fillMissingData(enrichedCountries);

