// StatsViewModel - MVVM Architecture Implementation
// Manages statistics data, analytics, and data binding

// import AsyncStorage from '@react-native-async-storage/async-storage';
import { GameState, PurchaseItem, Statistics } from '../models';
import { BaseViewModel } from './BaseViewModel';

export class StatsViewModel extends BaseViewModel {
  private statistics: Statistics = {
    gamesPlayed: 0,
    averageItemsPerGame: 0,
    totalMoneySpent: 0,
    totalItemsPurchased: 0,
  };

  // MVVM Pattern Methods

  /**
   * Get current statistics (immutable copy)
   */
  getStats(): Statistics {
    return { ...this.statistics };
  }

  /**
   * Update statistics with game result and notify subscribers
   */
  async updateStats(gameResult: GameState): Promise<void> {
    this.statistics.gamesPlayed += 1;
    this.statistics.totalItemsPurchased += gameResult.purchasedItems.length;
    this.statistics.totalMoneySpent += gameResult.totalSpent;

    // Calculate completion time for completed games
    if (gameResult.gameCompleted && gameResult.endTime) {
      const completionTime = (gameResult.endTime.getTime() - gameResult.startTime.getTime()) / 1000;
      if (!this.statistics.fastestCompletion || completionTime < this.statistics.fastestCompletion) {
        this.statistics.fastestCompletion = completionTime;
      }
    }

    // Update average items per game
    this.statistics.averageItemsPerGame = this.statistics.totalItemsPurchased / this.statistics.gamesPlayed;

    // Update favorite category
    this.updateFavoriteCategory(gameResult.purchasedItems);

    // Update most expensive item
    this.updateMostExpensiveItem(gameResult.purchasedItems);

    await this.saveStatistics();
    this.notifyChange(); // MVVM: Notify subscribers of updated stats
  }

  /**
   * Update statistics when a single item is purchased
   */
  async updateItemPurchase(item: PurchaseItem): Promise<void> {
    this.statistics.totalItemsPurchased += 1;
    this.statistics.totalMoneySpent += item.price;
    
    // Update most expensive item if necessary
    if (!this.statistics.mostExpensiveItem || item.price > this.statistics.mostExpensiveItem.price) {
      this.statistics.mostExpensiveItem = { ...item };
    }

    await this.saveStatistics();
    this.notifyChange(); // MVVM: Notify subscribers
  }

  /**
   * Get formatted statistics for display
   */
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

  /**
   * Get analytics data for advanced statistics
   */
  getAnalytics(): {
    averageSpendingPerGame: number;
    completionRate: number;
    averageGameDuration: number;
  } {
    const averageSpendingPerGame = this.statistics.gamesPlayed > 0 
      ? this.statistics.totalMoneySpent / this.statistics.gamesPlayed 
      : 0;
    
    // For completion rate, we'd need to track attempted vs completed games
    // For now, using a simple metric based on games played
    const completionRate = 0; // TODO: Implement proper completion tracking
    
    const averageGameDuration = this.statistics.fastestCompletion || 0;

    return {
      averageSpendingPerGame,
      completionRate,
      averageGameDuration
    };
  }

  /**
   * Reset all statistics
   */
  async resetStats(): Promise<void> {
    this.statistics = {
      gamesPlayed: 0,
      averageItemsPerGame: 0,
      totalMoneySpent: 0,
      totalItemsPurchased: 0,
    };
    
    await this.saveStatistics();
    this.notifyChange(); // MVVM: Notify subscribers of reset
  }

  // Private helper methods

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

  // Data Persistence Methods

  /**
   * Save statistics to persistent storage
   */
  async saveStatistics(): Promise<void> {
    try {
      // const jsonValue = JSON.stringify(this.statistics);
      // await AsyncStorage.setItem('@statistics', jsonValue);
      console.log('Statistics saved (temporarily disabled)');
    } catch (e) {
      console.error('Failed to save statistics', e);
    }
  }

  /**
   * Load statistics from persistent storage
   */
  async loadStatistics(): Promise<void> {
    try {
      // const jsonValue = await AsyncStorage.getItem('@statistics');
      // if (jsonValue != null) {
      //   this.statistics = JSON.parse(jsonValue);
      //   this.notifyChange(); // MVVM: Notify subscribers of loaded data
      // }
      console.log('Statistics loaded (temporarily disabled)');
    } catch (e) {
      console.error('Failed to load statistics', e);
    }
  }
}
