import { useEffect, useState } from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Collapsible } from '@/components/ui/collapsible';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { StatsViewModel } from '@/src/viewmodels/StatsViewModel';

export default function StatisticsScreen() {
  const { width } = useWindowDimensions();
  const isTablet = width > 768;
  const [statsVM] = useState(() => new StatsViewModel());
  const [stats, setStats] = useState(statsVM.getStats());

  useEffect(() => {
    statsVM.loadStatistics().then(() => {
      setStats(statsVM.getStats());
    });
  }, [statsVM]);

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={
        <IconSymbol
          size={310}
          color="#808080"
          name="chart.bar.fill"
          style={styles.headerImage}
        />
      }>
      <ThemedView style={[styles.titleContainer, isTablet && styles.titleContainerTablet]}>
        <ThemedText type="title">Statistics</ThemedText>
      </ThemedView>
      <ThemedText>Your game performance and history.</ThemedText>
      <Collapsible title="Game Stats">
        <ThemedText>Games Played: {stats.gamesPlayed}</ThemedText>
        <ThemedText>Fastest Completion: {stats.fastestCompletion ? `${stats.fastestCompletion}s` : 'N/A'}</ThemedText>
        <ThemedText>Average Items per Game: {stats.averageItemsPerGame.toFixed(1)}</ThemedText>
        <ThemedText>Favorite Category: {stats.favoriteCategory || 'N/A'}</ThemedText>
      </Collapsible>
      <Collapsible title="Purchase History">
        <ThemedText>No detailed purchase history yet.</ThemedText>
      </Collapsible>
      <Collapsible title="Achievements">
        <ThemedText>No achievements unlocked.</ThemedText>
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
});
