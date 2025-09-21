import { useCallback, useEffect, useState } from 'react';
import { Modal, ScrollView, StyleSheet, useWindowDimensions } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { GameViewModel, SettingsViewModel, StatsViewModel } from '@/src/viewmodels';

interface SettingsViewProps {
  settingsViewModel: SettingsViewModel;
  gameViewModel: GameViewModel;
  statsViewModel: StatsViewModel;
}

export function SettingsView({ settingsViewModel, gameViewModel, statsViewModel }: SettingsViewProps) {
  const { width } = useWindowDimensions();
  const isTablet = width > 768;
  const colorScheme = useColorScheme();
  
  const [settings, setSettings] = useState(settingsViewModel.getSettings());
  const [formattedSettings, setFormattedSettings] = useState(settingsViewModel.getFormattedSettings());
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);

  const showStyledAlert = useCallback((title: string, message: string, onConfirm?: () => void) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setConfirmAction(() => onConfirm || (() => {}));
    setAlertVisible(true);
  }, []);

  const hideAlert = useCallback(() => {
    setAlertVisible(false);
    setConfirmAction(null);
  }, []);

  const handleConfirm = useCallback(() => {
    if (confirmAction) {
      confirmAction();
    }
    hideAlert();
  }, [confirmAction, hideAlert]);

  useEffect(() => {
    const unsubscribe = settingsViewModel.subscribe(() => {
      setSettings(settingsViewModel.getSettings());
      setFormattedSettings(settingsViewModel.getFormattedSettings());
    });

    settingsViewModel.loadSettings();
    
    return unsubscribe;
  }, [settingsViewModel]);

  const handleResetData = useCallback(() => {
    showStyledAlert(
      'Reset All Data',
      'This will permanently delete all game progress, statistics, and settings. This action cannot be undone.',
      async () => {
        await gameViewModel.clearAllData();
        showStyledAlert('Success', 'All data has been reset.');
      }
    );
  }, [gameViewModel, showStyledAlert]);

  const handleNewGame = useCallback(() => {
    showStyledAlert(
      'Start New Game',
      'This will reset your current game progress but keep your statistics and settings. Continue?',
      async () => {
        await gameViewModel.resetGame();
        showStyledAlert('Success', 'New game started! Your statistics and settings have been preserved.');
      }
    );
  }, [gameViewModel, showStyledAlert]);

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

        <ThemedView style={styles.dataManagementSection}>
          <ThemedText style={styles.sectionTitle}>Data Management</ThemedText>
          <ThemedText style={styles.dataDescription}>
            Manage your app data and reset options. Use with caution as these actions cannot be undone.
          </ThemedText>
          
          <ActionButton
            title="Start New Game"
            onPress={handleNewGame}
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

        <ThemedView style={styles.footer}>
          <ThemedText style={styles.footerText}>
            Billion Dollar Challenge v1.0.0{'\n'}
            MVVM Architecture Implementation
          </ThemedText>
        </ThemedView>
      </ThemedView>

      <Modal
        visible={alertVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={hideAlert}
      >
        <ThemedView style={styles.modalOverlay}>
          <ThemedView style={[
            styles.modalContent,
            { backgroundColor: colorScheme === 'dark' ? 'rgba(30, 30, 30, 0.95)' : 'rgba(255, 255, 255, 0.95)' }
          ]}>
            <ThemedText style={[
              styles.modalTitle,
              { color: Colors[colorScheme ?? 'light'].text }
            ]}>
              {alertTitle}
            </ThemedText>
            <ThemedText style={[
              styles.modalMessage,
              { color: Colors[colorScheme ?? 'light'].text, opacity: 0.8 }
            ]}>
              {alertMessage}
            </ThemedText>
            <ThemedView style={styles.modalButtons}>
              <ThemedView style={[styles.modalButton, styles.cancelButton]} onTouchEnd={hideAlert}>
                <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
              </ThemedView>
              <ThemedView style={[styles.modalButton, styles.confirmButton]} onTouchEnd={handleConfirm}>
                <ThemedText style={styles.confirmButtonText}>Confirm</ThemedText>
              </ThemedView>
            </ThemedView>
          </ThemedView>
        </ThemedView>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    paddingTop: 50,
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
  dataManagementSection: {
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 25,
    margin: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
    color: '#333',
  },
  modalMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 25,
    color: '#666',
    lineHeight: 22,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    borderRadius: 10,
    padding: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#666',
  },
  confirmButton: {
    backgroundColor: '#4CAF50',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
});
