// Data models for the Billion Dollar Challenge app - MVVM Architecture

export interface PurchaseItem {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  imageUrl?: string;
}

export interface GameState {
  currentBudget: number;
  purchasedItems: PurchaseItem[];
  totalSpent: number;
  gameCompleted: boolean;
  startTime: Date;
  endTime?: Date;
}

export interface Statistics {
  gamesPlayed: number;
  fastestCompletion?: number; // in seconds
  averageItemsPerGame: number;
  favoriteCategory?: string;
  totalMoneySpent: number;
  mostExpensiveItem?: PurchaseItem;
  totalItemsPurchased: number;
}

// New interfaces for MVVM architecture
export interface ViewModelBase {
  subscribe(callback: () => void): () => void;
  notifyChange(): void;
}

export interface GameStateUpdate {
  type: 'PURCHASE' | 'SELL' | 'RESET' | 'LOAD';
  item?: PurchaseItem;
  newState: GameState;
}

export interface StatisticsUpdate {
  type: 'GAME_COMPLETED' | 'ITEM_PURCHASED' | 'RESET' | 'LOAD';
  gameState?: GameState;
  newStats: Statistics;
}

// Categories for better organization
export enum ItemCategory {
  FOOD = 'food',
  CLOTHING = 'clothing',
  ENTERTAINMENT = 'entertainment',
  TECHNOLOGY = 'technology',
  TRANSPORTATION = 'transportation',
  PETS = 'pets',
  ANIMALS = 'animals',
  REAL_ESTATE = 'real_estate',
  LUXURY = 'luxury',
  HOME = 'home',
  RECREATION = 'recreation',
  VEHICLES = 'vehicles',
  INVESTMENT = 'investment',
  BUSINESS = 'business',
  MARKETING = 'marketing',
  MILITARY = 'military',
  ART = 'art',
  EDUCATION = 'education'
}

// Settings model
export interface AppSettings {
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  theme: 'light' | 'dark' | 'auto';
  language: string;
  accessibility: {
    largeText: boolean;
    highContrast: boolean;
    screenReader: boolean;
  };
}

export const defaultSettings: AppSettings = {
  soundEnabled: true,
  vibrationEnabled: true,
  theme: 'auto',
  language: 'en',
  accessibility: {
    largeText: false,
    highContrast: false,
    screenReader: false,
  },
};
