import * as Haptics from 'expo-haptics';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, Vibration } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { GameState, PurchaseItem } from '@/src/models';
import { GameViewModel } from '@/src/viewmodels';

interface MainGameViewProps {
  viewModel: GameViewModel;
}

export function MainGameView({ viewModel }: MainGameViewProps) {
  const [gameState, setGameState] = useState<GameState>(viewModel.getGameState());
  const [allItems, setAllItems] = useState<PurchaseItem[]>(viewModel.getAllItems());
  const [isDataLoaded, setIsDataLoaded] = useState<boolean>(viewModel.isDataLoaded());

  const hapticPatterns = {
    purchase: async () => {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      Vibration.vibrate(100);
    },
    gameComplete: async () => {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Vibration.vibrate([200, 100, 200, 100, 200, 100, 500]); 
    },
    error: async () => {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Vibration.vibrate([100, 50, 100]); 
    },
  };

  useEffect(() => {
    const unsubscribe = viewModel.subscribe(() => {
      setGameState(viewModel.getGameState());
      setIsDataLoaded(viewModel.isDataLoaded());
    });
    return unsubscribe;
  }, [viewModel]);

  useEffect(() => {
    setIsDataLoaded(viewModel.isDataLoaded());
  }, [viewModel]);

  const handlePurchase = useCallback(async (item: PurchaseItem) => {
    if (viewModel.purchaseItem(item)) {
      await hapticPatterns.purchase();

      if (viewModel.isGameCompleted()) {
        await hapticPatterns.gameComplete();
        Alert.alert(
          'Congratulations!',
          'You\'ve spent exactly $100 billion! Game completed!',
          [{ text: 'OK' }]
        );
      }
    } else {
      await hapticPatterns.error();
      Alert.alert('Cannot afford this item', 'You don\'t have enough money for this purchase.');
    }
  }, [viewModel]);

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

  const renderItem = ({ item }: { item: PurchaseItem }) => {
    const ownedCount = viewModel.getOwnedItemCount(item.id);
    const canAfford = viewModel.canAffordItem(item);

    return (
      <ThemedView style={styles.itemCard}>
        <ThemedText style={styles.itemName}>{item.name}</ThemedText>
        <ThemedText style={styles.itemPrice}>
          {formatCurrency(item.price)}
        </ThemedText>
        <ThemedText style={styles.itemDescription}>
          {item.description}
        </ThemedText>
        <ThemedText style={styles.itemCategory}>
          Category: {item.category}
        </ThemedText>
        <ThemedText style={styles.ownedCount}>
          Owned: {ownedCount}
        </ThemedText>
        <ThemedView
          style={[
            styles.purchaseButton,
            !canAfford && styles.disabledButton
          ]}
          onTouchEnd={() => handlePurchase(item)}
        >
          <ThemedText style={styles.purchaseButtonText}>
            Buy Item
          </ThemedText>
        </ThemedView>
      </ThemedView>
    );
  };

  if (!isDataLoaded) {
    return (
      <ThemedView style={styles.container}>
        <ThemedView style={styles.loadingContainer}>
          <ThemedText style={styles.loadingText}>Loading game data...</ThemedText>
          <ThemedText style={styles.loadingSubtext}>
            Restoring your progress
          </ThemedText>
        </ThemedView>
      </ThemedView>
    );
  }

  if (gameState.gameCompleted) {
    return (
      <ThemedView style={styles.container}>
        <ThemedView style={styles.completionContainer}>
          <ThemedText style={styles.completionTitle}>🎉 Congratulations!</ThemedText>
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
      <ThemedView style={styles.budgetContainer}>
        <ThemedText style={styles.budgetLabel}>Remaining Budget</ThemedText>
        <ThemedText style={styles.budgetAmount}>
          {formatCurrency(gameState.currentBudget)}
        </ThemedText>
        <ThemedText style={styles.totalSpent}>
          Total Spent: {formatCurrency(gameState.totalSpent)}
        </ThemedText>
      </ThemedView>

      <FlatList
        data={allItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        style={styles.itemsList}
        showsVerticalScrollIndicator={true}
        extraData={gameState.purchasedItems.length}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 50,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  loadingSubtext: {
    fontSize: 16,
    opacity: 0.7,
  },
  budgetContainer: {
    alignItems: 'center',
    marginBottom: 15,
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  budgetLabel: {
    fontSize: 16,
    marginBottom: 5,
  },
  budgetAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  totalSpent: {
    fontSize: 14,
    opacity: 0.8,
  },
  itemsList: {
    flex: 1,
    marginBottom: 20,
  },
  itemCard: {
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
  itemName: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  itemPrice: {
    fontSize: 18,
    color: '#4CAF50',
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  itemDescription: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 20,
  },
  itemCategory: {
    fontSize: 12,
    opacity: 0.7,
    textTransform: 'capitalize',
    textAlign: 'center',
    marginBottom: 10,
  },
  ownedCount: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
  },
  purchaseButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  purchaseButtonText: {
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
    lineHeight: 40,
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
