import { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, useWindowDimensions } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useOrientation } from '@/hooks/use-orientation';
import { GameViewModel } from '@/src/viewmodels';

interface StatisticsViewProps {
  viewModel: GameViewModel;
}

export function StatisticsView({ viewModel }: StatisticsViewProps) {
  const { width } = useWindowDimensions();
  const isTablet = width > 768;
  const orientation = useOrientation();
  const isLandscape = orientation === 'landscape';
  
  const [stats, setStats] = useState(viewModel.getStatistics());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(viewModel.isDataLoading());
  
  useEffect(() => {
    const unsubscribe = viewModel.subscribe(() => {
      setStats(viewModel.getStatistics());
      setIsLoading(viewModel.isDataLoading());
    });

    // If data is still loading, wait for it
    if (viewModel.isDataLoading()) {
      const checkLoading = () => {
        if (!viewModel.isDataLoading()) {
          setStats(viewModel.getStatistics());
          setIsLoading(false);
        } else {
          setTimeout(checkLoading, 100);
        }
      };
      checkLoading();
    }

    return unsubscribe;
  }, [viewModel]);

  
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    
    setTimeout(() => setIsRefreshing(false), 500);
  }, []);

  
  const getFormattedStats = () => ({
    gamesPlayed: stats.gamesPlayed.toString(),
    fastestCompletion: stats.fastestCompletion 
      ? `${Math.round(stats.fastestCompletion)}s` 
      : 'N/A',
    averageItemsPerGame: stats.averageItemsPerGame.toFixed(1),
    favoriteCategory: stats.favoriteCategory || 'N/A',
    totalMoneySpent: `$${stats.totalMoneySpent.toLocaleString()}`,
    totalItemsPurchased: stats.totalItemsPurchased.toString(),
    mostExpensiveItem: stats.mostExpensiveItem?.name || 'N/A'
  });

  const formattedStats = getFormattedStats();

  const StatCard = ({ title, value, description }: { title: string; value: string; description?: string }) => (
    <ThemedView style={[
      styles.statCard, 
      isTablet && styles.statCardTablet,
      isLandscape && styles.statCardLandscape
    ]}>
      <ThemedText type="defaultSemiBold" style={styles.statTitle}>{title}</ThemedText>
      <ThemedText style={styles.statValue}>{value}</ThemedText>
      {description && <ThemedText style={styles.statDescription}>{description}</ThemedText>}
    </ThemedView>
  );

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
      }
    >
      <ThemedView style={styles.content}>
        <ThemedView style={[styles.header, isTablet && styles.headerTablet]}>
          <ThemedText type="title" style={styles.title}>Statistics</ThemedText>
          <ThemedText style={styles.subtitle}>
            {isLoading ? 'Loading statistics...' : 'Your spending game performance'}
          </ThemedText>
        </ThemedView>

        {isLoading ? (
          <ThemedView style={styles.loadingContainer}>
            <ThemedText style={styles.loadingText}>Loading your statistics...</ThemedText>
          </ThemedView>
        ) : (
          <>
            <ThemedView style={[
              styles.statsGrid,
              isLandscape && styles.statsGridLandscape
            ]}>
              <StatCard 
                title="Games Played" 
                value={formattedStats.gamesPlayed}
                description="Total games started"
              />
              <StatCard 
                title="Total Spent" 
                value={formattedStats.totalMoneySpent}
                description="Across all games"
              />
              <StatCard 
                title="Items Purchased" 
                value={formattedStats.totalItemsPurchased}
                description="Total items bought"
              />
              <StatCard 
                title="Fastest Completion" 
                value={formattedStats.fastestCompletion}
                description="Best time to spend all"
              />
            </ThemedView>

            <ThemedView style={styles.footer}>
              <ThemedText style={styles.footerText}>
                Statistics update in real-time as you play. Pull down to refresh.
              </ThemedText>
            </ThemedView>
          </>
        )}
      </ThemedView>
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
  statsGrid: {
    marginBottom: 20,
  },
  statsGridLandscape: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  statCard: {
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
    alignItems: 'center',
  },
  statCardTablet: {
    padding: 20,
  },
  statCardLandscape: {
    flex: 1,
    minWidth: '22%',
    marginHorizontal: 0,
    marginVertical: 0,
  },
  statTitle: {
    fontSize: 16,
    marginBottom: 8,
    textAlign: 'center',
    opacity: 0.8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 4,
    textAlign: 'center',
  },
  statDescription: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'center',
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
  },
  footerText: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 18,
    opacity: 0.7,
    textAlign: 'center',
  },
});
