// Data models for the Billion Dollar Challenge app

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
}
