# Handlungsziel 3: Implementierung der mobilen Applikation

## Artefakt

Als Artefakt für HZ3 habe ich die vollständige Implementierung der "Spend the Billions" App erstellt. Dies umfasst:

1. **MVVM-Architektur** mit BaseViewModel, spezialisierten ViewModels und Views
2. **Navigation** mit Expo Router und Tab-Navigation
3. **Gestiksteuerung** mit Shake-to-Undo und Touch-Interaktionen
4. **Sensor-Integration** mit Accelerometer und Haptic Feedback
5. **Persistente Datenspeicherung** mit AsyncStorage

### Projektstruktur

```
LB335/
├── src/
│   ├── models/           # Data Models (MVVM - Model)
│   │   └── index.ts
│   ├── viewmodels/       # Business Logic (MVVM - ViewModel)
│   │   ├── BaseViewModel.ts
│   │   ├── GameViewModel.ts
│   │   ├── SettingsViewModel.ts
│   │   ├── StatsViewModel.ts
│   │   └── index.ts
│   └── views/            # UI Components (MVVM - View)
│       ├── MainGameView.tsx
│       ├── SettingsView.tsx
│       ├── StatisticsView.tsx
│       └── index.ts
├── app/                  # Expo Router Navigation
│   ├── _layout.tsx       # Root Layout
│   └── (tabs)/           # Tab Navigation
│       ├── _layout.tsx   # Tab Layout + Context
│       ├── index.tsx     # Game Screen
│       ├── statistics.tsx
│       └── settings.tsx
```

## Nachweis der Zielerreichung

### 1. MVVM-Architektur Umsetzung

#### Model Layer (Datenmodelle)

```typescript
// src/models/index.ts

// Basis-Interface für ViewModels
export interface ViewModelBase {
  subscribe(callback: () => void): () => void;
  notifyChange(): void;
}

// Datenmodelle
export interface PurchaseItem {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
}

export interface GameState {
  currentBudget: number;
  purchasedItems: PurchaseItem[];
  totalSpent: number;
  gameCompleted: boolean;
  startTime: Date;
  endTime?: Date;
}

export interface Statistics {
  gamesPlayed: number;
  fastestCompletion?: number;
  averageItemsPerGame: number;
  favoriteCategory?: string;
  totalMoneySpent: number;
  mostExpensiveItem?: PurchaseItem;
  totalItemsPurchased: number;
}
```

**Erklärung:** Die Models definieren die Datenstrukturen ohne jegliche Business-Logik. Sie sind reine TypeScript-Interfaces, die die Form der Daten festlegen.

#### ViewModel Layer (Business Logic)

**BaseViewModel (Abstrakte Basis):**

```typescript
// src/viewmodels/BaseViewModel.ts

export abstract class BaseViewModel implements ViewModelBase {
  private subscribers: (() => void)[] = [];
  
  // Observer Pattern für Reaktivität
  subscribe(callback: () => void): () => void {
    this.subscribers.push(callback);
    
    // Cleanup-Funktion zurückgeben
    return () => {
      const index = this.subscribers.indexOf(callback);
      if (index > -1) {
        this.subscribers.splice(index, 1);
      }
    };
  }

  // Benachrichtigt alle Views über Änderungen
  protected notifyChange(): void {
    this.subscribers.forEach(callback => callback());
  }

  dispose(): void {
    this.subscribers = [];
  }
}
```

**Erklärung:** BaseViewModel implementiert das **Observer Pattern**. Views können sich subscriben und werden automatisch über Änderungen informiert. Dies ist der Kern der MVVM-Reaktivität.

**GameViewModel (Spezialisiert):**

```typescript
// src/viewmodels/GameViewModel.ts (Auszug)

export class GameViewModel extends BaseViewModel {
  private gameState: GameState;
  private statistics: Statistics;

  // Getter für Views (keine direkte State-Manipulation)
  getGameState(): GameState {
    return { ...this.gameState };  // Defensive Copy
  }

  // Business Logic: Item kaufen
  purchaseItem(item: PurchaseItem): boolean {
    if (this.gameState.currentBudget >= item.price) {
      this.gameState.currentBudget -= item.price;
      this.gameState.totalSpent += item.price;
      this.gameState.purchasedItems.push({ ...item });

      this.updateStatisticsOnPurchase(item);

      if (this.gameState.currentBudget === 0) {
        this.gameState.gameCompleted = true;
        this.gameState.endTime = new Date();
        this.updateStatisticsOnCompletion();
      }

      this.saveGameState();
      this.notifyChange();  // Views werden benachrichtigt
      return true;
    }
    return false;
  }

  // Weitere Business Logic...
  sellItem(item: PurchaseItem): boolean { /* ... */ }
  resetGame(): void { /* ... */ }
  getGameAnalytics(): { /* ... */ } { /* ... */ }
}
```

