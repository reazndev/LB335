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

        <ThemedView style={[styles.statsGrid, isTablet && styles.statsGridTablet]}>
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    justifyContent: 'space-between',
  },
  statsGridTablet: {
    padding: 24,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  statCardTablet: {
    width: '23%',
    padding: 20,
  },
  statTitle: {
    fontSize: 14,
    marginBottom: 8,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#28a745',
    marginBottom: 4,
  },
  statDescription: {
    fontSize: 12,
    color: '#6c757d',
    textAlign: 'center',
  },
  detailsContainer: {
    padding: 16,
  },
  collapsibleContent: {
    padding: 12,
  },
  detailText: {
    fontSize: 14,
    marginBottom: 8,
    color: '#495057',
  },
  analyticsNote: {
    fontSize: 12,
    color: '#6c757d',
    fontStyle: 'italic',
    marginTop: 8,
  },
  noDataText: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
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
  },
});
