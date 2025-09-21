// import AsyncStorage from 'react-native';
import { GameState, PurchaseItem } from '../models';

export class GameViewModel {
  private gameState: GameState;
  private availableItems: PurchaseItem[] = [
    {
      id: 'lamborghini_aventador',
      name: 'Lamborghini Aventador',
      price: 500000,
      category: 'vehicles',
      description: 'An Italian supercar with a V12 engine',
    },
    {
      id: 'yacht',
      name: 'Luxury Yacht',
      price: 75000000,
      category: 'vehicles',
      description: 'A 50-meter luxury yacht',
    },
    // Add more items as needed
  ];

  constructor() {
    this.gameState = {
      currentBudget: 1000000000, // 1 billion
      purchasedItems: [],
      totalSpent: 0,
      gameCompleted: false,
      startTime: new Date(),
    };
  }

  getGameState(): GameState {
    return this.gameState;
  }

  getCurrentItem(): PurchaseItem {
    // For simplicity, return first item; in real app, cycle through
    return this.availableItems[0];
  }

  purchaseItem(item: PurchaseItem): boolean {
    if (this.gameState.currentBudget >= item.price) {
      this.gameState.currentBudget -= item.price;
      this.gameState.totalSpent += item.price;
      this.gameState.purchasedItems.push(item);

      if (this.gameState.currentBudget === 0) {
        this.gameState.gameCompleted = true;
        this.gameState.endTime = new Date();
      }

      this.saveGameState();
      return true;
    }
    return false;
  }

  getRandomItem(): PurchaseItem {
    const randomIndex = Math.floor(Math.random() * this.availableItems.length);
    return this.availableItems[randomIndex];
  }

  resetGame(): void {
    this.gameState = {
      currentBudget: 1000000000,
      purchasedItems: [],
      totalSpent: 0,
      gameCompleted: false,
      startTime: new Date(),
    };
    this.saveGameState();
  }

  async saveGameState(): Promise<void> {
    try {
      // const jsonValue = JSON.stringify(this.gameState);
      // await AsyncStorage.setItem('@gameState', jsonValue);
      console.log('Game state saved (temporarily disabled)');
    } catch (e) {
      console.error('Failed to save game state', e);
    }
  }

  async loadGameState(): Promise<void> {
    try {
      // const jsonValue = await AsyncStorage.getItem('@gameState');
      // if (jsonValue != null) {
      //   this.gameState = JSON.parse(jsonValue);
      //   // Convert date strings back to Date objects
      //   this.gameState.startTime = new Date(this.gameState.startTime);
      //   if (this.gameState.endTime) {
      //     this.gameState.endTime = new Date(this.gameState.endTime);
      //   }
      // }
      console.log('Game state loaded (temporarily disabled)');
    } catch (e) {
      console.error('Failed to load game state', e);
    }
  }
}
