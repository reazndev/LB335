import { StyleSheet, useWindowDimensions } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function GameScreen() {
  const { width, height } = useWindowDimensions();
  const isTablet = width > 768;

  return (
    <ThemedView style={styles.container}>
      {/* Budget Display */}
      <ThemedView style={[styles.budgetContainer, isTablet && styles.budgetContainerTablet]}>
        <ThemedText type="title" style={styles.budgetText}>
          $1,000,000,000
        </ThemedText>
        <ThemedText>Remaining Budget</ThemedText>
      </ThemedView>

      {/* Item Display */}
      <ThemedView style={[styles.itemContainer, isTablet && styles.itemContainerTablet]}>
        <ThemedText type="subtitle">Lamborghini Aventador</ThemedText>
        <ThemedText>Price: $500,000</ThemedText>
        <ThemedText style={styles.description}>
          An Italian supercar with a V12 engine.
        </ThemedText>
        {/* Placeholder for image */}
        <ThemedView style={styles.imagePlaceholder}>
          <ThemedText>Item Image</ThemedText>
        </ThemedView>
      </ThemedView>

      {/* Purchase Controls */}
      <ThemedView style={[styles.controlsContainer, isTablet && styles.controlsContainerTablet]}>
        <ThemedView style={styles.button}>
          <ThemedText>Swipe to Navigate</ThemedText>
        </ThemedView>
        <ThemedView style={styles.button}>
          <ThemedText>Shake to Buy Random</ThemedText>
        </ThemedView>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  budgetContainer: {
    alignItems: 'center',
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  budgetContainerTablet: {
    marginBottom: 30,
    padding: 24,
  },
  budgetText: {
    fontSize: 24,
  },
  itemContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    marginBottom: 20,
  },
  itemContainerTablet: {
    flex: 2,
    padding: 24,
    marginBottom: 30,
  },
  description: {
    textAlign: 'center',
    marginVertical: 10,
  },
  imagePlaceholder: {
    width: 200,
    height: 150,
    backgroundColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    marginTop: 10,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
  },
  controlsContainerTablet: {
    padding: 24,
  },
  button: {
    minHeight: 44, // Ergonomic standard
    padding: 12,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
  },
});

// This layout is optimized for mobile devices:
// - Single-column design for easy thumb navigation
// - Large touch targets (min 44px) for finger interaction
// - Responsive to different screen sizes (phone vs tablet)
// - No mouse dependencies, designed for touch gestures
// - High contrast using themed colors for accessibility
// - Budget prominently displayed at top for quick reference
// - Item display takes up most space for focus
// - Controls at bottom, thumb-reachable
