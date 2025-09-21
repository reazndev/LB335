import { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, useWindowDimensions } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Collapsible } from '@/components/ui/collapsible';
import { GameViewModel } from '@/src/viewmodels';

interface StatisticsViewProps {
  viewModel: GameViewModel;
}

export function StatisticsView({ viewModel }: StatisticsViewProps) {
  const { width } = useWindowDimensions();
  const isTablet = width > 768;
  
  const [stats, setStats] = useState(viewModel.getStatistics());
  const [analytics, setAnalytics] = useState(viewModel.getGameAnalytics());
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  useEffect(() => {
    const unsubscribe = viewModel.subscribe(() => {
      setStats(viewModel.getStatistics());
      setAnalytics(viewModel.getGameAnalytics());
    });

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
    <ThemedView style={[styles.statCard, isTablet && styles.statCardTablet]}>
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
          <ThemedText style={styles.subtitle}>Your spending game performance</ThemedText>
        </ThemedView>

        <ThemedView style={styles.statsGrid}>
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

        <ThemedView style={styles.detailsContainer}>
          <Collapsible title="Game Performance">
            <ThemedView style={styles.collapsibleContent}>
              <ThemedText style={styles.detailText}>
                Average Items per Game: {formattedStats.averageItemsPerGame}
              </ThemedText>
              <ThemedText style={styles.detailText}>
                Favorite Category: {formattedStats.favoriteCategory}
              </ThemedText>
              <ThemedText style={styles.detailText}>
                Most Expensive Item: {formattedStats.mostExpensiveItem}
              </ThemedText>
              <ThemedText style={styles.detailText}>
                Average Item Price: ${analytics.averageItemPrice.toFixed(0)}
              </ThemedText>
            </ThemedView>
          </Collapsible>

          <Collapsible title="Analytics">
            <ThemedView style={styles.collapsibleContent}>
              <ThemedText style={styles.detailText}>
                Completion Percentage: {analytics.completionPercentage.toFixed(1)}%
              </ThemedText>
              <ThemedText style={styles.detailText}>
                Total Items Purchased: {analytics.totalItems}
              </ThemedText>
              <ThemedText style={styles.detailText}>
                Unique Categories: {analytics.uniqueCategories.length}
              </ThemedText>
              <ThemedText style={styles.analyticsNote}>
                Analytics help you understand your spending patterns and improve your strategy.
              </ThemedText>
            </ThemedView>
          </Collapsible>

          <Collapsible title="Purchase History">
            <ThemedView style={styles.collapsibleContent}>
              {stats.gamesPlayed > 0 ? (
                <ThemedText style={styles.detailText}>
                  You&apos;ve played {stats.gamesPlayed} games and purchased {stats.totalItemsPurchased} items total.
                </ThemedText>
              ) : (
                <ThemedText style={styles.noDataText}>
                  No purchase history yet. Start playing to see your statistics!
                </ThemedText>
              )}
            </ThemedView>
          </Collapsible>

          <Collapsible title="Achievements">
            <ThemedView style={styles.collapsibleContent}>
              <ThemedText style={styles.noDataText}>
                Achievement system coming soon! Keep playing to unlock rewards.
              </ThemedText>
            </ThemedView>
          </Collapsible>
        </ThemedView>

        <ThemedView style={styles.footer}>
          <ThemedText style={styles.footerText}>
            Statistics update in real-time as you play. Pull down to refresh.
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
  statsGrid: {
    marginBottom: 20,
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
  detailsContainer: {
    marginBottom: 20,
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
  detailText: {
    fontSize: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  analyticsNote: {
    fontSize: 14,
    opacity: 0.7,
    fontStyle: 'italic',
    marginTop: 8,
    textAlign: 'center',
  },
  noDataText: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
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
  },
  footerText: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'center',
  },
});
