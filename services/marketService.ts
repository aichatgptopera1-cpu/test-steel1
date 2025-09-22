import { ProductsData, GlobalCommoditiesData, PredictionData, PredictionDataPoint, ProductPriceRow } from '../types';

// Helper to generate a random fluctuation
const fluctuate = (value: number, percent: number): number => {
    const change = (Math.random() - 0.5) * 2 * (percent / 100);
    return value * (1 + change);
};

// Helper to update chart data array (keeps it at a fixed length)
const updateChartData = (oldData: number[], newPrice: number): number[] => {
    const newData = [...oldData.slice(1), Math.round(newPrice)];
    return newData;
};

/**
 * Simulates fetching updated market data from an API.
 * @param currentProducts - The current state of domestic products data.
 * @param currentGlobal - The current state of global commodities data.
 * @param currentPredictions - The current state of prediction data.
 * @returns A Promise resolving to the updated market data.
 */
export const fetchUpdatedMarketData = async (
    currentProducts: ProductsData, 
    currentGlobal: GlobalCommoditiesData,
    currentPredictions: PredictionData
): Promise<{ productsData: ProductsData; globalCommoditiesData: GlobalCommoditiesData, predictionData: PredictionData }> => {
    
    // Simulate network delay of 1.5 seconds
    await new Promise(res => setTimeout(res, 1500));

    const newProductsData: ProductsData = JSON.parse(JSON.stringify(currentProducts));
    const newGlobalData: GlobalCommoditiesData = JSON.parse(JSON.stringify(currentGlobal));
    const newPredictionData: PredictionData = JSON.parse(JSON.stringify(currentPredictions));

    let basePriceChanges: {[key: string]: number} = {};

    // Update domestic products
    for (const key in newProductsData) {
        const product = newProductsData[key];
        const oldPrice = product.price;
        const newPrice = fluctuate(oldPrice, 1.5); // Fluctuate main price by +/- 1.5%
        
        const changePercent = (newPrice - oldPrice) / oldPrice;
        basePriceChanges[key] = changePercent;

        product.price = Math.round(newPrice);
        product.change = parseFloat((changePercent * 100).toFixed(2));
        product.weeklyChange = parseFloat((fluctuate(product.weeklyChange, 5)).toFixed(2));
        product.monthlyChange = parseFloat((fluctuate(product.monthlyChange, 10)).toFixed(2));
        product.chartData = updateChartData(product.chartData, newPrice);
        
        // Update detailed prices proportionally
        if (product.detailedPrices) {
            product.detailedPrices = product.detailedPrices.map((row: ProductPriceRow) => ({
                ...row,
                price: Math.round(row.price * (1 + changePercent)),
            }));
        }
        
        // Simple technical info update
        product.technicalInfo.support = Math.round(fluctuate(product.technicalInfo.support, 1));
        product.technicalInfo.resistance = Math.round(fluctuate(product.technicalInfo.resistance, 1));
        product.technicalInfo.rsi = Math.max(15, Math.min(85, fluctuate(product.technicalInfo.rsi, 5)));
    }

    // Update global commodities
    for (const key in newGlobalData) {
        const commodity = newGlobalData[key];
        const newPrice = fluctuate(commodity.chartData[commodity.chartData.length - 1], 2.0); // Fluctuate by +/- 2.0%
        commodity.chartData = updateChartData(commodity.chartData, newPrice);

        // Simple technical info update
        commodity.technicalInfo.support = Math.round(fluctuate(commodity.technicalInfo.support, 1.5));
        commodity.technicalInfo.resistance = Math.round(fluctuate(commodity.technicalInfo.resistance, 1.5));
        commodity.technicalInfo.rsi = Math.max(15, Math.min(85, fluctuate(commodity.technicalInfo.rsi, 8)));
    }

    // Update predictions based on base price changes
    for (const productKey in newPredictionData) {
        if (basePriceChanges[productKey]) {
            const changeFactor = 1 + basePriceChanges[productKey];
            for (const horizonKey in newPredictionData[productKey]) {
                const prediction = newPredictionData[productKey][horizonKey];
                prediction.forecast = prediction.forecast.map((point: PredictionDataPoint) => ({
                    ...point,
                    low: point.actual ? point.actual : Math.round(point.low * changeFactor),
                    mid: point.actual ? point.actual : Math.round(point.mid * changeFactor),
                    high: point.actual ? point.actual : Math.round(point.high * changeFactor),
                }));
            }
        }
    }

    return { productsData: newProductsData, globalCommoditiesData: newGlobalData, predictionData: newPredictionData };
};
