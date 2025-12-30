import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Diamond {
  _id: string;
  name: string;
  carat: number;
  cut: string;
  color: string;
  clarity: string;
  price: number;
  image: string;
  // Add other necessary fields
}

interface CompareContextType {
  compareList: Diamond[];
  addToCompare: (diamond: Diamond) => void;
  removeFromCompare: (diamondId: string) => void;
  clearCompare: () => void;
  isInCompare: (diamondId: string) => boolean;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export const CompareProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [compareList, setCompareList] = useState<Diamond[]>([]);

  const addToCompare = (diamond: Diamond) => {
    if (compareList.length >= 4) {
      alert("You can compare up to 4 diamonds at a time.");
      return;
    }
    if (!compareList.find(d => d._id === diamond._id)) {
      setCompareList([...compareList, diamond]);
    }
  };

  const removeFromCompare = (diamondId: string) => {
    setCompareList(compareList.filter(d => d._id !== diamondId));
  };

  const clearCompare = () => {
    setCompareList([]);
  };

  const isInCompare = (diamondId: string) => {
    return compareList.some(d => d._id === diamondId);
  };

  return (
    <CompareContext.Provider value={{ compareList, addToCompare, removeFromCompare, clearCompare, isInCompare }}>
      {children}
    </CompareContext.Provider>
  );
};

export const useCompare = () => {
  const context = useContext(CompareContext);
  if (context === undefined) {
    throw new Error('useCompare must be used within a CompareProvider');
  }
  return context;
};
