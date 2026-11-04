/**
 * Real-time Exchange Rate & Unit Conversion Service
 * Provides live currency exchange rates (with caching & timestamps) and comprehensive unit conversion.
 */

export interface CurrencyRateData {
  base: string;
  date: string;
  timestamp: number;
  rates: Record<string, number>;
}

export type UnitCategory = 'length' | 'weight' | 'temperature' | 'data' | 'speed' | 'area';

export interface UnitDefinition {
  id: string;
  name: string;
  symbol: string;
  toBase: (val: number) => number;
  fromBase: (val: number) => number;
}

const FALLBACK_RATES: Record<string, number> = {
  USD: 1.0,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 154.2,
  CAD: 1.36,
  AUD: 1.52,
  CHF: 0.88,
  CNY: 7.23,
  INR: 83.45,
  SGD: 1.34,
  AED: 3.67,
  BRL: 5.15,
  KRW: 1370.0,
  MXN: 16.7
};

class ExchangeRateService {
  private cache: CurrencyRateData = {
    base: 'USD',
    date: new Date().toISOString().split('T')[0],
    timestamp: Date.now(),
    rates: FALLBACK_RATES
  };

  private isFetching = false;
  private lastFetchTime = 0;
  private subscribers: Array<() => void> = [];

  constructor() {
    this.fetchLiveRates();
  }

  public subscribe(cb: () => void): () => void {
    this.subscribers.push(cb);
    return () => {
      this.subscribers = this.subscribers.filter((s) => s !== cb);
    };
  }

  private notify() {
    this.subscribers.forEach((cb) => {
      try {
        cb();
      } catch (e) {
        console.error('Subscriber error in exchange rate service', e);
      }
    });
  }

  public async fetchLiveRates(baseCurrency: string = 'USD'): Promise<CurrencyRateData> {
    const now = Date.now();
    // Cache for 15 minutes
    if (now - this.lastFetchTime < 15 * 60 * 1000 && this.cache.base === baseCurrency) {
      return this.cache;
    }

    if (this.isFetching) return this.cache;
    this.isFetching = true;

    try {
      const res = await fetch(`https://api.frankfurter.app/latest?from=${baseCurrency}`);
      if (res.ok) {
        const data = await res.json();
        this.cache = {
          base: data.base || baseCurrency,
          date: data.date || new Date().toISOString().split('T')[0],
          timestamp: Date.now(),
          rates: {
            ...FALLBACK_RATES,
            [baseCurrency]: 1.0,
            ...(data.rates || {})
          }
        };
        this.lastFetchTime = Date.now();
        this.notify();
      }
    } catch {
      // Offline fallback: update timestamp and keep fallback rates
      this.cache.timestamp = Date.now();
    } finally {
      this.isFetching = false;
    }

    return this.cache;
  }

  public getRates(): CurrencyRateData {
    return this.cache;
  }

  public convertCurrency(amount: number, from: string, to: string): { result: number; rate: number; timestamp: number } {
    if (from === to) {
      return { result: amount, rate: 1.0, timestamp: this.cache.timestamp };
    }

    const rates = this.cache.rates;
    const fromRate = rates[from] || 1;
    const toRate = rates[to] || 1;

    // Rate relative to base currency
    const effectiveRate = toRate / fromRate;
    const result = amount * effectiveRate;

    return {
      result,
      rate: effectiveRate,
      timestamp: this.cache.timestamp
    };
  }

  // --- UNIT CONVERSIONS ---
  public convertUnit(val: number, category: UnitCategory, fromUnit: string, toUnit: string): number {
    const units = this.getUnitsForCategory(category);
    const fromDef = units.find((u) => u.id === fromUnit);
    const toDef = units.find((u) => u.id === toUnit);

    if (!fromDef || !toDef) return val;
    if (fromUnit === toUnit) return val;

    const baseVal = fromDef.toBase(val);
    return toDef.fromBase(baseVal);
  }

