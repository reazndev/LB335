// Base ViewModel class implementing MVVM pattern with reactive updates

import { ViewModelBase } from '../models';

export abstract class BaseViewModel implements ViewModelBase {
  private subscribers: (() => void)[] = [];

  /**
   * Subscribe to changes in this ViewModel
   * @param callback Function to call when ViewModel state changes
   * @returns Unsubscribe function
   */
  subscribe(callback: () => void): () => void {
    this.subscribers.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.subscribers.indexOf(callback);
      if (index > -1) {
        this.subscribers.splice(index, 1);
      }
    };
  }

  /**
   * Notify all subscribers that the ViewModel state has changed
   */
  notifyChange(): void {
    this.subscribers.forEach(callback => callback());
  }

  /**
   * Cleanup resources when ViewModel is destroyed
   */
  dispose(): void {
    this.subscribers = [];
  }
}
