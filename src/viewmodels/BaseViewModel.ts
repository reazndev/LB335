import { ViewModelBase } from '../models';

export abstract class BaseViewModel implements ViewModelBase {
  private subscribers: (() => void)[] = [];
  
  subscribe(callback: () => void): () => void {
    this.subscribers.push(callback);
    
    return () => {
      const index = this.subscribers.indexOf(callback);
      if (index > -1) {
        this.subscribers.splice(index, 1);
      }
    };
  }

  notifyChange(): void {
    this.subscribers.forEach(callback => callback());
  }

  dispose(): void {
    this.subscribers = [];
  }
}