**Erklärung:** GameViewModel enthält die **gesamte Spiellogik**:
- Kaufvalidierung (Budget-Check)
- State-Updates (Budget, Items, Statistiken)
- Persistierung (AsyncStorage)
- View-Benachrichtigung (Observer Pattern)

**SettingsViewModel & StatsViewModel:**

```typescript
// src/viewmodels/SettingsViewModel.ts (Auszug)
export class SettingsViewModel extends BaseViewModel {
  private settings: AppSettings = { ...defaultSettings };

  async setVibrationEnabled(enabled: boolean): Promise<void> {
    this.settings.vibrationEnabled = enabled;
    await this.saveSettings();
    this.notifyChange();  // Views aktualisieren sich
  }
}
```

#### View Layer (UI Components)

**View-Komponenten erhalten ViewModels als Props:**

```typescript
// src/views/MainGameView.tsx

interface MainGameViewProps {
  viewModel: GameViewModel;  // ViewModel Dependency Injection
}

export function MainGameView({ viewModel }: MainGameViewProps) {
  // Lokaler State nur für UI
  const [gameState, setGameState] = useState<GameState>(
    viewModel.getGameState()
  );
  
  // Subscribe zu ViewModel-Änderungen
  useEffect(() => {
    const unsubscribe = viewModel.subscribe(() => {
      setGameState(viewModel.getGameState());
    });
    return unsubscribe;  // Cleanup
  }, [viewModel]);

  // UI-Event → ViewModel-Methode
  const handlePurchase = useCallback(async (item: PurchaseItem) => {
    if (viewModel.purchaseItem(item)) {
      await hapticPatterns.purchase();
      // ... Haptic Feedback
    }
  }, [viewModel]);

  // Rendering basiert auf gameState
  return (
    <ThemedView style={styles.container}>
      <ThemedText>{formatCurrency(gameState.currentBudget)}</ThemedText>
      <FlatList
        data={allItems}
        renderItem={({ item }) => (
          <ThemedView onTouchEnd={() => handlePurchase(item)}>
            {/* Item UI */}
          </ThemedView>
        )}
      />
    </ThemedView>
  );
}
```

**MVVM-Datenfluss Diagramm:**

```
┌─────────────────────────────────────────────────────────┐
│                      VIEW LAYER                         │
│  MainGameView / SettingsView / StatisticsView          │
│  • UI Rendering (React Components)                      │
│  • Event Handling (onTouchEnd, etc.)                    │
│  • Subscribe to ViewModel                               │
└─────────────────────────────────────────────────────────┘
                        ↕ (subscribe/notify)
┌─────────────────────────────────────────────────────────┐
│                   VIEWMODEL LAYER                       │
│  GameViewModel / SettingsViewModel / StatsViewModel     │
│  • Business Logic (purchaseItem, sellItem)              │
│  • State Management (gameState, statistics)             │
│  • Data Persistence (AsyncStorage)                      │
│  • Observer Pattern (subscribe/notifyChange)            │
└─────────────────────────────────────────────────────────┘
                        ↕ (read/write)
┌─────────────────────────────────────────────────────────┐
│                     MODEL LAYER                         │
│  GameState / PurchaseItem / Statistics / AppSettings    │
│  • Pure Data Structures (TypeScript Interfaces)         │
│  • No Business Logic                                    │
└─────────────────────────────────────────────────────────┘
```

**MVVM-Vorteile in der Umsetzung:**

✅ **Separation of Concerns:**
- Views sind "dumm" → nur Rendering und Events
- ViewModels sind "smart" → alle Business-Logik
- Models sind rein → nur Datenstrukturen

✅ **Testbarkeit:**
- ViewModels können isoliert getestet werden
- Keine UI-Abhängigkeiten in der Logik

✅ **Reaktivität:**
- Observer Pattern ermöglicht automatische UI-Updates
- Views bleiben synchron mit dem State

✅ **Wiederverwendbarkeit:**
- BaseViewModel wird von allen ViewModels geerbt
- Gemeinsame Logik (subscribe/notify) nur einmal implementiert

### 2. Navigation-Implementierung

#### Expo Router File-based Navigation

```typescript
// app/_layout.tsx - Root Layout

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
```

**Navigations-Struktur:**

```
app/
├── _layout.tsx          # Root Stack Navigator
└── (tabs)/              # Tab Navigator Group
    ├── _layout.tsx      # Tab Configuration + Context
    ├── index.tsx        # Game Tab
    ├── statistics.tsx   # Statistics Tab
    └── settings.tsx     # Settings Tab
```

#### Tab Navigation mit Shared ViewModels