  public getUnitsForCategory(category: UnitCategory): UnitDefinition[] {
    switch (category) {
      case 'length':
        return [
          { id: 'm', name: 'Meters', symbol: 'm', toBase: (v) => v, fromBase: (v) => v },
          { id: 'km', name: 'Kilometers', symbol: 'km', toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
          { id: 'cm', name: 'Centimeters', symbol: 'cm', toBase: (v) => v / 100, fromBase: (v) => v * 100 },
          { id: 'mm', name: 'Millimeters', symbol: 'mm', toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
          { id: 'mi', name: 'Miles', symbol: 'mi', toBase: (v) => v * 1609.344, fromBase: (v) => v / 1609.344 },
          { id: 'ft', name: 'Feet', symbol: 'ft', toBase: (v) => v * 0.3048, fromBase: (v) => v / 0.3048 },
          { id: 'in', name: 'Inches', symbol: 'in', toBase: (v) => v * 0.0254, fromBase: (v) => v / 0.0254 }
        ];

      case 'weight':
        return [
          { id: 'kg', name: 'Kilograms', symbol: 'kg', toBase: (v) => v, fromBase: (v) => v },
          { id: 'g', name: 'Grams', symbol: 'g', toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
          { id: 'mg', name: 'Milligrams', symbol: 'mg', toBase: (v) => v / 1000000, fromBase: (v) => v * 1000000 },
          { id: 'lb', name: 'Pounds', symbol: 'lb', toBase: (v) => v * 0.45359237, fromBase: (v) => v / 0.45359237 },
          { id: 'oz', name: 'Ounces', symbol: 'oz', toBase: (v) => v * 0.028349523, fromBase: (v) => v / 0.028349523 }
        ];

      case 'temperature':
        return [
          { id: 'c', name: 'Celsius', symbol: '°C', toBase: (v) => v, fromBase: (v) => v },
          { id: 'f', name: 'Fahrenheit', symbol: '°F', toBase: (v) => (v - 32) * (5 / 9), fromBase: (v) => (v * 9) / 5 + 32 },
          { id: 'k', name: 'Kelvin', symbol: 'K', toBase: (v) => v - 273.15, fromBase: (v) => v + 273.15 }
        ];

      case 'data':
        return [
          { id: 'mb', name: 'Megabytes', symbol: 'MB', toBase: (v) => v, fromBase: (v) => v },
          { id: 'kb', name: 'Kilobytes', symbol: 'KB', toBase: (v) => v / 1024, fromBase: (v) => v * 1024 },
          { id: 'gb', name: 'Gigabytes', symbol: 'GB', toBase: (v) => v * 1024, fromBase: (v) => v / 1024 },
          { id: 'tb', name: 'Terabytes', symbol: 'TB', toBase: (v) => v * 1024 * 1024, fromBase: (v) => v / (1024 * 1024) },
          { id: 'b', name: 'Bytes', symbol: 'B', toBase: (v) => v / (1024 * 1024), fromBase: (v) => v * 1024 * 1024 }
        ];

      case 'speed':
        return [
          { id: 'kmh', name: 'Km/Hour', symbol: 'km/h', toBase: (v) => v, fromBase: (v) => v },
          { id: 'mph', name: 'Miles/Hour', symbol: 'mph', toBase: (v) => v * 1.60934, fromBase: (v) => v / 1.60934 },
          { id: 'ms', name: 'Meters/Sec', symbol: 'm/s', toBase: (v) => v * 3.6, fromBase: (v) => v / 3.6 },
          { id: 'knot', name: 'Knots', symbol: 'kn', toBase: (v) => v * 1.852, fromBase: (v) => v / 1.852 }
        ];

      case 'area':
        return [
          { id: 'sqm', name: 'Square Meters', symbol: 'm²', toBase: (v) => v, fromBase: (v) => v },
          { id: 'sqft', name: 'Square Feet', symbol: 'ft²', toBase: (v) => v * 0.092903, fromBase: (v) => v / 0.092903 },
          { id: 'acre', name: 'Acres', symbol: 'ac', toBase: (v) => v * 4046.86, fromBase: (v) => v / 4046.86 },
          { id: 'sqkm', name: 'Square Km', symbol: 'km²', toBase: (v) => v * 1000000, fromBase: (v) => v / 1000000 }
        ];
    }
  }
}

export const exchangeRateService = new ExchangeRateService();
