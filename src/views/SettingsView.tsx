import { useCallback, useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, useWindowDimensions } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Collapsible } from '@/components/ui/collapsible';
import { GameViewModel, SettingsViewModel, StatsViewModel } from '@/src/viewmodels';

interface SettingsViewProps {
  settingsViewModel: SettingsViewModel;
  gameViewModel: GameViewModel;
  statsViewModel: StatsViewModel;
}

export function SettingsView({ settingsViewModel, gameViewModel, statsViewModel }: SettingsViewProps) {
  const { width } = useWindowDimensions();
  const isTablet = width > 768;
  
  const [settings, setSettings] = useState(settingsViewModel.getSettings());
  const [formattedSettings, setFormattedSettings] = useState(settingsViewModel.getFormattedSettings());

  useEffect(() => {
    const unsubscribe = settingsViewModel.subscribe(() => {
      setSettings(settingsViewModel.getSettings());
      setFormattedSettings(settingsViewModel.getFormattedSettings());
    });

    settingsViewModel.loadSettings();
    
    return unsubscribe;
  }, [settingsViewModel]);

  const handleSoundToggle = useCallback(async (value: boolean) => {
    await settingsViewModel.setSoundEnabled(value);
  }, [settingsViewModel]);

  const handleVibrationToggle = useCallback(async (value: boolean) => {
    await settingsViewModel.setVibrationEnabled(value);
  }, [settingsViewModel]);

  const handleLargeTextToggle = useCallback(async (value: boolean) => {
    await settingsViewModel.setAccessibility({ largeText: value });
  }, [settingsViewModel]);

  const handleHighContrastToggle = useCallback(async (value: boolean) => {
    await settingsViewModel.setAccessibility({ highContrast: value });
  }, [settingsViewModel]);

  const handleScreenReaderToggle = useCallback(async (value: boolean) => {
    await settingsViewModel.setAccessibility({ screenReader: value });
  }, [settingsViewModel]);

  const handleResetData = useCallback(() => {
    Alert.alert(
      'Reset All Data',
      'This will permanently delete all game progress, statistics, and settings. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await gameViewModel.resetGame();
            await statsViewModel.resetStats();
            await settingsViewModel.resetSettings();
            Alert.alert('Success', 'All data has been reset.');
          },
        },
      ]
    );
  }, [gameViewModel, statsViewModel, settingsViewModel]);

  const handleResetSettings = useCallback(() => {
    Alert.alert(
      'Reset Settings',
      'This will restore all settings to their default values.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'default',
          onPress: async () => {
            await settingsViewModel.resetSettings();
            Alert.alert('Success', 'Settings have been reset to defaults.');
          },
        },
      ]
    );
  }, [settingsViewModel]);

  const SettingRow = ({ 
    title, 
    value, 
    onValueChange, 
    description 
  }: { 
    title: string; 
    value: boolean; 
    onValueChange: (value: boolean) => void;
    description?: string;
  }) => (
    <ThemedView style={styles.settingRow}>
      <ThemedView style={styles.settingInfo}>
        <ThemedText style={styles.settingTitle}>{title}</ThemedText>
        {description && <ThemedText style={styles.settingDescription}>{description}</ThemedText>}
      </ThemedView>
      <Switch 
        value={value} 
        onValueChange={onValueChange}
        trackColor={{ false: '#e9ecef', true: '#28a745' }}
        thumbColor={value ? '#fff' : '#6c757d'}
      />
    </ThemedView>
  );

  const ActionButton = ({ 
    title, 
    onPress, 
    variant = 'default' 
  }: { 
    title: string; 
    onPress: () => void;
    variant?: 'default' | 'destructive';
  }) => (
    <ThemedView 
      style={[
        styles.actionButton, 
        variant === 'destructive' && styles.destructiveButton
      ]}
      onTouchEnd={onPress}
    >
      <ThemedText style={[
        styles.actionButtonText,
        variant === 'destructive' && styles.destructiveButtonText
      ]}>
        {title}
      </ThemedText>
    </ThemedView>
  );

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.content}>
        <ThemedView style={[styles.header, isTablet && styles.headerTablet]}>
          <ThemedText type="title" style={styles.title}>Settings</ThemedText>
          <ThemedText style={styles.subtitle}>Configure your app experience</ThemedText>
        </ThemedView>

        <Collapsible title="Sound & Haptics">
          <ThemedView style={styles.collapsibleContent}>
            <SettingRow
              title="Sound Effects"
              value={settings.soundEnabled}
              onValueChange={handleSoundToggle}
              description="Play sounds for purchases and interactions"
            />
            <SettingRow
              title="Vibration"
              value={settings.vibrationEnabled}
              onValueChange={handleVibrationToggle}
              description="Haptic feedback for touch interactions"
            />
          </ThemedView>
        </Collapsible>

        <Collapsible title="Accessibility">
          <ThemedView style={styles.collapsibleContent}>
            <SettingRow
              title="Large Text"
              value={settings.accessibility.largeText}
              onValueChange={handleLargeTextToggle}
              description="Increase text size for better readability"
            />
            <SettingRow
              title="High Contrast"
              value={settings.accessibility.highContrast}
              onValueChange={handleHighContrastToggle}
              description="Enhanced contrast for better visibility"
            />
            <SettingRow
              title="Screen Reader Support"
              value={settings.accessibility.screenReader}
              onValueChange={handleScreenReaderToggle}
              description="Optimize for screen reader accessibility"
            />
          </ThemedView>
        </Collapsible>

        <Collapsible title="App Information">
          <ThemedView style={styles.collapsibleContent}>
            <ThemedView style={styles.infoRow}>
              <ThemedText style={styles.infoLabel}>Theme:</ThemedText>
              <ThemedText style={styles.infoValue}>{formattedSettings.theme}</ThemedText>
            </ThemedView>
            <ThemedView style={styles.infoRow}>
              <ThemedText style={styles.infoLabel}>Language:</ThemedText>
              <ThemedText style={styles.infoValue}>{formattedSettings.language}</ThemedText>
            </ThemedView>
            <ThemedText style={styles.infoDescription}>
              Built with React Native and Expo using MVVM architecture for optimal performance and maintainability.
            </ThemedText>
          </ThemedView>
        </Collapsible>

        <Collapsible title="Data Management">
          <ThemedView style={styles.collapsibleContent}>
            <ThemedText style={styles.dataDescription}>
              Manage your app data and reset options. Use with caution as these actions cannot be undone.
            </ThemedText>
            
            <ActionButton
              title="Reset Settings Only"
              onPress={handleResetSettings}
              variant="default"
            />
            
            <ActionButton
              title="Reset All Data"
              onPress={handleResetData}
              variant="destructive"
            />
            
            <ThemedText style={styles.warningText}>
              Reset All Data will permanently delete your game progress, statistics, and settings.
            </ThemedText>
          </ThemedView>
        </Collapsible>

        <ThemedView style={styles.footer}>
          <ThemedText style={styles.footerText}>
            Billion Dollar Challenge v1.0.0{'\n'}
            MVVM Architecture Implementation
          </ThemedText>
        </ThemedView>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  content: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
    padding: 20,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTablet: {
    padding: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.8,
    textAlign: 'center',
  },
  collapsibleContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 20,
    marginVertical: 5,
    marginHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    opacity: 0.7,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 16,
    opacity: 0.8,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  infoDescription: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 12,
    lineHeight: 20,
    textAlign: 'center',
  },
  dataDescription: {
    fontSize: 16,
    opacity: 0.8,
    marginBottom: 16,
    lineHeight: 22,
    textAlign: 'center',
  },
  actionButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginVertical: 8,
  },
  destructiveButton: {
    backgroundColor: '#f44336',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  destructiveButtonText: {
    color: 'white',
  },
  warningText: {
    fontSize: 14,
    color: '#f44336',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  footer: {
    alignItems: 'center',
    padding: 20,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginTop: 20,
  },
  footerText: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'center',
    lineHeight: 20,
  },
});
