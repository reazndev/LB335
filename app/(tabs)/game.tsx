import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { accelerometer, SensorTypes, setUpdateIntervalForType } from 'react-native-sensors';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { PurchaseItem } from '@/src/models';
import { GameViewModel } from '@/src/viewmodels/GameViewModel';

// This layout is optimized for mobile devices:
// - Single-column design for easy thumb navigation
// - Large touch targets (min 44px) for finger interaction
// - Responsive to different screen sizes (phone vs tablet)
// - No mouse dependencies, designed for touch gestures
// - High contrast using themed colors for accessibility
// - Budget prominently displayed at top for quick reference
// - Item display takes up most space for focus
// - Controls at bottom, thumb-reachable

export default function GameScreen() {
  const { width } = useWindowDimensions();
  const isTablet = width > 768;
  const [gameVM] = useState(() => new GameViewModel());
  const [currentItem, setCurrentItem] = useState<PurchaseItem | null>(null);

  const handleShake = useCallback(() => {
    const randomItem = gameVM.getRandomItem();
    setCurrentItem(randomItem);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, [gameVM]);

  useEffect(() => {
    gameVM.loadGameState().then(() => {
      setCurrentItem(gameVM.getCurrentItem());
    });

    // Set up accelerometer for shake detection
    setUpdateIntervalForType(SensorTypes.accelerometer, 100); // 100ms
    const subscription = accelerometer.subscribe(({ x, y, z }) => {
      const magnitude = Math.sqrt(x * x + y * y + z * z);
      if (magnitude > 15) { // SHAKE_THRESHOLD
        handleShake();
      }
    });

    return () => subscription.unsubscribe();
  }, [gameVM, handleShake]);

  const handleSwipe = (event: any) => {
    if (event.nativeEvent.state === State.END) {
      const { translationX } = event.nativeEvent;
      if (Math.abs(translationX) > 100) { // MIN_SWIPE_DISTANCE
        if (translationX > 0) {
          // Swipe right - buy item
          if (currentItem) {
            const success = gameVM.purchaseItem(currentItem);
            if (success) {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              if (gameVM.getGameState().gameCompleted) {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                alert('Congratulations! You reached exactly $0!');
              }
            } else {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              alert('Not enough budget!');
            }
          }
        } else {
          // Swipe left - next item
          setCurrentItem(gameVM.getRandomItem());
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
      }
    }
  };

  const gameState = gameVM.getGameState();

  return (
    <PanGestureHandler onHandlerStateChange={handleSwipe}>
      <ThemedView style={styles.container}>
        {/* Budget Display */}
        <ThemedView style={[styles.budgetContainer, isTablet && styles.budgetContainerTablet]}>
          <ThemedText type="title" style={styles.budgetText}>
            ${gameState.currentBudget.toLocaleString()}
          </ThemedText>
          <ThemedText>Remaining Budget</ThemedText>
        </ThemedView>

        {/* Item Display */}
        <ThemedView style={[styles.itemContainer, isTablet && styles.itemContainerTablet]}>
          {currentItem && (
            <>
              <ThemedText type="subtitle">{currentItem.name}</ThemedText>
              <ThemedText>Price: ${currentItem.price.toLocaleString()}</ThemedText>
              <ThemedText style={styles.description}>
                {currentItem.description}
              </ThemedText>
              {/* Placeholder for image */}
              <ThemedView style={styles.imagePlaceholder}>
                <ThemedText>Item Image</ThemedText>
              </ThemedView>
            </>
          )}
        </ThemedView>

        {/* Purchase Controls */}
        <ThemedView style={[styles.controlsContainer, isTablet && styles.controlsContainerTablet]}>
          <ThemedView style={styles.button}>
            <ThemedText>Swipe Right to Buy</ThemedText>
          </ThemedView>
          <ThemedView style={styles.button}>
            <ThemedText>Swipe Left for Next Item</ThemedText>
          </ThemedView>
          <ThemedView style={styles.button}>
            <ThemedText>Shake for Random Item</ThemedText>
          </ThemedView>
        </ThemedView>
      </ThemedView>
    </PanGestureHandler>
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
