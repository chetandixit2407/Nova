import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  Scale,
  Calculator as CalculatorIcon,
  RefreshCw,
  ArrowRightLeft
} from 'lucide-react';
import { exchangeRateService, UnitCategory } from '../../../services/exchangeRateService';
import { GlassCalculator } from '../GlassCalculator';

export const ConvertersView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'currency' | 'units' | 'calc'>('currency');

  // Currency Converter State
  const [amount, setAmount] = useState<number>(100);
  const [fromCurr, setFromCurr] = useState<string>('USD');
  const [toCurr, setToCurr] = useState<string>('EUR');
  const [ratesData, setRatesData] = useState(exchangeRateService.getRates());
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Unit Converter State
  const [unitCategory, setUnitCategory] = useState<UnitCategory>('length');
  const [unitValue, setUnitValue] = useState<number>(10);
  const [fromUnit, setFromUnit] = useState<string>('km');
  const [toUnit, setToUnit] = useState<string>('mi');

  useEffect(() => {
    const unsub = exchangeRateService.subscribe(() => {
      setRatesData(exchangeRateService.getRates());
    });
    return unsub;
  }, []);

  const handleRefreshRates = async () => {
    setIsRefreshing(true);
    await exchangeRateService.fetchLiveRates(fromCurr);
    setIsRefreshing(false);
  };

  const currencyResult = exchangeRateService.convertCurrency(amount, fromCurr, toCurr);
  const unitResult = exchangeRateService.convertUnit(unitValue, unitCategory, fromUnit, toUnit);

  const availableUnits = exchangeRateService.getUnitsForCategory(unitCategory);

  return (
    <div className="flex flex-col h-[106px] px-2.5 py-1 justify-between text-xs select-none">
      {/* Sub Tabs */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1 bg-black/20 p-0.5 rounded-lg border border-white/10">
          <button
            onClick={() => setActiveTab('currency')}
            className={`px-2 py-0.5 rounded-md text-[10px] transition-all flex items-center gap-1 ${
              activeTab === 'currency'
                ? 'bg-emerald-500/30 text-emerald-200 font-medium'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <DollarSign className="w-2.5 h-2.5" /> Currency
          </button>
          <button
            onClick={() => setActiveTab('units')}
            className={`px-2 py-0.5 rounded-md text-[10px] transition-all flex items-center gap-1 ${
              activeTab === 'units'
                ? 'bg-sky-500/30 text-sky-200 font-medium'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Scale className="w-2.5 h-2.5" /> Units
          </button>
          <button
            onClick={() => setActiveTab('calc')}
            className={`px-2 py-0.5 rounded-md text-[10px] transition-all flex items-center gap-1 ${
              activeTab === 'calc'
                ? 'bg-amber-500/30 text-amber-200 font-medium'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <CalculatorIcon className="w-2.5 h-2.5" /> Calculator
          </button>
        </div>

        {activeTab === 'currency' && (
          <button
            onClick={handleRefreshRates}
            title="Refresh live exchange rates"
            className="text-[9px] text-slate-400 hover:text-white flex items-center gap-1"
          >
            <RefreshCw className={`w-2.5 h-2.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Updated {new Date(ratesData.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </button>
        )}
      </div>

      {/* Main Conversion View */}
      <div className="flex-1 flex items-center overflow-hidden py-1">
        {activeTab === 'currency' && (
          <div className="w-full flex items-center justify-between gap-2 bg-white/5 border border-white/10 rounded-lg p-2">
            <div className="flex items-center gap-1.5 flex-1">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value) || 0)}
                className="w-16 bg-white/10 text-white font-mono text-center py-0.5 rounded border border-white/15 focus:outline-none focus:border-emerald-400 text-xs"
              />
              <select
                value={fromCurr}
                onChange={(e) => setFromCurr(e.target.value)}
                className="bg-white/10 text-slate-200 text-[10px] rounded px-1 py-0.5 border border-white/10 focus:outline-none"
              >
                {Object.keys(ratesData.rates).map((c) => (
                  <option key={c} value={c} className="bg-slate-800 text-white">{c}</option>
                ))}
              </select>

              <ArrowRightLeft className="w-3 h-3 text-slate-400 shrink-0" />

              <select
                value={toCurr}
                onChange={(e) => setToCurr(e.target.value)}
                className="bg-white/10 text-slate-200 text-[10px] rounded px-1 py-0.5 border border-white/10 focus:outline-none"
              >
                {Object.keys(ratesData.rates).map((c) => (
                  <option key={c} value={c} className="bg-slate-800 text-white">{c}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col items-end">
              <span className="text-base font-bold text-emerald-400 font-mono tracking-wide">
                {currencyResult.result.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {toCurr}
              </span>
              <span className="text-[8px] text-slate-400">
                1 {fromCurr} = {currencyResult.rate.toFixed(4)} {toCurr}
              </span>
            </div>
          </div>
        )}

        {activeTab === 'units' && (
          <div className="w-full flex items-center justify-between gap-2 bg-white/5 border border-white/10 rounded-lg p-2">
            <div className="flex items-center gap-1.5 flex-1">
              <select
                value={unitCategory}
                onChange={(e) => {
                  const cat = e.target.value as UnitCategory;
                  setUnitCategory(cat);
                  const units = exchangeRateService.getUnitsForCategory(cat);
                  setFromUnit(units[0]?.id || 'm');
                  setToUnit(units[1]?.id || 'km');
                }}
                className="bg-white/10 text-slate-200 text-[10px] rounded px-1 py-0.5 border border-white/10 focus:outline-none capitalize"
              >
                {(['length', 'weight', 'temperature', 'data', 'speed'] as const).map((cat) => (
                  <option key={cat} value={cat} className="bg-slate-800 text-white">{cat}</option>
                ))}
              </select>

              <input
                type="number"
                value={unitValue}
                onChange={(e) => setUnitValue(Number(e.target.value) || 0)}
                className="w-14 bg-white/10 text-white font-mono text-center py-0.5 rounded border border-white/15 focus:outline-none focus:border-sky-400 text-xs"
              />

              <select
                value={fromUnit}
                onChange={(e) => setFromUnit(e.target.value)}
                className="bg-white/10 text-slate-200 text-[10px] rounded px-1 py-0.5 border border-white/10 focus:outline-none"
              >
                {availableUnits.map((u) => (
                  <option key={u.id} value={u.id} className="bg-slate-800 text-white">{u.symbol}</option>
                ))}
              </select>

              <span className="text-slate-400 text-xs">=</span>

              <select
                value={toUnit}
                onChange={(e) => setToUnit(e.target.value)}
                className="bg-white/10 text-slate-200 text-[10px] rounded px-1 py-0.5 border border-white/10 focus:outline-none"
              >
                {availableUnits.map((u) => (
                  <option key={u.id} value={u.id} className="bg-slate-800 text-white">{u.symbol}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col items-end">
              <span className="text-base font-bold text-sky-300 font-mono">
                {unitResult.toFixed(2)}
              </span>
            </div>
          </div>
        )}

        {activeTab === 'calc' && (
          <div className="w-full h-full flex items-center justify-center">
            <GlassCalculator />
          </div>
        )}
      </div>
    </div>
  );
};
