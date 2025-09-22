export const generateMonthlyData = (startValue: number, endValue: number, points: number): number[] => {
    const data: number[] = [];
    for (let i = 0; i < points; i++) {
        const progress = i / (points - 1);
        const linearValue = startValue + (endValue - startValue) * progress;
        const volatility = Math.sin((i / points) * Math.PI * 6) * ((endValue - startValue) * 0.08); // More frequent waves
        const noise = (Math.random() - 0.5) * (endValue * 0.03); // Daily noise
        data.push(Math.round(linearValue + volatility + noise));
    }
    data[points - 1] = endValue;
    return data;
};

export const calculateSMA = (data: number[], period: number): (number | null)[] => {
    const sma: (number | null)[] = Array(data.length).fill(null);
    for (let i = period - 1; i < data.length; i++) {
        const sum = data.slice(i - period + 1, i + 1).reduce((acc, val) => acc + val, 0);
        sma[i] = Math.round(sum / period);
    }
    return sma;
};
