import AsyncStorage from '@react-native-async-storage/async-storage';
import { GameState, Statistics } from '../models';

export class StatsViewModel {
  private statistics: Statistics = {
    gamesPlayed: 0,
    averageItemsPerGame: 0,
  };

  async updateStats(gameResult: GameState): Promise<void> {
    this.statistics.gamesPlayed += 1;

    if (gameResult.gameCompleted && gameResult.endTime) {
      const completionTime = (gameResult.endTime.getTime() - gameResult.startTime.getTime()) / 1000;
      if (!this.statistics.fastestCompletion || completionTime < this.statistics.fastestCompletion) {
        this.statistics.fastestCompletion = completionTime;
      }
    }

    this.statistics.averageItemsPerGame = gameResult.purchasedItems.length / this.statistics.gamesPlayed;

    // Calculate favorite category
    const categoryCount: { [key: string]: number } = {};
    gameResult.purchasedItems.forEach(item => {
      categoryCount[item.category] = (categoryCount[item.category] || 0) + 1;
    });
    const favorite = Object.keys(categoryCount).reduce((a, b) =>
      categoryCount[a] > categoryCount[b] ? a : b, ''
    );
    this.statistics.favoriteCategory = favorite;

    await this.saveStatistics();
  }

  getStats(): Statistics {
    return this.statistics;
  }

  async saveStatistics(): Promise<void> {
    try {
      const jsonValue = JSON.stringify(this.statistics);
      await AsyncStorage.setItem('@statistics', jsonValue);
    } catch (e) {
      console.error('Failed to save statistics', e);
    }
  }

  async loadStatistics(): Promise<void> {
    try {
      const jsonValue = await AsyncStorage.getItem('@statistics');
      if (jsonValue != null) {
        this.statistics = JSON.parse(jsonValue);
      }
    } catch (e) {
      console.error('Failed to load statistics', e);
    }
  }
}
