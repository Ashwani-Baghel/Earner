"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

export interface CountryOption {
  code: string;
  name: string;
  currency: string;
  locale: string;
}

export const COUNTRIES: CountryOption[] = [
  { code: "US", name: "United States", currency: "USD", locale: "en-US" },
  { code: "GB", name: "United Kingdom", currency: "GBP", locale: "en-GB" },
  { code: "IN", name: "India", currency: "INR", locale: "en-IN" },
  { code: "EU", name: "Eurozone", currency: "EUR", locale: "en-IE" },
  { code: "AU", name: "Australia", currency: "AUD", locale: "en-AU" },
  { code: "CA", name: "Canada", currency: "CAD", locale: "en-CA" },
];

interface CurrencyContextType {
  selectedCountry: CountryOption;
  setSelectedCountry: (countryCode: string) => void;
  formatPrice: (amountInINR: number) => string;
  isLoadingRates: boolean;
}

const defaultCountry = COUNTRIES.find(c => c.code === "IN") || COUNTRIES[0];

const CurrencyContext = createContext<CurrencyContextType>({
  selectedCountry: defaultCountry,
  setSelectedCountry: () => {},
  formatPrice: (amount) => `₹${Math.round(amount).toLocaleString("en-IN")}`,
  isLoadingRates: true,
});

export const useCurrency = () => useContext(CurrencyContext);

// Fallback rates in case the API fails
const FALLBACK_RATES: Record<string, number> = {
  INR: 1,
  USD: 0.012, // 1 / 83.5
  GBP: 0.0094,
  EUR: 0.011,
  AUD: 0.018,
  CAD: 0.016,
};

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [selectedCountry, setSelectedCountryState] = useState<CountryOption>(defaultCountry);
  const [rates, setRates] = useState<Record<string, number>>(FALLBACK_RATES);
  const [isLoadingRates, setIsLoadingRates] = useState(true);

  // Initialize from localStorage — default to India (INR) if no preference saved
  useEffect(() => {
    const savedCountryCode = localStorage.getItem("preferred_country") || "IN";
    const country = COUNTRIES.find((c) => c.code === savedCountryCode);
    if (country) setSelectedCountryState(country);
  }, []);

  // Fetch real-time rates
  useEffect(() => {
    let isMounted = true;
    
    async function fetchRates() {
      try {
        const res = await fetch("https://open.er-api.com/v6/latest/INR");
        if (!res.ok) throw new Error("Failed to fetch rates");
        const data = await res.json();
        
        if (isMounted && data && data.rates) {
          setRates(data.rates);
        }
      } catch (error) {
        console.error("Error fetching exchange rates, using fallbacks:", error);
      } finally {
        if (isMounted) setIsLoadingRates(false);
      }
    }

    fetchRates();

    return () => {
      isMounted = false;
    };
  }, []);

  const setSelectedCountry = useCallback((countryCode: string) => {
    const country = COUNTRIES.find((c) => c.code === countryCode);
    if (country) {
      setSelectedCountryState(country);
      localStorage.setItem("preferred_country", countryCode);
    }
  }, []);

  const formatPrice = useCallback((amountInINR: number) => {
    const rate = rates[selectedCountry.currency] || 1;
    const convertedAmount = amountInINR * rate;
    
    return new Intl.NumberFormat(selectedCountry.locale, {
      style: "currency",
      currency: selectedCountry.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(convertedAmount);
  }, [rates, selectedCountry]);

  return (
    <CurrencyContext.Provider value={{ selectedCountry, setSelectedCountry, formatPrice, isLoadingRates }}>
      {children}
    </CurrencyContext.Provider>
  );
}