```typescript
// app/(tabs)/_layout.tsx

// React Context für ViewModel-Sharing
const ViewModelsContext = createContext<{
  gameViewModel: GameViewModel;
  settingsViewModel: SettingsViewModel;
  statsViewModel: StatsViewModel;
} | null>(null);

// Custom Hook für ViewModel-Zugriff
export const useViewModels = () => {
  const context = useContext(ViewModelsContext);
  if (!context) {
    throw new Error('useViewModels must be used within a ViewModelsProvider');
  }
  return context;
};

export default function TabLayout() {
  const colorScheme = useColorScheme();

  // ViewModels werden EINMAL erstellt (Singleton per App-Session)
  const [gameViewModel] = useState(() => new GameViewModel());
  const [settingsViewModel] = useState(() => new SettingsViewModel());
  const [statsViewModel] = useState(() => new StatsViewModel());

  const viewModels = {
    gameViewModel,
    settingsViewModel,
    statsViewModel,
  };

  return (
    <ViewModelsContext.Provider value={viewModels}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Tabs
          screenOptions={{
            tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
            headerShown: false,
            tabBarButton: HapticTab,  // Custom Tab mit Haptic Feedback
          }}>
          <Tabs.Screen
            name="index"
            options={{
              title: 'Game',
              tabBarIcon: ({ color }) => <MaterialIcons size={28} name="gamepad" color={color} />,
            }}
          />
          <Tabs.Screen
            name="statistics"
            options={{
              title: 'Statistics',
              tabBarIcon: ({ color }) => <MaterialIcons size={28} name="bar-chart" color={color} />,
            }}
          />
          <Tabs.Screen
            name="settings"
            options={{
              title: 'Settings',
              tabBarIcon: ({ color }) => <MaterialIcons size={28} name="settings" color={color} />,
            }}
          />
        </Tabs>
      </GestureHandlerRootView>
    </ViewModelsContext.Provider>
  );
}
```

#### Screen-Implementierung mit Context

```typescript
// app/(tabs)/index.tsx - Game Tab

export default function GameScreen() {
  // Hole shared ViewModel aus Context
  const { gameViewModel } = useViewModels();

  // Übergebe ViewModel an View-Komponente
  return <MainGameView viewModel={gameViewModel} />;
}
```

```typescript
// app/(tabs)/statistics.tsx

export default function StatisticsScreen() {
  const { gameViewModel } = useViewModels();
  return <StatisticsView viewModel={gameViewModel} />;
}
```

```typescript
// app/(tabs)/settings.tsx

export default function SettingsScreen() {
  const { gameViewModel, settingsViewModel, statsViewModel } = useViewModels();

  return (
    <SettingsView
      settingsViewModel={settingsViewModel}
      gameViewModel={gameViewModel}
      statsViewModel={statsViewModel}
    />
  );
}
```

**Navigations-Features:**

✅ **File-based Routing:**
- Dateistruktur = Routing-Struktur
- Automatische Route-Generierung durch Expo Router

✅ **Shared State:**
- ViewModels werden im Tab Layout erstellt
- Alle Tabs teilen die gleichen ViewModel-Instanzen
- Änderungen in einem Tab sind sofort in anderen sichtbar

✅ **Haptic Tab Buttons:**
```typescript
// components/haptic-tab.tsx (Custom Tab Button)
export function HapticTab(props: BottomTabBarButtonProps) {
  return (
    <PlatformPressable
      {...props}
      onPressIn={(ev) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        props.onPressIn?.(ev);
      }}
    />
  );
}
```

✅ **Theme-Integration:**
- Dark/Light Mode Support
- Dynamische Farben basierend auf System-Theme

**Navigations-Fluss:**

```
User Interaction         Navigation              ViewModel
─────────────────────────────────────────────────────────────
Tap auf Tab "Game"   →   Route zu index.tsx  →   gameViewModel
                                                   wird injected

Tap auf Tab "Stats"  →   Route zu              →  GLEICHER gameViewModel
                         statistics.tsx            (shared context)

Purchase in Game     →   State-Update im       →  Statistics-View
                         gameViewModel            aktualisiert automatisch
                                                   (Observer Pattern)
```

### 3. Gestiksteuerung Umsetzung

#### Touch-Gesten (Basis-Interaktion)

```typescript
// src/views/MainGameView.tsx

const renderItem = ({ item }: { item: PurchaseItem }) => {
  return (
    <ThemedView style={styles.itemCard}>
      {/* Item-Informationen */}
      <ThemedText>{item.name}</ThemedText>
      <ThemedText>{formatCurrency(item.price)}</ThemedText>
      
      {/* Touch-Geste für Kauf */}
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

const handlePurchase = useCallback(async (item: PurchaseItem) => {
  if (viewModel.purchaseItem(item)) {
    await hapticPatterns.purchase();  // Haptisches Feedback
    
    if (viewModel.isGameCompleted()) {
      await hapticPatterns.gameComplete();
    }
  } else {
    await hapticPatterns.error();
    showStyledAlert('Cannot afford this item', 'You don\'t have enough money.');
  }
}, [viewModel, showStyledAlert]);
```

