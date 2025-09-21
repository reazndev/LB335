// SettingsViewModel - MVVM Architecture Implementation
// Manages app settings, preferences, and configuration

// import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppSettings, defaultSettings } from '../models';
import { BaseViewModel } from './BaseViewModel';

export class SettingsViewModel extends BaseViewModel {
  private settings: AppSettings = { ...defaultSettings };

  // MVVM Pattern Methods

  /**
   * Get current settings (immutable copy)
   */
  getSettings(): AppSettings {
    return { ...this.settings };
  }

  /**
   * Update sound setting
   */
  async setSoundEnabled(enabled: boolean): Promise<void> {
    this.settings.soundEnabled = enabled;
    await this.saveSettings();
    this.notifyChange(); // MVVM: Notify subscribers
  }

  /**
   * Update vibration setting
   */
  async setVibrationEnabled(enabled: boolean): Promise<void> {
    this.settings.vibrationEnabled = enabled;
    await this.saveSettings();
    this.notifyChange(); // MVVM: Notify subscribers
  }

  /**
   * Update theme setting
   */
  async setTheme(theme: 'light' | 'dark' | 'auto'): Promise<void> {
    this.settings.theme = theme;
    await this.saveSettings();
    this.notifyChange(); // MVVM: Notify subscribers
  }

  /**
   * Update language setting
   */
  async setLanguage(language: string): Promise<void> {
    this.settings.language = language;
    await this.saveSettings();
    this.notifyChange(); // MVVM: Notify subscribers
  }

  /**
   * Update accessibility settings
   */
  async setAccessibility(accessibility: Partial<AppSettings['accessibility']>): Promise<void> {
    this.settings.accessibility = {
      ...this.settings.accessibility,
      ...accessibility
    };
    await this.saveSettings();
    this.notifyChange(); // MVVM: Notify subscribers
  }

  /**
   * Reset all settings to defaults
   */
  async resetSettings(): Promise<void> {
    this.settings = { ...defaultSettings };
    await this.saveSettings();
    this.notifyChange(); // MVVM: Notify subscribers
  }

  /**
   * Get formatted settings for display
   */
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

  /**
   * Check if sound is enabled
   */
  isSoundEnabled(): boolean {
    return this.settings.soundEnabled;
  }

  /**
   * Check if vibration is enabled
   */
  isVibrationEnabled(): boolean {
    return this.settings.vibrationEnabled;
  }

  /**
   * Get current theme
   */
  getCurrentTheme(): 'light' | 'dark' | 'auto' {
    return this.settings.theme;
  }

  /**
   * Get current language
   */
  getCurrentLanguage(): string {
    return this.settings.language;
  }

  /**
   * Check if accessibility features are enabled
   */
  getAccessibilityStatus(): AppSettings['accessibility'] {
    return { ...this.settings.accessibility };
  }

  // Data Persistence Methods

  /**
   * Save settings to persistent storage
   */
  async saveSettings(): Promise<void> {
    try {
      // const jsonValue = JSON.stringify(this.settings);
      // await AsyncStorage.setItem('@settings', jsonValue);
      console.log('Settings saved (temporarily disabled)');
    } catch (e) {
      console.error('Failed to save settings', e);
    }
  }

  /**
   * Load settings from persistent storage
   */
  async loadSettings(): Promise<void> {
    try {
      // const jsonValue = await AsyncStorage.getItem('@settings');
      // if (jsonValue != null) {
      //   this.settings = { ...defaultSettings, ...JSON.parse(jsonValue) };
      //   this.notifyChange(); // MVVM: Notify subscribers of loaded settings
      // }
      console.log('Settings loaded (temporarily disabled)');
    } catch (e) {
      console.error('Failed to load settings', e);
      // Fallback to default settings
      this.settings = { ...defaultSettings };
    }
  }
}
