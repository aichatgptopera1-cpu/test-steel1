// FIX: Import React to make React types available for JSX namespace augmentation.
import React from 'react';

export enum Page {
  DASHBOARD,
  ANALYSIS,
  PRICES,
  NEWS,
  PREMIUM_ANALYSIS,
  PREDICTION,
}

export interface TechnicalInfo {
    signal: 'buy' | 'sell' | 'hold';
    rsi: number;
    support: number;
    resistance: number;
    summary: string;
}

export interface ProductPriceRow {
  spec: string; 
  dimension: string | number;
  price: number;
}

export interface ProductData {
  title: string;
  price: number;
  change: number;
  weeklyChange: number;
  monthlyChange: number;
  volume: number;
  analysis: string[];
  strategy: string[];
  chartData: number[];
  unit: string;
  source: string;
  lastUpdated: string;
  technicalInfo: TechnicalInfo;
  detailedPrices: ProductPriceRow[];
}

export interface GlobalCommodityData {
    title: string;
    chartData: number[];
    unit: string;
    source: string;
    lastUpdated: string;
    technicalInfo: TechnicalInfo;
}

export interface ProductsData {
    [key: string]: ProductData;
}

export interface GlobalCommoditiesData {
    [key: string]: GlobalCommodityData;
}

export type NewsCategory = 'global-market' | 'iran-companies' | 'raw-materials' | 'policy' | 'financial' | 'logistics' | 'educational' | 'clean-energy';
export type NewsCountry = 'all' | 'iran' | 'china' | 'eu' | 'usa' | 'india';
export type NewsType = 'all' | 'economic' | 'political' | 'technical';
export type NewsTimeFilter = 'all' | '24h' | '7d' | '30d';

export interface Article {
  id: number;
  title: string;
  summary: string;
  content: string;
  source: string;
  credibility: 'high' | 'medium' | 'low';
  publishedAt: Date;
  category: NewsCategory;
  country: Omit<NewsCountry, 'all'>;
  type: Omit<NewsType, 'all'>;
}

// Types for Premium Analysis Page
export interface Expert {
  name: string;
  credentials: string;
}

export interface ReportContent {
  standard: string;
  brief: string;
}

export type ReportType = 'daily' | 'weekly' | 'monthly' | 'technical' | 'fundamental';

export interface PremiumReport {
  id: number;
  title: string;
  type: ReportType;
  author: Expert;
  publishedAt: Date;
  content: ReportContent;
  keyTakeaways: string[];
  chartData?: any; // Define a more specific type if chart structure is known
  downloadUrl: string;
}

// Types for AI Prediction Page
export interface PredictionDataPoint {
  name: string;
  low: number;
  mid: number;
  high: number;
  actual?: number;
}

export interface PredictionInputFactor {
  name: string;
  impact: string;
  direction: 'up' | 'down';
  description: string;
}

export interface PredictionScenario {
  condition: string;
  outcome: string;
  description: string;
}

export interface PredictionResult {
  accuracy: number;
  forecast: PredictionDataPoint[];
  factors: PredictionInputFactor[];
  scenarios: PredictionScenario[];
}

export interface WhatIfVariable {
    id: 'dollar' | 'oil' | 'ironOre' | 'cokingCoal';
    name: string;
    value: number;
    min: number;
    max: number;
    step: number;
    unit: string;
}

export interface ChatMessage {
    id: number;
    sender: 'user' | 'ai';
    text: string;
    sources?: { uri: string; title: string }[];
}


export type PredictionData = Record<string, Record<string, PredictionResult>>;
export type WhatIfData = Record<string, WhatIfVariable>;