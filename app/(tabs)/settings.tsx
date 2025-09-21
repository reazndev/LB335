// import AsyncStorage from '@react-native-async-storage/async-storage';
import { StyleSheet, useWindowDimensions } from 'react-native';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Collapsible } from '@/components/ui/collapsible';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function SettingsScreen() {
  const { width } = useWindowDimensions();
  const isTablet = width > 768;

  const resetData = async () => {
    // await AsyncStorage.clear();
    alert('Data reset (temporarily disabled)');
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={
        <IconSymbol
          size={310}
          color="#808080"
          name="gear"
          style={styles.headerImage}
        />
      }>
      <ThemedView style={[styles.titleContainer, isTablet && styles.titleContainerTablet]}>
        <ThemedText type="title">Settings</ThemedText>
      </ThemedView>
      <ThemedText>Configure your app preferences here.</ThemedText>
      <Collapsible title="Accessibility">
        <ThemedText>Settings for screen readers and alternative inputs.</ThemedText>
      </Collapsible>
      <Collapsible title="Sound & Vibration">
        <ThemedText>Control haptic feedback and sound effects.</ThemedText>
      </Collapsible>
      <Collapsible title="Reset Data">
        <ThemedText>Clear all game data and statistics.</ThemedText>
        <ThemedView style={styles.button} onTouchEnd={resetData}>
          <ThemedText>Reset All Data</ThemedText>
        </ThemedView>
      </Collapsible>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  titleContainerTablet: {
    justifyContent: 'center',
  },
  button: {
    minHeight: 44,
    padding: 12,
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
});