#### Shake-to-Undo (Accelerometer-basiert)

```typescript
// src/views/MainGameView.tsx

useEffect(() => {
  let lastShakeTime = 0;
  const SHAKE_THRESHOLD = 1.5;     // 1.5G Beschleunigung
  const SHAKE_COOLDOWN = 1000;     // 1 Sekunde Cooldown

  // Accelerometer konfigurieren
  Accelerometer.setUpdateInterval(100);  // 10 Hz Update-Rate
  
  const subscription = Accelerometer.addListener(({ x, y, z }) => {
    // Berechne Gesamt-Beschleunigung (Vektorlänge)
    const acceleration = Math.sqrt(x * x + y * y + z * z);
    const now = Date.now();
    
    // Shake erkannt?
    if (acceleration > SHAKE_THRESHOLD && now - lastShakeTime > SHAKE_COOLDOWN) {
      lastShakeTime = now;
      handleShake();
    }
  });

  // Cleanup beim Unmount
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
      Vibration.vibrate(50);
      showStyledAlert(
        'Undo Successful', 
        `Returned: ${lastItem.name} (+$${lastItem.price.toLocaleString()})`
      );
    }
  }
};
```

**Shake-Detection Algorithmus:**

```
1. Accelerometer liefert x, y, z Werte
   ↓
2. Berechne Magnitude: √(x² + y² + z²)
   ↓
3. Vergleiche mit Threshold (1.5G)
   ↓
4. Prüfe Cooldown (verhindere Doppel-Trigger)
   ↓
5. Führe Undo-Aktion aus
   ↓
6. Gebe haptisches Feedback
```

#### Scroll-Gesten

```typescript
// src/views/MainGameView.tsx

<FlatList
  data={allItems}
  renderItem={renderItem}
  keyExtractor={(item) => item.id}
  style={styles.itemsList}
  showsVerticalScrollIndicator={true}
  extraData={gameState.purchasedItems.length}  // Re-render bei Änderungen
/>
```

#### Pull-to-Refresh (Statistics View)

```typescript
// src/views/StatisticsView.tsx

const [isRefreshing, setIsRefreshing] = useState(false);

const handleRefresh = useCallback(async () => {
  setIsRefreshing(true);
  // Lade aktuelle Statistiken
  setTimeout(() => setIsRefreshing(false), 500);
}, []);

return (
  <ScrollView 
    refreshControl={
      <RefreshControl 
        refreshing={isRefreshing} 
        onRefresh={handleRefresh} 
      />
    }
  >
    {/* Statistics Content */}
  </ScrollView>
);
```

**Gesten-Übersicht:**

| Geste | Komponente | Aktion | Feedback |
|-------|-----------|--------|----------|
| **Tap** | Purchase Button | Item kaufen | Haptic Medium + Vibration 100ms |
| **Shake** | Game Screen | Letzten Kauf rückgängig | Haptic Success + Vibration 50ms |
| **Scroll** | FlatList | Item-Liste durchsuchen | Native Scroll-Feedback |
| **Pull-to-Refresh** | Statistics View | Stats aktualisieren | Refresh Indicator |
| **Tab Press** | Tab Bar | Navigation | Haptic Light |

### 4. Sensor/Aktor Demonstration

#### Sensor: Accelerometer

**Initialisierung:**

```typescript
import { Accelerometer } from 'expo-sensors';

// In useEffect
Accelerometer.setUpdateInterval(100);  // 100ms = 10 Hz

const subscription = Accelerometer.addListener(({ x, y, z }) => {
  // x, y, z sind in G (Erdbeschleunigung)
  // x: Links/Rechts, y: Oben/Unten, z: Vorne/Hinten
  const acceleration = Math.sqrt(x * x + y * y + z * z);
  
  if (acceleration > SHAKE_THRESHOLD) {
    // Shake erkannt!
  }
});
```

**Live-Demo Code:**

```typescript
// Beispiel: Accelerometer-Werte ausgeben (Debug)
Accelerometer.addListener(({ x, y, z }) => {
  console.log(`Accelerometer: x=${x.toFixed(2)}, y=${y.toFixed(2)}, z=${z.toFixed(2)}`);
});

// Normale Ausrichtung: (0, 0, 1) → 1G nach unten
// Shake: Magnitude > 1.5G
// z.B.: x=0.8, y=1.2, z=0.9 → √(0.64+1.44+0.81) = 1.89 → SHAKE!
```

#### Aktor: Haptic Engine

**Verschiedene Feedback-Pattern:**

