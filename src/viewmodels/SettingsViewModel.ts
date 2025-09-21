import { AppSettings, defaultSettings } from '../models';
import { BaseViewModel } from './BaseViewModel';

export class SettingsViewModel extends BaseViewModel {
  private settings: AppSettings = { ...defaultSettings };


  getSettings(): AppSettings {
    return { ...this.settings };
  }

  async setSoundEnabled(enabled: boolean): Promise<void> {
    this.settings.soundEnabled = enabled;
    await this.saveSettings();
    this.notifyChange(); 
  }

  async setVibrationEnabled(enabled: boolean): Promise<void> {
    this.settings.vibrationEnabled = enabled;
    await this.saveSettings();
    this.notifyChange(); 
  }

  async setTheme(theme: 'light' | 'dark' | 'auto'): Promise<void> {
    this.settings.theme = theme;
    await this.saveSettings();
    this.notifyChange(); 
  }

  async setLanguage(language: string): Promise<void> {
    this.settings.language = language;
    await this.saveSettings();
    this.notifyChange(); 
  }

  async setAccessibility(accessibility: Partial<AppSettings['accessibility']>): Promise<void> {
    this.settings.accessibility = {
      ...this.settings.accessibility,
      ...accessibility
    };
    await this.saveSettings();
    this.notifyChange(); 
  }

  async resetSettings(): Promise<void> {
    this.settings = { ...defaultSettings };
    await this.saveSettings();
    this.notifyChange(); 
  }

  getFormattedSettings(): {
    sound: string;
    vibration: string;
    theme: string;
    language: string;
    largeText: string;
    highContrast: string;
    screenReader: string;
  } {
    return {
      sound: this.settings.soundEnabled ? 'Enabled' : 'Disabled',
      vibration: this.settings.vibrationEnabled ? 'Enabled' : 'Disabled',
      theme: this.settings.theme.charAt(0).toUpperCase() + this.settings.theme.slice(1),
      language: this.settings.language.toUpperCase(),
      largeText: this.settings.accessibility.largeText ? 'Enabled' : 'Disabled',
      highContrast: this.settings.accessibility.highContrast ? 'Enabled' : 'Disabled',
      screenReader: this.settings.accessibility.screenReader ? 'Enabled' : 'Disabled'
    };
  }

  isSoundEnabled(): boolean {
    return this.settings.soundEnabled;
  }

  isVibrationEnabled(): boolean {
    return this.settings.vibrationEnabled;
  }

  getCurrentTheme(): 'light' | 'dark' | 'auto' {
    return this.settings.theme;
  }

  getCurrentLanguage(): string {
    return this.settings.language;
  }

  getAccessibilityStatus(): AppSettings['accessibility'] {
    return { ...this.settings.accessibility };
  }

  async saveSettings(): Promise<void> {
    try {
      
      
      console.log('Settings saved (temporarily disabled)');
    } catch (e) {
      console.error('Failed to save settings', e);
    }
  }

  async loadSettings(): Promise<void> {
    try {
      
      
      
      
      
      console.log('Settings loaded (temporarily disabled)');
    } catch (e) {
      console.error('Failed to load settings', e);
      
      this.settings = { ...defaultSettings };
    }
  }
}
