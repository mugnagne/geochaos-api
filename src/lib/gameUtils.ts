import { Country, GameCategory } from '../types';

/**
 * Returns the pre-calculated rank from CSV data.
 */
export function calculateRank(
  targetCountry: Country,
  category: GameCategory,
  allCountries: Country[]
): number {
  const currentValue = targetCountry[category.id] as number;
  
  if (currentValue === undefined || currentValue === null) return allCountries.length;

  const betterCount = allCountries.reduce((count, otherCountry) => {
    const otherValue = otherCountry[category.id] as number;
    
    if (otherValue === undefined || otherValue === null) return count;

    if (category.direction === 'HIGHER') {
      return otherValue > currentValue ? count + 1 : count;
    } else {
      return otherValue < currentValue ? count + 1 : count;
    }
  }, 0);

  return betterCount + 1;
}
