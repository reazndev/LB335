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
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
  },
  header: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  headerTablet: {
    padding: 30,
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    color: '#6c757d',
    textAlign: 'center',
  },
  collapsibleContent: {
    padding: 12,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
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
    fontSize: 12,
    color: '#6c757d',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#495057',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#28a745',
  },
  infoDescription: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 12,
    lineHeight: 18,
  },
  dataDescription: {
    fontSize: 14,
    color: '#495057',
    marginBottom: 16,
    lineHeight: 20,
  },
  actionButton: {
    backgroundColor: '#007bff',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginVertical: 8,
  },
  destructiveButton: {
    backgroundColor: '#dc3545',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  destructiveButtonText: {
    color: '#fff',
  },
  warningText: {
    fontSize: 12,
    color: '#dc3545',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    marginTop: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 18,
  },
});