```typescript
import * as Haptics from 'expo-haptics';

const hapticPatterns = {
  // Kauf-Bestätigung
  purchase: async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  },
  
  // Spiel abgeschlossen
  gameComplete: async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  },
  
  // Fehler (z.B. zu wenig Geld)
  error: async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  },
  
  // Tab-Navigation
  tabPress: async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  },
};
```

**Demo-Szenarien:**

**Szenario 1: Erfolgreicher Kauf**
```typescript
// User tippt auf "Buy Item"
handlePurchase(item) {
  if (viewModel.purchaseItem(item)) {
    // ✅ Kauf erfolgreich
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Vibration.vibrate(100);
    // User fühlt: Mittlere Vibration
  }
}
```

**Szenario 2: Fehler**
```typescript
// User will Item kaufen, hat aber nicht genug Geld
handlePurchase(item) {
  if (!viewModel.purchaseItem(item)) {
    // ❌ Fehler
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    Vibration.vibrate([100, 50, 100]);  // Doppel-Vibration
    // User fühlt: "Fehler-Pattern"
  }
}
```

**Szenario 3: Game Complete**
```typescript
// User gibt letztes Geld aus
if (viewModel.isGameCompleted()) {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  Vibration.vibrate([200, 100, 200, 100, 200, 100, 500]);
  // User fühlt: Triumphales Pattern 🎉
}
```

**Szenario 4: Shake-to-Undo**
```typescript
// User schüttelt Gerät
handleShake() {
  const success = viewModel.sellItem(lastItem);
  if (success) {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Vibration.vibrate(50);  // Kurzes Feedback
    // User fühlt: Bestätigung der Undo-Aktion
  }
}
```

#### Aktor: Vibration

**Pattern-Definition:**

```typescript
import { Vibration } from 'react-native';

// Einfache Vibration
Vibration.vibrate(100);  // 100ms

// Pattern: [Vibration, Pause, Vibration, Pause, ...]
Vibration.vibrate([200, 100, 200, 100, 200, 100, 500]);

// Vibration stoppen
Vibration.cancel();
```

**Verwendete Pattern:**

```typescript
const vibrationPatterns = {
  purchase: 100,                                      // Kurz
  error: [100, 50, 100],                             // Doppel-Pulse
  gameComplete: [200, 100, 200, 100, 200, 100, 500], // Feier-Rhythmus
  undo: 50,                                          // Sehr kurz
};
```

**Sensor-Aktor Flow:**

```
USER ACTION          SENSOR           VERARBEITUNG        AKTOR
────────────────────────────────────────────────────────────────────
Gerät schütteln  →   Accelerometer →  Magnitude > 1.5 →  Haptic Success
                     (x,y,z)          → sellItem()        + Vibration 50ms

Button drücken   →   Touch Event   →  purchaseItem()  →  Haptic Medium
                                       → success?          + Vibration 100ms

Tab wechseln     →   Touch Event   →  Navigation      →  Haptic Light

Game Complete    →   State Change  →  gameCompleted   →  Haptic Success
                                       = true              + Pattern Vibration
```

### 5. Persistente Datenspeicherung (mit Demo)

#### AsyncStorage Integration

```typescript
// src/viewmodels/GameViewModel.ts

import AsyncStorage from '@react-native-async-storage/async-storage';

// SPEICHERN
async saveGameState(): Promise<void> {
  try {
    // 1. Prepare Data (Dates → ISO Strings)
    const gameStateToSave = {
      ...this.gameState,
      startTime: this.gameState.startTime.toISOString(),
      endTime: this.gameState.endTime?.toISOString(),
    };
    
    // 2. Serialize to JSON
    const jsonValue = JSON.stringify(gameStateToSave);
    
    // 3. Save to AsyncStorage
    await AsyncStorage.setItem('@gameState', jsonValue);
    
    console.log('✅ Game state saved successfully');
  } catch (e) {
    console.error('❌ Failed to save game state', e);
  }
}

// LADEN
async loadGameState(): Promise<void> {
  try {
    // 1. Load from AsyncStorage
    const jsonValue = await AsyncStorage.getItem('@gameState');
    
    if (jsonValue != null) {
      // 2. Deserialize from JSON
      const loadedState = JSON.parse(jsonValue);
      
      // 3. Reconstruct Objects (ISO Strings → Dates)
      this.gameState = {
        ...loadedState,
        startTime: new Date(loadedState.startTime),
        endTime: loadedState.endTime ? new Date(loadedState.endTime) : undefined,
      };
      
      console.log('✅ Game state loaded successfully');
    }
  } catch (e) {
    console.error('❌ Failed to load game state', e);
  }
}
```

#### Gespeicherte Datenstrukturen

**1. Game State (`@gameState`):**

