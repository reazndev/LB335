// GameViewModel - MVVM Architecture Implementation
// Manages game state, business logic, and data binding

// import AsyncStorage from 'react-native';
import { GameState, ItemCategory, PurchaseItem } from '../models';
import { BaseViewModel } from './BaseViewModel';

export class GameViewModel extends BaseViewModel {
  private gameState: GameState;
  private availableItems: PurchaseItem[] = [
    // Food & Drinks
    {
      id: 'big_mac',
      name: 'Big Mac',
      price: 2,
      category: ItemCategory.FOOD,
      description: 'McDonald\'s signature burger',
    },
    {
      id: 'flip_flops',
      name: 'Flip Flops',
      price: 3,
      category: ItemCategory.CLOTHING,
      description: 'Simple summer footwear',
    },
    {
      id: 'coca_cola_pack',
      name: 'Coca-Cola Pack',
      price: 5,
      category: ItemCategory.FOOD,
      description: '12-pack of Coca-Cola',
    },
    {
      id: 'movie_ticket',
      name: 'Movie Ticket',
      price: 12,
      category: ItemCategory.ENTERTAINMENT,
      description: 'Cinema ticket',
    },
    {
      id: 'book',
      name: 'Book',
      price: 15,
      category: ItemCategory.EDUCATION,
      description: 'Paperback novel',
    },
    {
      id: 'lobster_dinner',
      name: 'Lobster Dinner',
      price: 45,
      category: ItemCategory.FOOD,
      description: 'Fine dining experience',
    },
    {
      id: 'video_game',
      name: 'Video Game',
      price: 60,
      category: ItemCategory.ENTERTAINMENT,
      description: 'AAA video game',
    },
    {
      id: 'amazon_echo',
      name: 'Amazon Echo',
      price: 99,
      category: ItemCategory.TECHNOLOGY,
      description: 'Smart speaker',
    },
    {
      id: 'year_of_netflix',
      name: 'Year of Netflix',
      price: 100,
      category: ItemCategory.ENTERTAINMENT,
      description: 'Annual subscription',
    },
    {
      id: 'air_jordans',
      name: 'Air Jordans',
      price: 125,
      category: ItemCategory.CLOTHING,
      description: 'Nike basketball shoes',
    },
    {
      id: 'airpods',
      name: 'Airpods',
      price: 199,
      category: ItemCategory.TECHNOLOGY,
      description: 'Wireless earbuds',
    },
    {
      id: 'gaming_console',
      name: 'Gaming Console',
      price: 299,
      category: ItemCategory.TECHNOLOGY,
      description: 'PlayStation or Xbox',
    },
    {
      id: 'drone',
      name: 'Drone',
      price: 350,
      category: ItemCategory.TECHNOLOGY,
      description: 'Camera drone',
    },
    {
      id: 'smartphone',
      name: 'Smartphone',
      price: 699,
      category: ItemCategory.TECHNOLOGY,
      description: 'Latest iPhone',
    },
    {
      id: 'bike',
      name: 'Bike',
      price: 800,
      category: ItemCategory.TRANSPORTATION,
      description: 'Mountain bike',
    },
    {
      id: 'kitten',
      name: 'Kitten',
      price: 1500,
      category: ItemCategory.PETS,
      description: 'Adorable kitten',
    },
    {
      id: 'puppy',
      name: 'Puppy',
      price: 1500,
      category: ItemCategory.PETS,
      description: 'Golden retriever puppy',
    },
    {
      id: 'auto_rickshaw',
      name: 'Auto Rickshaw',
      price: 2300,
      category: ItemCategory.TRANSPORTATION,
      description: 'Three-wheeled vehicle',
    },
    {
      id: 'horse',
      name: 'Horse',
      price: 2500,
      category: ItemCategory.ANIMALS,
      description: 'Thoroughbred horse',
    },
    {
      id: 'acre_of_farmland',
      name: 'Acre of Farmland',
      price: 3000,
      category: ItemCategory.REAL_ESTATE,
      description: 'Agricultural land',
    },
    {
      id: 'designer_handbag',
      name: 'Designer Handbag',
      price: 5500,
      category: ItemCategory.LUXURY,
      description: 'Louis Vuitton bag',
    },
    {
      id: 'hot_tub',
      name: 'Hot Tub',
      price: 6000,
      category: ItemCategory.HOME,
      description: 'Jacuzzi hot tub',
    },
    {
      id: 'luxury_wine',
      name: 'Luxury Wine',
      price: 7000,
      category: ItemCategory.LUXURY,
      description: 'Vintage wine bottle',
    },
    {
      id: 'diamond_ring',
      name: 'Diamond Ring',
      price: 10000,
      category: ItemCategory.LUXURY,
      description: '1-carat diamond ring',
    },
    {
      id: 'jet_ski',
      name: 'Jet Ski',
      price: 12000,
      category: ItemCategory.RECREATION,
      description: 'Personal watercraft',
    },
    {
      id: 'rolex',
      name: 'Rolex',
      price: 15000,
      category: ItemCategory.LUXURY,
      description: 'Luxury watch',
    },
    {
      id: 'ford_f150',
      name: 'Ford F-150',
      price: 30000,
      category: ItemCategory.VEHICLES,
      description: 'Pickup truck',
    },
    {
      id: 'tesla',
      name: 'Tesla',
      price: 75000,
      category: ItemCategory.VEHICLES,
      description: 'Electric car',
    },
    {
      id: 'monster_truck',
      name: 'Monster Truck',
      price: 150000,
      category: ItemCategory.VEHICLES,
      description: 'Giant truck',
    },
    {
      id: 'ferrari',
      name: 'Ferrari',
      price: 250000,
      category: ItemCategory.VEHICLES,
      description: 'Italian sports car',
    },
    {
      id: 'single_family_home',
      name: 'Single Family Home',
      price: 300000,
      category: ItemCategory.REAL_ESTATE,
      description: 'Suburban house',
    },
    {
      id: 'lamborghini_aventador',
      name: 'Lamborghini Aventador',
      price: 500000,
      category: ItemCategory.VEHICLES,
      description: 'An Italian supercar with a V12 engine',
    },
    {
      id: 'gold_bar',
      name: 'Gold Bar',
      price: 700000,
      category: ItemCategory.INVESTMENT,
      description: '1kg gold bar',
    },
    {
      id: 'mcdonalds_franchise',
      name: 'McDonalds Franchise',
      price: 1500000,
      category: ItemCategory.BUSINESS,
      description: 'Fast food franchise',
    },
    {
      id: 'superbowl_ad',
      name: 'Superbowl Ad',
      price: 5250000,
      category: ItemCategory.MARKETING,
      description: '30-second commercial',
    },
    {
      id: 'yacht',
      name: 'Yacht',
      price: 7500000,
      category: ItemCategory.VEHICLES,
      description: 'A 50-meter luxury yacht',
    },
    {
      id: 'm1_abrams',
      name: 'M1 Abrams',
      price: 8000000,
      category: ItemCategory.MILITARY,
      description: 'Main battle tank',
    },
    {
      id: 'formula_1_car',
      name: 'Formula 1 Car',
      price: 15000000,
      category: ItemCategory.VEHICLES,
      description: 'Racing car',
    },
    {
      id: 'apache_helicopter',
      name: 'Apache Helicopter',
      price: 31000000,
      category: ItemCategory.MILITARY,
      description: 'Attack helicopter',
    },
    {
      id: 'mansion',
      name: 'Mansion',
      price: 45000000,
      category: ItemCategory.REAL_ESTATE,
      description: 'Luxury estate',
    },
    {
      id: 'make_a_movie',
      name: 'Make a Movie',
      price: 100000000,
      category: ItemCategory.ENTERTAINMENT,
      description: 'Hollywood production',
    },
    {
      id: 'boeing_747',
      name: 'Boeing 747',
      price: 148000000,
      category: ItemCategory.VEHICLES,
      description: 'Jumbo jet',
    },
    {
      id: 'mona_lisa',
      name: 'Mona Lisa',
      price: 780000000,
      category: ItemCategory.ART,
      description: 'Priceless artwork',
    },
    {
      id: 'skyscraper',
      name: 'Skyscraper',
      price: 850000000,
      category: ItemCategory.REAL_ESTATE,
      description: 'Downtown office building',
    },
    {
      id: 'cruise_ship',
      name: 'Cruise Ship',
      price: 930000000,
      category: ItemCategory.VEHICLES,
      description: 'Luxury cruise liner',
    },
    {
      id: 'nba_team',
      name: 'NBA Team',
      price: 2120000000,
      category: ItemCategory.BUSINESS,
      description: 'Professional basketball team',
    },
  ];

