import * as Haptics from 'expo-haptics';
import { Accelerometer } from 'expo-sensors';
import { useCallback, useEffect, useState } from 'react';
import { FlatList, Modal, StyleSheet, Vibration } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { GameState, PurchaseItem } from '@/src/models';
import { GameViewModel } from '@/src/viewmodels';

interface MainGameViewProps {
  viewModel: GameViewModel;
}

export function MainGameView({ viewModel }: MainGameViewProps) {
  const [gameState, setGameState] = useState<GameState>(viewModel.getGameState());
  const [allItems, setAllItems] = useState<PurchaseItem[]>(viewModel.getAllItems());
  const [isDataLoaded, setIsDataLoaded] = useState<boolean>(viewModel.isDataLoaded());
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  
  const colorScheme = useColorScheme();

  const showStyledAlert = useCallback((title: string, message: string) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertVisible(true);
  }, []);

  const hideAlert = useCallback(() => {
    setAlertVisible(false);
  }, []);

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

  useEffect(() => {
    let lastShakeTime = 0;
    const SHAKE_THRESHOLD = 1.5;
    const SHAKE_COOLDOWN = 1000;

    Accelerometer.setUpdateInterval(100);
    
    const subscription = Accelerometer.addListener(({ x, y, z }) => {
      const acceleration = Math.sqrt(x * x + y * y + z * z);
      const now = Date.now();
      
      if (acceleration > SHAKE_THRESHOLD && now - lastShakeTime > SHAKE_COOLDOWN) {
        lastShakeTime = now;
        handleShake();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [gameState.purchasedItems]);

  const handleShake = async () => {
    if (gameState.purchasedItems.length > 0) {
      const lastItem = gameState.purchasedItems[gameState.purchasedItems.length - 1];
      const success = viewModel.sellItem(lastItem);
      
      if (success) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Vibration.vibrate(50); // Short vibration feedback
        showStyledAlert('Undo Successful', `Returned: ${lastItem.name} (+$${lastItem.price.toLocaleString()})`);
      }
    }
  };

  const handlePurchase = useCallback(async (item: PurchaseItem) => {
    if (viewModel.purchaseItem(item)) {
      await hapticPatterns.purchase();

      if (viewModel.isGameCompleted()) {
        await hapticPatterns.gameComplete();
      }
    } else {
      await hapticPatterns.error();
      showStyledAlert('Cannot afford this item', 'You don\'t have enough money for this purchase.');
    }
  }, [viewModel, showStyledAlert]);

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
          <ThemedView style={styles.newGameButton} onTouchEnd={() => viewModel.resetGame()}>
            <ThemedText style={styles.newGameButtonText}>Start New Game</ThemedText>
          </ThemedView>
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
              { color: Colors[colorScheme ?? 'light'].text }
            ]}>
              {alertMessage}
            </ThemedText>
            <ThemedView style={styles.modalButton} onTouchEnd={hideAlert}>
              <ThemedText style={styles.modalButtonText}>OK</ThemedText>
            </ThemedView>
          </ThemedView>
        </ThemedView>
      </Modal>
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
  newGameButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  newGameButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
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
    color: '#000',
  },
  modalMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 25,
    color: '#000',
    opacity: 0.8,
    lineHeight: 22,
  },
  modalButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    padding: 12,
    paddingHorizontal: 30,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
});