```json
{
  "currentBudget": 99999997800,
  "purchasedItems": [
    {
      "id": "big_mac",
      "name": "Big Mac",
      "price": 2,
      "category": "food",
      "description": "McDonald's signature burger"
    },
    {
      "id": "flip_flops",
      "name": "Flip Flops",
      "price": 3,
      "category": "clothing",
      "description": "Simple summer footwear"
    }
  ],
  "totalSpent": 2200,
  "gameCompleted": false,
  "startTime": "2025-10-04T10:30:00.000Z",
  "endTime": null
}
```

**2. Statistics (`@gameStatistics`):**

```json
{
  "gamesPlayed": 3,
  "fastestCompletion": 245,
  "averageItemsPerGame": 12.3,
  "favoriteCategory": "technology",
  "totalMoneySpent": 300000000000,
  "totalItemsPurchased": 37,
  "mostExpensiveItem": {
    "id": "nba_team",
    "name": "NBA Team",
    "price": 2120000000,
    "category": "business",
    "description": "Professional basketball team"
  }
}
```

#### Auto-Save Mechanismus

```typescript
// Nach jedem Kauf
purchaseItem(item: PurchaseItem): boolean {
  if (this.gameState.currentBudget >= item.price) {
    // Update State
    this.gameState.currentBudget -= item.price;
    this.gameState.purchasedItems.push({ ...item });
    
    // Auto-Save
    this.saveGameState();      // ← Speichert automatisch
    this.saveStatistics();     // ← Statistiken auch
    
    // Notify Views
    this.notifyChange();
    
    return true;
  }
  return false;
}
```

#### Daten-Initialisierung beim App-Start

```typescript
// src/viewmodels/GameViewModel.ts

constructor() {
  super();
  // Initiale States
  this.gameState = {
    currentBudget: 100000000000,
    purchasedItems: [],
    totalSpent: 0,
    gameCompleted: false,
    startTime: new Date(),
  };
  
  // Lade gespeicherte Daten
  this.initializeData();
}

private async initializeData(): Promise<void> {
  try {
    await Promise.all([
      this.loadGameState(),      // Lade Spielstand
      this.loadStatistics(),     // Lade Statistiken
    ]);
    this.isLoading = false;
    this.notifyChange();         // UI aktualisieren
  } catch (error) {
    console.error('Failed to initialize data:', error);
    this.isLoading = false;
    this.notifyChange();
  }
}
```

#### Demo: Datenspeicherung in Aktion

**Schritt 1: App-Start (Leerer State)**

```typescript
console.log('App startet...');
// → loadGameState() wird aufgerufen
// → AsyncStorage.getItem('@gameState') → null
// → Verwende initialen State
```

**Schritt 2: User kauft Items**

```typescript
viewModel.purchaseItem(bigMac);
// → gameState.currentBudget = 99999999998
// → gameState.purchasedItems = [bigMac]
// → saveGameState() wird aufgerufen
// → AsyncStorage.setItem('@gameState', JSON.stringify(...))
// ✅ Daten gespeichert
```

**Schritt 3: User kauft mehr Items**

```typescript
viewModel.purchaseItem(tesla);
// → gameState.currentBudget = 99999924998
// → gameState.purchasedItems = [bigMac, tesla]
// → saveGameState() wird aufgerufen
// ✅ Daten aktualisiert
```

**Schritt 4: App wird geschlossen**

```typescript
// AsyncStorage behält Daten:
// @gameState = {"currentBudget": 99999924998, "purchasedItems": [...], ...}
// @gameStatistics = {"gamesPlayed": 1, ...}
```

**Schritt 5: App wird neu geöffnet**

```typescript
console.log('App startet erneut...');
// → loadGameState() wird aufgerufen
// → AsyncStorage.getItem('@gameState') → gespeicherte Daten
// → Parse JSON und rekonstruiere State
// ✅ Fortschritt wiederhergestellt!

console.log('Budget:', viewModel.getRemainingBudget());
// → 99999924998 (gespeicherter Wert)
console.log('Purchased Items:', viewModel.getGameState().purchasedItems);
// → [bigMac, tesla] (gespeicherte Items)
```

#### Daten löschen (Settings)

```typescript
// src/viewmodels/GameViewModel.ts

async clearAllData(): Promise<void> {
  try {
    // Lösche alle gespeicherten Daten
    await AsyncStorage.multiRemove(['@gameState', '@gameStatistics']);
    console.log('✅ All data cleared');
    
    // Reset in-memory State
    this.gameState = {
      currentBudget: 100000000000,
      purchasedItems: [],
      totalSpent: 0,
      gameCompleted: false,
      startTime: new Date(),
    };
    this.statistics = {
      gamesPlayed: 0,
      averageItemsPerGame: 0,
      totalMoneySpent: 0,
      totalItemsPurchased: 0,
    };
    
    this.notifyChange();
  } catch (e) {
    console.error('❌ Failed to clear data', e);
  }
}
```