  constructor() {
    super();
    this.gameState = {
      currentBudget: 100000000000, // 100 billion (like Bill Gates)
      purchasedItems: [],
      totalSpent: 0,
      gameCompleted: false,
      startTime: new Date(),
    };
  }

  // MVVM Pattern Methods - Enhanced for proper data binding

  /**
   * Get current game state (immutable copy)
   */
  getGameState(): GameState {
    return { ...this.gameState };
  }

  /**
   * Get all available items (immutable copy)
   */
  getAllItems(): PurchaseItem[] {
    return [...this.availableItems];
  }

  /**
   * Get items by category
   */
  getItemsByCategory(category: ItemCategory): PurchaseItem[] {
    return this.availableItems.filter(item => item.category === category);
  }

  /**
   * Get current item for single-item view (deprecated, keeping for compatibility)
   */
  getCurrentItem(): PurchaseItem {
    return this.availableItems[0];
  }

  /**
   * Purchase an item with proper MVVM notifications
   */
  purchaseItem(item: PurchaseItem): boolean {
    if (this.gameState.currentBudget >= item.price) {
      this.gameState.currentBudget -= item.price;
      this.gameState.totalSpent += item.price;
      this.gameState.purchasedItems.push({ ...item });

      if (this.gameState.currentBudget === 0) {
        this.gameState.gameCompleted = true;
        this.gameState.endTime = new Date();
      }

      this.saveGameState();
      this.notifyChange(); // MVVM: Notify subscribers of state change
      return true;
    }
    return false;
  }

