import { StyleSheet, useWindowDimensions } from 'react-native';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Collapsible } from '@/components/ui/collapsible';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function StatisticsScreen() {
  const { width } = useWindowDimensions();
  const isTablet = width > 768;

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
        <ThemedText>Games Played: 0</ThemedText>
        <ThemedText>Fastest Completion: N/A</ThemedText>
        <ThemedText>Average Items per Game: 0</ThemedText>
        <ThemedText>Favorite Category: N/A</ThemedText>
      </Collapsible>
      <Collapsible title="Purchase History">
        <ThemedText>No purchases yet.</ThemedText>
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
