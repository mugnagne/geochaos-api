import React, { useMemo, useState, useEffect } from 'react';
import Papa from 'papaparse';
import { healthDataCsv } from '../data/health_data_csv';
import { populationDataCsv } from '../data/population_data_csv';
import { urbanDataCsv } from '../data/urban_data_csv';
import { MaxCard, MaxButton } from './MaximalistComponents';
import { ArrowLeft, Search } from 'lucide-react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

interface DashboardProps {
  onBack: () => void;
}

interface ParsedData {
  Country: string;
  minimumWage: number | null;
  outOfPocketHealth: number | null;
  physiciansPerThousand: number | null;
  population: number | null;
  laborForceParticipation: number | null;
  taxRevenue: number | null;
  totalTaxRate: number | null;
  unemploymentRate: number | null;
  urbanPopulation: number | null;
}

const parseFormattedNumber = (val: string | undefined): number | null => {
  if (!val) return null;
  const cleaned = val.replace(/[^0-9,-]/g, '').replace(',', '.');
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

export function Dashboard({ onBack }: DashboardProps) {
  const [data, setData] = useState<ParsedData[]>([]);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'table' | 'scatter' | 'bar' | 'popScatter' | 'urbanScatter'>('table');

  // ... below the other memos
  const validPopScatterData = useMemo(() => {
    return data.filter(d => d.taxRevenue !== null && d.laborForceParticipation !== null);
  }, [data]);

  const validUrbanScatterData = useMemo(() => {
    return data.filter(d => d.urbanPopulation !== null && d.unemploymentRate !== null);
  }, [data]);

  useEffect(() => {
    let healthParsed: any[] = [];
    let popParsed: any[] = [];
    let urbanParsed: any[] = [];

    Papa.parse<{ Country: string, 'Minimum wage': string, 'Out of pocket health expenditure': string, 'Physicians per thousand': string }>(healthDataCsv, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        healthParsed = results.data.map(row => ({
          Country: row.Country,
          minimumWage: parseFormattedNumber(row['Minimum wage']),
          outOfPocketHealth: parseFormattedNumber(row['Out of pocket health expenditure']),
          physiciansPerThousand: parseFormattedNumber(row['Physicians per thousand'])
        }));
        
        Papa.parse<{ Country: string, 'Population': string, 'Population: Labor force participation (%)': string, 'Tax revenue (%)': string }>(populationDataCsv, {
          header: true,
          skipEmptyLines: true,
          complete: (popResults) => {
            popParsed = popResults.data.map(row => ({
              Country: row.Country,
              population: parseFormattedNumber(row['Population']),
              laborForceParticipation: parseFormattedNumber(row['Population: Labor force participation (%)']),
              taxRevenue: parseFormattedNumber(row['Tax revenue (%)'])
            }));

            Papa.parse<{ Country: string, 'Total tax rate': string, 'Unemployment rate': string, 'Urban_population': string }>(urbanDataCsv, {
              header: true,
              skipEmptyLines: true,
              complete: (urbanResults) => {
                urbanParsed = urbanResults.data.map(row => ({
                  Country: row.Country,
                  totalTaxRate: parseFormattedNumber(row['Total tax rate']),
                  unemploymentRate: parseFormattedNumber(row['Unemployment rate']),
                  urbanPopulation: parseFormattedNumber(row['Urban_population'])
                }));

                // Merge
                const combinedMap = new Map<string, ParsedData>();
                healthParsed.forEach(h => {
                  combinedMap.set(h.Country, {
                    ...h,
                    population: null,
                    laborForceParticipation: null,
                    taxRevenue: null,
                    totalTaxRate: null,
                    unemploymentRate: null,
                    urbanPopulation: null
                  });
                });

                popParsed.forEach(p => {
                  if (combinedMap.has(p.Country)) {
                    combinedMap.set(p.Country, { ...combinedMap.get(p.Country)!, ...p });
                  } else {
                    combinedMap.set(p.Country, {
                      Country: p.Country,
                      minimumWage: null,
                      outOfPocketHealth: null,
                      physiciansPerThousand: null,
                      totalTaxRate: null,
                      unemploymentRate: null,
                      urbanPopulation: null,
                      ...p
                    });
                  }
                });

                urbanParsed.forEach(u => {
                  if (combinedMap.has(u.Country)) {
                    combinedMap.set(u.Country, { ...combinedMap.get(u.Country)!, ...u });
                  } else {
                    combinedMap.set(u.Country, {
                      Country: u.Country,
                      minimumWage: null,
                      outOfPocketHealth: null,
                      physiciansPerThousand: null,
                      population: null,
                      laborForceParticipation: null,
                      taxRevenue: null,
                      ...u
                    });
                  }
                });

                setData(Array.from(combinedMap.values()));
              }
            });
          }
        });
      }
    });
  }, []);

  const filteredData = useMemo(() => {
    return data.filter(d => d.Country.toLowerCase().includes(search.toLowerCase()));
  }, [data, search]);

  const validScatterData = useMemo(() => {
    return data.filter(d => d.minimumWage !== null && d.outOfPocketHealth !== null);
  }, [data]);

  const sortedBarData = useMemo(() => {
    return data.filter(d => d.physiciansPerThousand !== null).sort((a, b) => (b.physiciansPerThousand as number) - (a.physiciansPerThousand as number)).slice(0, 30);
  }, [data]);

  return (
    <div className="w-full flex-1 flex flex-col items-center justify-start z-10 px-2 sm:px-4 max-w-7xl mx-auto">
      <div className="w-full flex items-center justify-between mb-6">
        <MaxButton onClick={onBack} className="p-2 sm:px-4 flex items-center bg-gray-800 text-white shadow-max-cyan">
          <ArrowLeft className="mr-2 w-4 h-4 sm:w-5 sm:h-5" /> Back
        </MaxButton>
        <h1 className="text-2xl sm:text-4xl font-black text-white text-shadow-magenta uppercase">Health & Econ</h1>
      </div>

      <MaxCard accent="cyan" className="w-full mb-6 p-4 flex flex-col md:flex-row gap-4 justify-between items-center bg-max-bg/95">
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setActiveTab('table')} className={`px-4 py-2 font-bold uppercase rounded-xl border-2 ${activeTab === 'table' ? 'bg-accent-cyan text-max-bg border-accent-cyan' : 'bg-transparent text-white border-white/20'}`}>Table</button>
          <button onClick={() => setActiveTab('scatter')} className={`px-4 py-2 font-bold uppercase rounded-xl border-2 ${activeTab === 'scatter' ? 'bg-accent-magenta text-max-bg border-accent-magenta' : 'bg-transparent text-white border-white/20'}`}>Wages vs Health</button>
          <button onClick={() => setActiveTab('bar')} className={`px-4 py-2 font-bold uppercase rounded-xl border-2 ${activeTab === 'bar' ? 'bg-accent-yellow text-max-bg border-accent-yellow' : 'bg-transparent text-white border-white/20'}`}>Physicians</button>
          <button onClick={() => setActiveTab('popScatter')} className={`px-4 py-2 font-bold uppercase rounded-xl border-2 ${activeTab === 'popScatter' ? 'bg-green-400 text-max-bg border-green-400' : 'bg-transparent text-white border-white/20'}`}>Labor vs Tax</button>
          <button onClick={() => setActiveTab('urbanScatter')} className={`px-4 py-2 font-bold uppercase rounded-xl border-2 ${activeTab === 'urbanScatter' ? 'bg-blue-400 text-max-bg border-blue-400' : 'bg-transparent text-white border-white/20'}`}>Urban vs Unemp</button>
        </div>
        {activeTab === 'table' && (
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search country..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-max-muted border-2 border-white/20 text-white rounded-xl pl-10 pr-4 py-2 font-bold focus:border-accent-cyan outline-none"
            />
          </div>
        )}
      </MaxCard>

      <MaxCard accent={activeTab === 'scatter' ? "magenta" : activeTab === "bar" ? "yellow" : activeTab === "popScatter" ? "green" : activeTab === "urbanScatter" ? "blue" : "cyan"} className="w-full bg-max-bg/95 p-4 sm:p-6 min-h-[500px]">
        {activeTab === 'table' && (
          <div className="w-full overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full text-left text-sm text-white">
              <thead className="bg-white/5 text-xs uppercase font-bold sticky top-0">
                <tr>
                  <th className="px-4 py-3">Country</th>
                  <th className="px-2 py-3 whitespace-nowrap">Min Wage ($)</th>
                  <th className="px-2 py-3 whitespace-nowrap">OOP Health (%)</th>
                  <th className="px-2 py-3 whitespace-nowrap">Physicians/1k</th>
                  <th className="px-2 py-3 whitespace-nowrap">Population</th>
                  <th className="px-2 py-3 whitespace-nowrap">Labor Force (%)</th>
                  <th className="px-2 py-3 whitespace-nowrap">Tax Rev (%)</th>
                  <th className="px-2 py-3 whitespace-nowrap">Total Tax (%)</th>
                  <th className="px-2 py-3 whitespace-nowrap">Unemp (%)</th>
                  <th className="px-2 py-3 whitespace-nowrap">Urban Pop</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((row) => (
                  <tr key={row.Country} className="border-b border-white/5 hover:bg-white/5">
                    <td className="px-4 py-3 font-bold text-accent-cyan whitespace-nowrap">{row.Country}</td>
                    <td className="px-2 py-3 opacity-90">{row.minimumWage !== null ? `$${row.minimumWage.toFixed(2)}` : '-'}</td>
                    <td className="px-2 py-3 opacity-90">{row.outOfPocketHealth !== null ? `${row.outOfPocketHealth.toFixed(1)}%` : '-'}</td>
                    <td className="px-2 py-3 opacity-90">{row.physiciansPerThousand !== null ? row.physiciansPerThousand.toFixed(2) : '-'}</td>
                    <td className="px-2 py-3 opacity-90">{row.population !== null ? row.population.toLocaleString() : '-'}</td>
                    <td className="px-2 py-3 opacity-90">{row.laborForceParticipation !== null ? `${row.laborForceParticipation.toFixed(1)}%` : '-'}</td>
                    <td className="px-2 py-3 opacity-90">{row.taxRevenue !== null ? `${row.taxRevenue.toFixed(1)}%` : '-'}</td>
                    <td className="px-2 py-3 opacity-90">{row.totalTaxRate !== null ? `${row.totalTaxRate.toFixed(1)}%` : '-'}</td>
                    <td className="px-2 py-3 opacity-90">{row.unemploymentRate !== null ? `${row.unemploymentRate.toFixed(1)}%` : '-'}</td>
                    <td className="px-2 py-3 opacity-90">{row.urbanPopulation !== null ? row.urbanPopulation.toLocaleString() : '-'}</td>
                  </tr>
                ))}
                {filteredData.length === 0 && (
                  <tr>
                    <td colSpan={10} className="px-4 py-8 text-center text-white/50">No results found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'scatter' && (
          <div className="w-full h-[600px] flex flex-col">
            <h2 className="text-xl font-bold text-white mb-4">Minimum Wage vs. Out of Pocket Health Expenditure</h2>
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 40, left: 20 }}>
                <CartesianGrid stroke="#333" strokeDasharray="3 3" />
                <XAxis 
                  type="number" 
                  dataKey="minimumWage" 
                  name="Minimum Wage" 
                  unit="$" 
                  stroke="#aaa"
                  label={{ value: 'Minimum Wage ($)', position: 'insideBottom', offset: -25, fill: '#aaa' }}
                />
                <YAxis 
                  type="number" 
                  dataKey="outOfPocketHealth" 
                  name="Out of Pocket" 
                  unit="%" 
                  stroke="#aaa"
                  label={{ value: 'Out of Pocket Health Exp. (%)', angle: -90, position: 'insideLeft', offset: -10, fill: '#aaa' }}
                />
                <RechartsTooltip cursor={{ strokeDasharray: '3 3' }} 
                  content={({ payload }) => {
                    if (payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-max-muted border border-accent-magenta p-3 rounded-lg shadow-lg">
                          <p className="font-bold text-white mb-1">{data.Country}</p>
                          <p className="text-sm text-white/80">Min Wage: ${data.minimumWage}</p>
                          <p className="text-sm text-white/80">Out of Pocket: {data.outOfPocketHealth}%</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter name="Countries" data={validScatterData} fill="#FF3AF2" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        )}

        {activeTab === 'bar' && (
          <div className="w-full h-[600px] flex flex-col">
            <h2 className="text-xl font-bold text-white mb-4">Top 30 Countries by Physicians per Thousand</h2>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sortedBarData} margin={{ top: 20, right: 20, bottom: 80, left: 20 }}>
                <CartesianGrid stroke="#333" strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="Country" 
                  stroke="#aaa"
                  angle={-45}
                  textAnchor="end"
                  interval={0}
                  tick={{ fontSize: 10 }}
                />
                <YAxis stroke="#aaa" />
                <RechartsTooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                   content={({ payload }) => {
                    if (payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-max-muted border border-accent-yellow p-3 rounded-lg shadow-lg">
                          <p className="font-bold text-white mb-1">{data.Country}</p>
                          <p className="text-sm text-accent-yellow font-black">{data.physiciansPerThousand} physicians / 1k</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="physiciansPerThousand" fill="#FFE600" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {activeTab === 'popScatter' && (
          <div className="w-full h-[600px] flex flex-col">
            <h2 className="text-xl font-bold text-white mb-4">Labor Force Participation vs. Tax Revenue</h2>
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 40, left: 20 }}>
                <CartesianGrid stroke="#333" strokeDasharray="3 3" />
                <XAxis 
                  type="number" 
                  dataKey="laborForceParticipation" 
                  name="Labor Force" 
                  unit="%" 
                  stroke="#aaa"
                  label={{ value: 'Labor Force Participation (%)', position: 'insideBottom', offset: -25, fill: '#aaa' }}
                />
                <YAxis 
                  type="number" 
                  dataKey="taxRevenue" 
                  name="Tax Rev" 
                  unit="%" 
                  stroke="#aaa"
                  label={{ value: 'Tax Revenue (%)', angle: -90, position: 'insideLeft', offset: -10, fill: '#aaa' }}
                />
                <RechartsTooltip cursor={{ strokeDasharray: '3 3' }} 
                  content={({ payload }) => {
                    if (payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-max-muted border border-green-400 p-3 rounded-lg shadow-lg">
                          <p className="font-bold text-white mb-1">{data.Country}</p>
                          <p className="text-sm text-white/80">Pop: {data.population?.toLocaleString()}</p>
                          <p className="text-sm text-white/80">Labor Force: {data.laborForceParticipation}%</p>
                          <p className="text-sm text-white/80">Tax Revenue: {data.taxRevenue}%</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter name="Countries" data={validPopScatterData} fill="#4ADE80" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        )}

        {activeTab === 'urbanScatter' && (
          <div className="w-full h-[600px] flex flex-col">
            <h2 className="text-xl font-bold text-white mb-4">Urban Population vs. Unemployment Rate</h2>
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 40, left: 20 }}>
                <CartesianGrid stroke="#333" strokeDasharray="3 3" />
                <XAxis 
                  type="number" 
                  dataKey="urbanPopulation" 
                  name="Urban Pop" 
                  stroke="#aaa"
                  scale="log"
                  domain={['auto', 'auto']}
                  label={{ value: 'Urban Population (Log Scale)', position: 'insideBottom', offset: -25, fill: '#aaa' }}
                  tickFormatter={(val) => {
                    if (val >= 1000000) return (val / 1000000).toFixed(0) + 'M';
                    if (val >= 1000) return (val / 1000).toFixed(0) + 'k';
                    return val;
                  }}
                />
                <YAxis 
                  type="number" 
                  dataKey="unemploymentRate" 
                  name="Unemployment" 
                  unit="%" 
                  stroke="#aaa"
                  label={{ value: 'Unemployment Rate (%)', angle: -90, position: 'insideLeft', offset: -10, fill: '#aaa' }}
                />
                <RechartsTooltip cursor={{ strokeDasharray: '3 3' }} 
                  content={({ payload }) => {
                    if (payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-max-muted border border-blue-400 p-3 rounded-lg shadow-lg">
                          <p className="font-bold text-white mb-1">{data.Country}</p>
                          <p className="text-sm text-white/80">Urban Pop: {data.urbanPopulation?.toLocaleString()}</p>
                          <p className="text-sm text-white/80">Unemployment: {data.unemploymentRate}%</p>
                          <p className="text-sm text-white/80">Total Tax: {data.totalTaxRate !== null ? data.totalTaxRate + '%' : 'N/A'}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter name="Countries" data={validUrbanScatterData} fill="#60A5FA" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        )}
      </MaxCard>
    </div>
  );
}