  /**
   * Sell an item with proper MVVM notifications
   */
  sellItem(item: PurchaseItem): boolean {
    const ownedItemIndex = this.gameState.purchasedItems.findIndex(
      purchasedItem => purchasedItem.id === item.id
    );
    
    if (ownedItemIndex !== -1) {
      this.gameState.currentBudget += item.price;
      this.gameState.totalSpent -= item.price;
      this.gameState.purchasedItems.splice(ownedItemIndex, 1);
      this.gameState.gameCompleted = false;
      
      this.saveGameState();
      this.notifyChange(); // MVVM: Notify subscribers of state change
      return true;
    }
    return false;
  }

  /**
   * Get count of owned items by ID
   */
  getOwnedItemCount(itemId: string): number {
    return this.gameState.purchasedItems.filter(item => item.id === itemId).length;
  }

  /**
   * Check if item can be afforded
   */
  canAffordItem(item: PurchaseItem): boolean {
    return this.gameState.currentBudget >= item.price;
  }

  /**
   * Get remaining budget
   */
  getRemainingBudget(): number {
    return this.gameState.currentBudget;
  }

  /**
   * Get total spent
   */
  getTotalSpent(): number {
    return this.gameState.totalSpent;
  }

  /**
   * Check if game is completed
   */
  isGameCompleted(): boolean {
    return this.gameState.gameCompleted;
  }

  /**
   * Get random item for shake-to-buy feature
   */
  getRandomItem(): PurchaseItem {
    const randomIndex = Math.floor(Math.random() * this.availableItems.length);
    return { ...this.availableItems[randomIndex] };
  }

  /**
   * Reset game with proper MVVM notifications
   */
  resetGame(): void {
    this.gameState = {
      currentBudget: 100000000000, // 100 billion
      purchasedItems: [],
      totalSpent: 0,
      gameCompleted: false,
      startTime: new Date(),
    };
    this.saveGameState();
    this.notifyChange(); // MVVM: Notify subscribers of state change
  }

  /**
   * Get game statistics for analytics
   */
  getGameAnalytics(): {
    totalItems: number;
    uniqueCategories: string[];
    averageItemPrice: number;
    mostExpensiveOwned?: PurchaseItem;
    completionPercentage: number;
  } {
    const totalItems = this.gameState.purchasedItems.length;
    const uniqueCategories = [...new Set(this.gameState.purchasedItems.map(item => item.category))];
    const averageItemPrice = totalItems > 0 
      ? this.gameState.purchasedItems.reduce((sum, item) => sum + item.price, 0) / totalItems 
      : 0;
    const mostExpensiveOwned = this.gameState.purchasedItems.reduce((max, item) => 
      max && max.price > item.price ? max : item, null as PurchaseItem | null) || undefined;
    const completionPercentage = (this.gameState.totalSpent / 100000000000) * 100;

    return {
      totalItems,
      uniqueCategories,
      averageItemPrice,
      mostExpensiveOwned,
      completionPercentage
    };
  }

  // Data Persistence Methods (Enhanced for MVVM)

  /**
   * Save game state to persistent storage
   */
  async saveGameState(): Promise<void> {
    try {
      // const jsonValue = JSON.stringify(this.gameState);
      // await AsyncStorage.setItem('@gameState', jsonValue);
      console.log('Game state saved (temporarily disabled)');
    } catch (e) {
      console.error('Failed to save game state', e);
      // Could emit error event for UI to handle
    }
  }

  /**
   * Load game state from persistent storage
   */
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
      //   this.notifyChange(); // MVVM: Notify subscribers of loaded state
      // }
      console.log('Game state loaded (temporarily disabled)');
    } catch (e) {
      console.error('Failed to load game state', e);
    }
  }
}
