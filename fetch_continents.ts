import fs from 'fs';

async function fetchContinents() {
  const res = await fetch('https://restcountries.com/v3.1/all');
  const data = await res.json();
  const map: Record<string, string> = {};
  for (const country of data) {
    if (country.name && country.name.common && country.continents && country.continents.length > 0) {
      map[country.name.common] = country.continents[0];
    }
  }
  fs.writeFileSync('continents.json', JSON.stringify(map, null, 2), 'utf-8');
  console.log('Continents saved.');
}

fetchContinents();