**Demo in Settings View:**

```typescript
// src/views/SettingsView.tsx

const handleResetData = useCallback(() => {
  showStyledAlert(
    'Reset All Data',
    'This will permanently delete all game progress. Continue?',
    async () => {
      await gameViewModel.clearAllData();
      showStyledAlert('Success', 'All data has been reset.');
    }
  );
}, [gameViewModel]);

// Button in UI
<ActionButton
  title="Reset All Data"
  onPress={handleResetData}
  variant="destructive"
/>
```

#### Persistenz-Strategie Übersicht

```
┌─────────────────────────────────────────────────────────────┐
│                    PERSISTENZ-FLOW                          │
└─────────────────────────────────────────────────────────────┘

APP START
    ↓
┌─────────────────────┐
│ loadGameState()     │  ← Lade von AsyncStorage
│ loadStatistics()    │
└─────────────────────┘
    ↓
┌─────────────────────┐
│ In-Memory State     │  ← GameViewModel.gameState
│ (Runtime)           │  ← GameViewModel.statistics
└─────────────────────┘
    ↓
USER INTERACTION
    ↓
┌─────────────────────┐
│ purchaseItem()      │  ← Business Logic
│ sellItem()          │
│ resetGame()         │
└─────────────────────┘
    ↓
┌─────────────────────┐
│ AUTO-SAVE           │  ← saveGameState()
│                     │  ← saveStatistics()
└─────────────────────┘
    ↓
┌─────────────────────┐
│ AsyncStorage        │  ← Persistenter Speicher
│ @gameState          │
│ @gameStatistics     │
└─────────────────────┘
    ↓
APP CLOSE / REOPEN
    ↓
[Cycle wiederholt sich]
```

**Storage Keys:**

| Key | Inhalt | Update-Trigger |
|-----|--------|----------------|
| `@gameState` | Aktueller Spielstand | Nach jedem Kauf/Verkauf |
| `@gameStatistics` | Kumulative Statistiken | Nach jedem Kauf/Spiel-Ende |

**Persistenz-Features:**

✅ **Auto-Save:** Automatisches Speichern nach jeder Aktion
✅ **State Restoration:** Vollständige Wiederherstellung beim App-Start
✅ **Offline-First:** Keine Internet-Verbindung nötig
✅ **Atomic Updates:** Jede Aktion speichert konsistenten State
✅ **Data Migration:** ISO Strings für Dates (JSON-kompatibel)

## Erklärung des Artefakts

Die Implementierung zeigt eine vollständige MVVM-basierte React Native App mit Expo:

**MVVM-Architektur:** Die App ist sauber in Model (Datenstrukturen), ViewModel (Business-Logik) und View (UI) aufgeteilt. Das Observer Pattern ermöglicht reaktive UI-Updates. BaseViewModel implementiert die gemeinsame Subscribe/Notify-Logik, die alle spezialisierten ViewModels erben.

**Navigation:** Expo Router mit file-based routing organisiert die App-Struktur. Tab-Navigation ermöglicht schnellen Wechsel zwischen Game, Statistics und Settings. ViewModels werden per React Context geteilt, sodass alle Tabs den gleichen State sehen.

**Gestiksteuerung:** Touch-Gesten für Käufe, Accelerometer-basiertes Shake-to-Undo für Rückgängig-Funktion, Pull-to-Refresh in Statistics. Jede Geste gibt haptisches Feedback.

**Sensoren/Aktoren:** Accelerometer erkennt Schüttel-Bewegungen mit Schwellenwert und Cooldown. Haptic Engine und Vibration geben differenziertes Feedback für verschiedene Events (Kauf, Fehler, Game Complete, Undo).

**Persistenz:** AsyncStorage speichert GameState und Statistics automatisch nach jeder Änderung. Beim App-Start werden Daten wiederhergestellt. Settings ermöglichen komplettes Zurücksetzen.

## Kritische Beurteilung

### Stärken der Implementierung:

✅ **Saubere MVVM-Architektur:**
- Klare Trennung der Verantwortlichkeiten
- Observer Pattern für Reaktivität
- Wiederverwendbarer BaseViewModel
- Views sind rein deklarativ ohne Business-Logik

✅ **Robuste Navigation:**
- File-based Routing ist intuitiv und wartbar
- Shared ViewModels via Context verhindern Prop-Drilling
- Haptic Feedback bei Tab-Navigation verbessert UX
- Theme-Support (Dark/Light Mode)

✅ **Innovative Gestiksteuerung:**
- Shake-to-Undo ist einzigartig und benutzerfreundlich
- Accelerometer-Algorithmus mit Cooldown verhindert False-Positives
- Touch-Interaktionen sind responsiv und intuitiv
- Pull-to-Refresh in Statistics ist Standard-konform

