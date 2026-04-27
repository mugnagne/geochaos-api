import { Rarity } from '../types';

export const RARITIES: Record<Rarity, { label: string; chance: number; color: string; hex: string }> = {
  COMMUN: { label: 'Commun', chance: 50, color: 'text-gray-400', hex: '#d1d5db' },
  RARE: { label: 'Rare', chance: 30, color: 'text-blue-400', hex: '#3b82f6' },
  EPIQUE: { label: 'Épique', chance: 15, color: 'text-purple-500', hex: '#a855f7' },
  LEGENDAIRE: { label: 'Légendaire', chance: 4.5, color: 'text-yellow-500', hex: '#eab308' },
  GEOCHAOS: { label: 'GeoChaos', chance: 0.5, color: 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-magenta-500 to-yellow-400', hex: '#00f5d4' }
};

export const GEOCHAOS_COUNTRIES = [
  "Bretagne", "URSS", "Commune de Paris", "Nilfgaard", "AudenciaLand"
];

// Determine rarity based on some simple string hashing to keep it deterministic per country
export function getCountryRarity(countryName: string): Rarity {
  if (countryName === "Russia" || countryName === "Russie") return 'COMMUN';
  
  if (GEOCHAOS_COUNTRIES.includes(countryName)) {
    return 'GEOCHAOS';
  }
  
  let h = 0;
  for (let i = 0; i < countryName.length; i++) {
    h = Math.imul(31, h) + countryName.charCodeAt(i) | 0;
  }
  const val = Math.abs(h) % 100;
  
  if (val < 50) return 'COMMUN'; // 50%
  if (val < 80) return 'RARE'; // 30%
  if (val < 95) return 'EPIQUE'; // 15%
  return 'LEGENDAIRE'; // 5%
}
