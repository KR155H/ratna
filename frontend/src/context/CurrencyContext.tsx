import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Currency {
  code: string;
  name: string;
  symbol: string;
  flag: string;
}

interface ExchangeRates {
  [key: string]: number;
}

interface CurrencyContextType {
  selectedCurrency: Currency;
  currencies: Currency[];
  exchangeRates: ExchangeRates;
  loading: boolean;
  error: string | null;
  changeCurrency: (currency: Currency) => void;
  convertPrice: (price: number, fromCurrency?: string) => number;
  formatPrice: (price: number, currency?: Currency) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

interface CurrencyProviderProps {
  children: ReactNode;
}

// Top 10 currencies with their details
const CURRENCIES: Currency[] = [
  { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
  { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺' },
  { code: 'GBP', name: 'British Pound', symbol: '£', flag: '🇬🇧' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', flag: '🇯🇵' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', flag: '🇦🇺' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', flag: '🇨🇦' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', flag: '🇨🇭' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', flag: '🇨🇳' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', flag: '🇮🇳' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', flag: '🇸🇬' },
];

export const CurrencyProvider: React.FC<CurrencyProviderProps> = ({ children }) => {
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(CURRENCIES[0]); // Default to USD
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch exchange rates from API
  const fetchExchangeRates = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Using exchangerate-api.com (free tier allows 1500 requests/month)
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
      
      if (!response.ok) {
        throw new Error('Failed to fetch exchange rates');
      }
      
      const data = await response.json();
      setExchangeRates(data.rates);
      
      console.log('✅ Exchange rates updated:', data.rates);
    } catch (error) {
      console.error('❌ Error fetching exchange rates:', error);
      setError('Failed to fetch current exchange rates');
      
      // Fallback rates if API fails
      setExchangeRates({
        USD: 1,
        EUR: 0.85,
        GBP: 0.73,
        JPY: 110,
        AUD: 1.35,
        CAD: 1.25,
        CHF: 0.92,
        CNY: 6.45,
        INR: 74.5,
        SGD: 1.35
      });
    } finally {
      setLoading(false);
    }
  };

  // Load saved currency from localStorage
  useEffect(() => {
    const savedCurrency = localStorage.getItem('selectedCurrency');
    if (savedCurrency) {
      try {
        const currency = JSON.parse(savedCurrency);
        const validCurrency = CURRENCIES.find(c => c.code === currency.code);
        if (validCurrency) {
          setSelectedCurrency(validCurrency);
        }
      } catch (error) {
        console.error('Error parsing saved currency:', error);
      }
    }
  }, []);

  // Fetch exchange rates on mount and every 5 minutes
  useEffect(() => {
    fetchExchangeRates();
    
    // Update rates every 5 minutes
    const interval = setInterval(fetchExchangeRates, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const changeCurrency = (currency: Currency) => {
    setSelectedCurrency(currency);
    localStorage.setItem('selectedCurrency', JSON.stringify(currency));
    console.log('💱 Currency changed to:', currency.code);
  };

  const convertPrice = (price: number, fromCurrency: string = 'USD'): number => {
    if (!exchangeRates[selectedCurrency.code] || !exchangeRates[fromCurrency]) {
      return price; // Return original price if rates not available
    }

    // Convert from source currency to USD, then to target currency
    const usdPrice = fromCurrency === 'USD' ? price : price / exchangeRates[fromCurrency];
    const convertedPrice = selectedCurrency.code === 'USD' ? usdPrice : usdPrice * exchangeRates[selectedCurrency.code];
    
    return Math.round(convertedPrice * 100) / 100; // Round to 2 decimal places
  };

  const formatPrice = (price: number, currency: Currency = selectedCurrency): string => {
    const convertedPrice = convertPrice(price);
    
    // Format based on currency
    switch (currency.code) {
      case 'JPY':
      case 'CNY':
        return `${currency.symbol}${Math.round(convertedPrice).toLocaleString()}`;
      case 'INR':
        return `${currency.symbol}${convertedPrice.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
      default:
        return `${currency.symbol}${convertedPrice.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    }
  };

  const value = {
    selectedCurrency,
    currencies: CURRENCIES,
    exchangeRates,
    loading,
    error,
    changeCurrency,
    convertPrice,
    formatPrice,
  };

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
};