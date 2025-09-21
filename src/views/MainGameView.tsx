import * as Haptics from 'expo-haptics';
import { Accelerometer } from 'expo-sensors';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Dimensions, PanResponder, StyleSheet, Vibration } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { PurchaseItem } from '@/src/models';
import { GameViewModel } from '@/src/viewmodels';

const { width } = Dimensions.get('window');

interface MainGameViewProps {
  viewModel: GameViewModel;
}

export function MainGameView({ viewModel }: MainGameViewProps) {
  const [currentItem, setCurrentItem] = useState<PurchaseItem>(viewModel.getRandomItem());
  const [gameState, setGameState] = useState(viewModel.getGameState());

  const handleShakePurchase = useCallback(async () => {
    const randomItem = viewModel.getRandomItem();
    setCurrentItem(randomItem);

    if (viewModel.purchaseItem(randomItem)) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      Vibration.vibrate(200);

      if (viewModel.isGameCompleted()) {
        Alert.alert(
          'Congratulations!',
          'You\'ve spent exactly $100 billion! Game completed!',
          [{ text: 'OK' }]
        );
      }
    } else {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Cannot afford this item', 'You don\'t have enough money for this purchase.');
    }
  }, [viewModel]);

  // Subscribe to ViewModel changes
  useEffect(() => {
    const unsubscribe = viewModel.subscribe(() => {
      setGameState(viewModel.getGameState());
    });
    return unsubscribe;
  }, [viewModel]);

  // Accelerometer setup for shake-to-buy
  useEffect(() => {
    let lastShake = 0;
    const SHAKE_THRESHOLD = 1.5;
    const SHAKE_TIMEOUT = 1000;

    const subscribe = Accelerometer.addListener(accelerometerData => {
      const { x, y, z } = accelerometerData;
      const acceleration = Math.sqrt(x * x + y * y + z * z);

      if (acceleration > SHAKE_THRESHOLD) {
        const now = Date.now();
        if (now - lastShake > SHAKE_TIMEOUT) {
          lastShake = now;
          handleShakePurchase();
        }
      }
    });

    Accelerometer.setUpdateInterval(100);

    return () => {
      subscribe?.remove();
    };
  }, [handleShakePurchase]);

  const handlePurchase = useCallback(async () => {
    if (viewModel.purchaseItem(currentItem)) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      Vibration.vibrate(100);

      // Get next random item
      setCurrentItem(viewModel.getRandomItem());

      if (viewModel.isGameCompleted()) {
        Alert.alert(
          'Congratulations!',
          'You\'ve spent exactly $100 billion! Game completed!',
          [{ text: 'OK' }]
        );
      }
    } else {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Cannot afford this item', 'You don\'t have enough money for this purchase.');
    }
  }, [viewModel, currentItem]);

  // PanResponder for swipe gestures
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderRelease: (evt, gestureState) => {
      const { dx } = gestureState;
      const SWIPE_THRESHOLD = 100;

      if (Math.abs(dx) > SWIPE_THRESHOLD) {
        setCurrentItem(viewModel.getRandomItem());
        Haptics.selectionAsync();
      }
    },
  });

  const formatCurrency = (amount: number): string => {
    if (amount >= 1000000000) {
      return `$${(amount / 1000000000).toFixed(1)}B`;
    } else if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(1)}K`;
    }
    return `$${amount.toLocaleString()}`;
  };

  if (gameState.gameCompleted) {
    return (
      <ThemedView style={styles.container}>
        <ThemedView style={styles.completionContainer}>
          <ThemedText style={styles.completionTitle}>🎉 Congratulations! 🎉</ThemedText>
          <ThemedText style={styles.completionText}>
            You&apos;ve successfully spent exactly $100 billion!
          </ThemedText>
          <ThemedText style={styles.completionStats}>
            Total items purchased: {gameState.purchasedItems.length}
          </ThemedText>
          <ThemedText style={styles.completionStats}>
            Time taken: {gameState.endTime && gameState.startTime ?
              Math.round((gameState.endTime.getTime() - gameState.startTime.getTime()) / 1000) + ' seconds' :
              'Unknown'}
          </ThemedText>
        </ThemedView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      {/* Budget Display */}
      <ThemedView style={styles.budgetContainer}>
        <ThemedText style={styles.budgetLabel}>Remaining Budget</ThemedText>
        <ThemedText style={styles.budgetAmount}>
          {formatCurrency(gameState.currentBudget)}
        </ThemedText>
        <ThemedText style={styles.totalSpent}>
          Total Spent: {formatCurrency(gameState.totalSpent)}
        </ThemedText>
      </ThemedView>

      {/* Item Display with Swipe Gesture */}
      <ThemedView style={styles.itemContainer} {...panResponder.panHandlers}>
        <ThemedView style={styles.itemCard}>
          <ThemedText style={styles.itemName}>{currentItem.name}</ThemedText>
          <ThemedText style={styles.itemPrice}>
            {formatCurrency(currentItem.price)}
          </ThemedText>
          <ThemedText style={styles.itemDescription}>
            {currentItem.description}
          </ThemedText>
          <ThemedText style={styles.itemCategory}>
            Category: {currentItem.category}
          </ThemedText>
        </ThemedView>

        <ThemedText style={styles.swipeHint}>
          Swipe left/right for new item • Shake device to buy randomly
        </ThemedText>
      </ThemedView>

      {/* Purchase Controls */}
      <ThemedView style={styles.controlsContainer}>
        <ThemedView
          style={[
            styles.purchaseButton,
            !viewModel.canAffordItem(currentItem) && styles.disabledButton
          ]}
          onTouchEnd={handlePurchase}
        >
          <ThemedText style={styles.purchaseButtonText}>
            Buy This Item
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.resetButton} onTouchEnd={() => {
          Alert.alert(
            'Reset Game',
            'Are you sure you want to reset your progress?',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Reset', onPress: () => {
                viewModel.resetGame();
                setCurrentItem(viewModel.getRandomItem());
              }}
            ]
          );
        }}>
          <ThemedText style={styles.resetButtonText}>Reset Game</ThemedText>
        </ThemedView>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  budgetContainer: {
    alignItems: 'center',
    marginBottom: 30,
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  budgetLabel: {
    fontSize: 18,
    marginBottom: 5,
  },
  budgetAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  totalSpent: {
    fontSize: 16,
    opacity: 0.8,
  },
  itemContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 30,
    width: width * 0.9,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  itemName: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  itemPrice: {
    fontSize: 24,
    color: '#4CAF50',
    fontWeight: 'bold',
    marginBottom: 15,
  },
  itemDescription: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
    lineHeight: 22,
  },
  itemCategory: {
    fontSize: 14,
    opacity: 0.7,
    textTransform: 'capitalize',
  },
  swipeHint: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 20,
    opacity: 0.6,
  },
  controlsContainer: {
    marginTop: 30,
  },
  purchaseButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginBottom: 15,
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  purchaseButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  resetButton: {
    backgroundColor: '#f44336',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  completionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  completionTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  completionText: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 30,
  },
  completionStats: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
  },
});
