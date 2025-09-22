import React, { createContext, useState, useCallback, useEffect, useMemo, useContext, ReactNode } from 'react';
import { ProductsData, GlobalCommoditiesData, PredictionData } from '../types';
import { productsData as initialProductsData, globalCommoditiesData as initialGlobalCommoditiesData } from '../data';
import { predictionData as initialPredictionData } from '../data/prediction';
import { fetchUpdatedMarketData } from '../services/marketService';

interface MarketDataContextType {
    productsData: ProductsData;
    globalCommoditiesData: GlobalCommoditiesData;
    predictionData: PredictionData;
    lastUpdated: Date;
    isLoading: boolean;
    refreshData: () => void;
}

const MarketDataContext = createContext<MarketDataContextType | undefined>(undefined);

export const MarketDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [data, setData] = useState({
        productsData: initialProductsData,
        globalCommoditiesData: initialGlobalCommoditiesData,
        predictionData: initialPredictionData,
    });
    const [isLoading, setIsLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(new Date());

    const refreshData = useCallback(async () => {
        setIsLoading(true);
        try {
            // Pass the current state to the simulation function to get incremental updates
            const updatedData = await fetchUpdatedMarketData(data.productsData, data.globalCommoditiesData, data.predictionData);
            setData(updatedData);
            setLastUpdated(new Date());
        } catch (error) {
            console.error("Failed to fetch market data:", error);
            // In a real app, you might set an error state here
        } finally {
            setIsLoading(false);
        }
    }, [data.productsData, data.globalCommoditiesData, data.predictionData]);

    useEffect(() => {
        // Initial data "fetch" on component mount
        refreshData();
        // The rule can be disabled because refreshData's dependencies are stable objects from state,
        // and we only want this to run once on mount.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const value = useMemo(() => ({
        ...data,
        isLoading,
        lastUpdated,
        refreshData,
    }), [data, isLoading, lastUpdated, refreshData]);

    return (
        <MarketDataContext.Provider value={value}>
            {children}
        </MarketDataContext.Provider>
    );
};

export const useMarketData = (): MarketDataContextType => {
    const context = useContext(MarketDataContext);
    if (context === undefined) {
        throw new Error('useMarketData must be used within a MarketDataProvider');
    }
    return context;
};
