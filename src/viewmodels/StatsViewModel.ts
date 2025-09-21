import { GameState, PurchaseItem, Statistics } from '../models';
import { BaseViewModel } from './BaseViewModel';

export class StatsViewModel extends BaseViewModel {
  private statistics: Statistics = {
    gamesPlayed: 0,
    averageItemsPerGame: 0,
    totalMoneySpent: 0,
    totalItemsPurchased: 0,
  };


  getStats(): Statistics {
    return { ...this.statistics };
  }

  async updateStats(gameResult: GameState): Promise<void> {
    this.statistics.gamesPlayed += 1;
    this.statistics.totalItemsPurchased += gameResult.purchasedItems.length;
    this.statistics.totalMoneySpent += gameResult.totalSpent;

    
    if (gameResult.gameCompleted && gameResult.endTime) {
      const completionTime = (gameResult.endTime.getTime() - gameResult.startTime.getTime()) / 1000;
      if (!this.statistics.fastestCompletion || completionTime < this.statistics.fastestCompletion) {
        this.statistics.fastestCompletion = completionTime;
      }
    }

    
    this.statistics.averageItemsPerGame = this.statistics.totalItemsPurchased / this.statistics.gamesPlayed;

    
    this.updateFavoriteCategory(gameResult.purchasedItems);

    
    this.updateMostExpensiveItem(gameResult.purchasedItems);

    await this.saveStatistics();
    this.notifyChange(); 
  }

  async updateItemPurchase(item: PurchaseItem): Promise<void> {
    this.statistics.totalItemsPurchased += 1;
    this.statistics.totalMoneySpent += item.price;
    
    
    if (!this.statistics.mostExpensiveItem || item.price > this.statistics.mostExpensiveItem.price) {
      this.statistics.mostExpensiveItem = { ...item };
    }

    await this.saveStatistics();
    this.notifyChange(); 
  }

  getFormattedStats(): {
    gamesPlayed: string;
    fastestCompletion: string;
    averageItemsPerGame: string;
    favoriteCategory: string;
    totalMoneySpent: string;
    totalItemsPurchased: string;
    mostExpensiveItem: string;
  } {
    return {
      gamesPlayed: this.statistics.gamesPlayed.toString(),
      fastestCompletion: this.statistics.fastestCompletion 
        ? `${Math.round(this.statistics.fastestCompletion)}s` 
        : 'N/A',
      averageItemsPerGame: this.statistics.averageItemsPerGame.toFixed(1),
      favoriteCategory: this.statistics.favoriteCategory || 'N/A',
      totalMoneySpent: `$${this.statistics.totalMoneySpent.toLocaleString()}`,
      totalItemsPurchased: this.statistics.totalItemsPurchased.toString(),
      mostExpensiveItem: this.statistics.mostExpensiveItem?.name || 'N/A'
    };
  }

  getAnalytics(): {
    averageSpendingPerGame: number;
    completionRate: number;
    averageGameDuration: number;
  } {
    const averageSpendingPerGame = this.statistics.gamesPlayed > 0 
      ? this.statistics.totalMoneySpent / this.statistics.gamesPlayed 
      : 0;
    
    
    
    const completionRate = 0; 
    
    const averageGameDuration = this.statistics.fastestCompletion || 0;

    return {
      averageSpendingPerGame,
      completionRate,
      averageGameDuration
    };
  }

  async resetStats(): Promise<void> {
    this.statistics = {
      gamesPlayed: 0,
      averageItemsPerGame: 0,
      totalMoneySpent: 0,
      totalItemsPurchased: 0,
    };
    
    await this.saveStatistics();
    this.notifyChange(); 
  }

  private updateFavoriteCategory(purchasedItems: PurchaseItem[]): void {
    const categoryCount: { [key: string]: number } = {};
    
    purchasedItems.forEach(item => {
      categoryCount[item.category] = (categoryCount[item.category] || 0) + 1;
    });

    if (Object.keys(categoryCount).length > 0) {
      const favorite = Object.keys(categoryCount).reduce((a, b) =>
        categoryCount[a] > categoryCount[b] ? a : b
      );
      this.statistics.favoriteCategory = favorite;
    }
  }

  private updateMostExpensiveItem(purchasedItems: PurchaseItem[]): void {
    const mostExpensive = purchasedItems.reduce((max, item) => 
      max && max.price > item.price ? max : item, 
      null as PurchaseItem | null
    );

    if (mostExpensive && (!this.statistics.mostExpensiveItem || 
        mostExpensive.price > this.statistics.mostExpensiveItem.price)) {
      this.statistics.mostExpensiveItem = { ...mostExpensive };
    }
  }

  async saveStatistics(): Promise<void> {
    try {
      
      
      console.log('Statistics saved (temporarily disabled)');
    } catch (e) {
      console.error('Failed to save statistics', e);
    }
  }

  async loadStatistics(): Promise<void> {
    try {
      console.log('Statistics loaded (temporarily disabled)');
    } catch (e) {
      console.error('Failed to load statistics', e);
    }
  }
}
