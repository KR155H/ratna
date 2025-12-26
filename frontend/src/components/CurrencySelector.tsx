import React, { useState } from 'react';
import { ChevronDown, RefreshCw, Globe } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';

const CurrencySelector: React.FC = () => {
  const { selectedCurrency, currencies, loading, error, changeCurrency } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
        disabled={loading}
      >
        <Globe className="w-4 h-4 text-gray-500" />
        <span className="text-lg">{selectedCurrency.flag}</span>
        <span className="font-medium text-gray-700">{selectedCurrency.code}</span>
        {loading ? (
          <RefreshCw className="w-4 h-4 text-gray-400 animate-spin" />
        ) : (
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-xl z-50 py-2">
          <div className="px-4 py-2 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">Select Currency</h3>
            {error && (
              <p className="text-xs text-red-600 mt-1">{error}</p>
            )}
          </div>
          
          <div className="max-h-64 overflow-y-auto">
            {currencies.map((currency) => (
              <button
                key={currency.code}
                onClick={() => {
                  changeCurrency(currency);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors ${
                  selectedCurrency.code === currency.code ? 'bg-amber-50 border-r-2 border-amber-500' : ''
                }`}
              >
                <span className="text-xl">{currency.flag}</span>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-gray-900">{currency.code}</p>
                  <p className="text-xs text-gray-500">{currency.name}</p>
                </div>
                <span className="text-sm font-medium text-gray-600">{currency.symbol}</span>
                {selectedCurrency.code === currency.code && (
                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                )}
              </button>
            ))}
          </div>
          
          <div className="px-4 py-2 border-t border-gray-100 bg-gray-50">
            <p className="text-xs text-gray-500 text-center">
              {loading ? 'Updating rates...' : 'Rates updated every 5 minutes'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CurrencySelector;