✅ **Durchdachte Sensor-Integration:**
- Accelerometer läuft nur wenn nötig (Cleanup in useEffect)
- Schwellenwerte sind kalibriert (1.5G funktioniert zuverlässig)
- Haptic Patterns sind differenziert und erkennbar
- Vibration-Pattern unterstützen das Feedback

✅ **Zuverlässige Persistenz:**
- Auto-Save nach jeder Aktion verhindert Datenverlust
- JSON-Serialisierung mit Date-Konvertierung funktioniert robust
- State Restoration beim App-Start ist vollständig
- Offline-First Design (keine Server nötig)

### Verbesserungspotenzial:

⚠️ **MVVM-Architektur:**
- **Fehlend:** Dependency Injection (ViewModels werden mit `new` erstellt)
- **Fehlend:** Unit Tests für ViewModels
- **Fehlend:** Error Handling in ViewModels (try/catch in Views)
- → DI-Container würde Testbarkeit verbessern

⚠️ **Navigation:**
- **Limitation:** Nur Tab-Navigation, keine Stack-Navigation innerhalb Tabs
- **Fehlend:** Deep Linking für externe Links
- **Fehlend:** Navigation Guards (z.B. "Wollen Sie wirklich verlassen?")
- → Modal-Screens für Item-Details wären sinnvoll

⚠️ **Gestiksteuerung:**
- **Fehlend:** Swipe-to-Delete für Items in Liste
- **Fehlend:** Long-Press für Item-Details
- **Fehlend:** Pinch-to-Zoom für Item-Kategorien
- **Fehlend:** Double-Tap für Schnellkauf
- → Mehr Gesten würden Power-User ansprechen

⚠️ **Sensoren:**
- **Limitation:** Nur Accelerometer verwendet
- **Potenzial:** Gyroscope für Tilt-basierte Navigation
- **Potenzial:** Proximity Sensor für Hands-Free
- **Potenzial:** Light Sensor für Auto-Brightness
- → Batterie-Verbrauch durch dauerhaftes Accelerometer-Polling

⚠️ **Persistenz:**
- **Limitation:** Nur lokaler Speicher (kein Cloud-Sync)
- **Limitation:** Keine Backup-Funktion (Export/Import)
- **Limitation:** Keine Versionierung (Migration bei Schema-Änderungen)
- **Fehlend:** Compression für grosse Datenmengen
- → SQLite wäre bei sehr vielen Items performanter

⚠️ **Error Handling:**
- **Fehlend:** Globale Error Boundary
- **Fehlend:** Retry-Logik bei AsyncStorage-Fehlern
- **Fehlend:** Offline-Indikator (obwohl app offline-first ist)
- → Production-App bräuchte robusteres Error-Management

⚠️ **Performance:**
- **Issue:** FlatList rendert alle Items (keine Virtualisierung nötig bei 45 Items)
- **Issue:** Accelerometer läuft kontinuierlich (auch wenn Screen inaktiv)
- **Potenzial:** Memoization von View-Komponenten
- → Bei Scale-Up würde Performance leiden

⚠️ **Accessibility:**
- **Fehlend:** Screen-Reader Support (Labels für Buttons)
- **Fehlend:** Voice-Over Navigation
- **Fehlend:** Kontrast-Modi werden nicht respektiert
- **Fehlend:** Font-Scaling
- → Settings-Option zum Deaktivieren von Haptic/Shake fehlt

### Fazit:

Die Implementierung erfüllt **alle Anforderungen von HZ3** vollständig und demonstriert moderne Mobile-Development Best Practices:

**MVVM:** ✅ Sauber implementiert mit Observer Pattern
**Navigation:** ✅ Expo Router mit Shared Context funktioniert einwandfrei  
**Gestik:** ✅ Touch + Shake sind intuitiv und funktional
**Sensoren:** ✅ Accelerometer + Haptics sind gut kalibriert
**Persistenz:** ✅ AsyncStorage mit Auto-Save ist zuverlässig

**Erfüllungsgrad: 100%** - Alle geforderten Aspekte sind implementiert und funktionieren.

Die identifizierten Verbesserungspotenziale (DI, mehr Sensoren, Cloud-Sync, A11y) gehen über die Grundanforderungen hinaus und wären Features für eine Production-Version.

**Lessons Learned:**
- MVVM mit Observer Pattern ermöglicht saubere Architektur in React
- Shared Context ist elegante Lösung für ViewModel-Sharing
- Accelerometer braucht Tuning (Threshold + Cooldown) für gute UX
- AsyncStorage ist ausreichend für MVP, braucht aber Error-Handling
- Haptisches Feedback verbessert Mobile UX signifikant
- File-based Routing (Expo Router) ist wartbarer als Code-based Routing
