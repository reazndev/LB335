# Handlungsziel 2: Planung und Architektur der mobilen Applikation

## Artefakt

Als Artefakt für HZ2 habe ich die komplette technische Planung und Architekturdokumentation meiner "Spend the Billions" App erstellt. Dies umfasst:

1. **Architektur-Diagramm** (siehe unten)
2. **Technologie-Stack Dokumentation**
3. **Datenmodell und Speicherkonzept**
4. **Sensor- und Gestensteuerungskonzept**

### Architektur-Übersicht

```
┌─────────────────────────────────────────┐
│           Views (React Native)          │
│  ┌────────────┐  ┌────────────────────┐ │
│  │  MainGame  │  │  Settings  │ Stats │ │
│  └────────────┘  └────────────────────┘ │
└─────────────────────────────────────────┘
                    ↕
┌─────────────────────────────────────────┐
│           ViewModels (MVVM)             │
│  ┌────────────┐  ┌────────────────────┐ │
│  │   Game     │  │ Settings │  Stats  │ │
│  │ ViewModel  │  │ViewModel │ViewModel│ │
│  └────────────┘  └────────────────────┘ │
└─────────────────────────────────────────┘
                    ↕
┌─────────────────────────────────────────┐
│         Models (Data Layer)             │
│  ┌────────────┐  ┌────────────────────┐ │
│  │ GameState  │  │ PurchaseItem       │ │
│  │ Statistics │  │ AppSettings        │ │
│  └────────────┘  └────────────────────┘ │
└─────────────────────────────────────────┘
                    ↕
┌─────────────────────────────────────────┐
│    Persistente Speicherung              │
│        AsyncStorage (lokal)             │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│    Sensoren & Aktoren                   │
│  • Accelerometer (Shake-to-Undo)        │
│  • Haptic Feedback (Vibration)          │
│  • Gestures (Touch/Swipe)               │
└─────────────────────────────────────────┘
```

## Nachweis der Zielerreichung

### 1. Begründung des gewählten Applikationstyps

**Gewählter Typ: Native Mobile App mit Expo/React Native**

#### Begründung:

**Cross-Platform Entwicklung:**
- Die App wird mit Expo und React Native entwickelt, um sowohl iOS als auch Android mit einer Codebasis zu unterstützen
- Einfache Entwicklung und Testing dank Expo Go App

**Native Features:**
- Zugriff auf native Sensoren (Accelerometer) für Shake-Gesten
- Haptic Feedback für besseres Benutzererlebnis
- Offline-Funktionalität durch lokale Datenspeicherung
- Native UI-Komponenten für plattformspezifisches Look & Feel

**Technische Vorteile:**
```json
// package.json Auszug
{
  "dependencies": {
    "expo": "~54.0.9",
    "react-native": "0.81.4",
    "expo-sensors": "~15.0.7",          // Sensor-Integration
    "expo-haptics": "~15.0.7",           // Haptisches Feedback
    "@react-native-async-storage/async-storage": "^2.2.0"  // Persistenz
  }
}
```

**Alternative Optionen und deren Ablehnung:**
- Native (Swift/Kotlin): Doppelter Entwicklungsaufwand für beide Plattformen (neue Programmiersprache)
- Dotnet Maui: Ich mag kein C# und kenne React bereits

### 2. Planung der Datenspeicherung

**Gewählte Lösung: AsyncStorage (lokale Persistenz)**

#### Implementierung:

```typescript
// GameViewModel.ts - Speicherkonzept
async saveGameState(): Promise<void> {
  try {
    const gameStateToSave = {
      ...this.gameState,
      startTime: this.gameState.startTime.toISOString(),
      endTime: this.gameState.endTime?.toISOString(),
    };
    const jsonValue = JSON.stringify(gameStateToSave);
    await AsyncStorage.setItem('@gameState', jsonValue);
  } catch (e) {
    console.error('Failed to save game state', e);
  }
}
```

#### Gespeicherte Datenstrukturen:

**1. Game State (`@gameState`):**
```typescript
{
  currentBudget: number,        // Aktuelles verfügbares Budget
  purchasedItems: PurchaseItem[], // Liste gekaufter Items
  totalSpent: number,           // Gesamt ausgegebener Betrag
  gameCompleted: boolean,       // Spielstatus
  startTime: Date,              // Spielstart
  endTime?: Date                // Spielende
}
```

**2. Statistiken (`@gameStatistics`):**
```typescript
{
  gamesPlayed: number,          // Anzahl gespielter Spiele
  averageItemsPerGame: number,  // Durchschnitt Items pro Spiel
  totalMoneySpent: number,      // Total ausgegebenes Geld
  totalItemsPurchased: number,  // Total gekaufte Items
  mostExpensiveItem?: PurchaseItem,
  favoriteCategory?: string,
  fastestCompletion?: number    // Schnellste Completion-Zeit
}
```

#### Speicher-Strategie:

**Auto-Save:**
- Nach jedem Kauf wird der State automatisch persistiert
- Bei jedem Verkauf wird der State aktualisiert
- Statistiken werden inkrementell aktualisiert

**Datenwiederherstellung:**
```typescript
async loadGameState(): Promise<void> {
  try {
    const jsonValue = await AsyncStorage.getItem('@gameState');
    if (jsonValue != null) {
      const loadedState = JSON.parse(jsonValue);
      this.gameState = {
        ...loadedState,
        startTime: new Date(loadedState.startTime),
        endTime: loadedState.endTime ? new Date(loadedState.endTime) : undefined,
      };
    }
  } catch (e) {
    console.error('Failed to load game state', e);
  }
}
```

**Vorteile AsyncStorage:**
- Funktioniert ohne Internetverbindung
- Schnell
- Einfach, keine komplexe Datenbank nötig
- Privat, Daten bleiben locally auf dem Gerät

### 3. Planung der Gestiksteuerung

**Implementierte Gesten:**

#### 1. Touch-Gesten (Basic Interaction)
```typescript
// MainGameView.tsx - Touch-basierte Käufe
<ThemedView
  style={[styles.purchaseButton]}
  onTouchEnd={() => handlePurchase(item)}
>
  <ThemedText>Buy Item</ThemedText>
</ThemedView>
```


#### 2. Shake-to-Undo (Accelerometer-basiert)
```typescript
// MainGameView.tsx - Shake Detection
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

  return () => subscription.remove();
}, [gameState.purchasedItems]);
```

**Funktionsweise:**

Wenn eine Beschleunigung von 1.5G erkannt wird, wird der Shake registriert. Ausserdem habe ich einen 1 Sekunden Cooldown implementiert. Danach wird der letzte Einkauf rueckgaengig gemacht und ein Pop up erscheint.


#### 3. Scroll-Gesten 
```typescript
<FlatList
  data={allItems}
  renderItem={renderItem}
  keyExtractor={(item) => item.id}
  showsVerticalScrollIndicator={true}
/>
```

**Gestik-Konzept Übersicht:**

| Geste | Aktion | Feedback |
|-------|--------|----------|
| **Tap** | Item kaufen | Haptisches Feedback + Vibration |
| **Shake** | Letzten Kauf rückgängig | Vibration + Alert-Anzeige |
| **Scroll** | Liste durchblättern | Smooth Scrolling |
| **Long Press** | (Geplant) Item-Details | - |

### 4. Planung Sensoren und Aktoren

#### Eingesetzte Sensoren:

**1. Accelerometer (expo-sensors)**
```typescript
import { Accelerometer } from 'expo-sensors';

// Konfiguration
Accelerometer.setUpdateInterval(100); // 10 Hz Update-Rate

// Shake-Detection Algorithmus
const acceleration = Math.sqrt(x * x + y * y + z * z);
if (acceleration > SHAKE_THRESHOLD) {
  handleShake();
}
```

**Verwendungszweck:**
- Shake-Erkennung für Undo-Funktion
- Intuitive Interaktion ohne UI-Buttons
- Natürliches "Rückgängig-machen" durch Schütteln

**Technische Details:**
- Update-Intervall: 100ms (10 Hz)
- Schwellenwert: 1.5G Beschleunigung
- Cooldown: 1 Sekunde zwischen Aktionen
- Cleanup: Subscription wird ordnungsgemäss entfernt

#### Eingesetzte Aktoren:

**1. Haptic Engine (expo-haptics)**
```typescript
import * as Haptics from 'expo-haptics';

const hapticPatterns = {
  purchase: async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  },
  gameComplete: async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  },
  error: async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  },
};
```

**Haptische Feedback-Pattern:**
- **Kauf:** Medium Impact → Bestätigendes Gefühl
- **Spiel-Abschluss:** Success Notification → Triumphales Feedback
- **Fehler:** Error Notification → Warnendes Signal

**2. Vibration (react-native)**
```typescript
import { Vibration } from 'react-native';

// Einfache Vibration
Vibration.vibrate(100);

// Pattern für Spielende
Vibration.vibrate([200, 100, 200, 100, 200, 100, 500]);
```

**Vibrations-Pattern:**
- **Kauf:** 100ms kurze Bestätigung
- **Shake-Undo:** 50ms subtiles Feedback
- **Game Complete:** Rhythmisches Pattern (200-100-200-100-200-100-500ms)
- **Fehler:** Doppel-Vibration (100-50-100ms)

#### Sensor/Aktor Integration Übersicht:

```
USER ACTION          SENSOR              LOGIC               AKTOR
─────────────────────────────────────────────────────────────────────
Tap auf "Buy"    →   Touch              → Purchase Check  → Haptic Medium
                                                           → Vibration 100ms

Device Shake     →   Accelerometer      → Undo Last      → Haptic Success
                     (x,y,z > 1.5G)        Purchase        → Vibration 50ms

Game Complete    →   State Change       → Completion     → Haptic Success
                                           Detected        → Pattern Vibration

Insufficient $   →   Budget Check       → Error Alert    → Haptic Error
                                                           → Error Vibration
```

## Erklärung des Artefakts

Das Artefakt zeigt die vollständige technische Planung der "Spend the Billions" Applikation:

**Applikationstyp:** Die App ist als native mobile Anwendung mit React Native/Expo konzipiert, um plattformübergreifende Kompatibilität bei voller Nutzung nativer Features zu gewährleisten. Die Wahl fiel auf React Native, da dies Cross-Platform-Entwicklung mit Zugriff auf native APIs (Sensoren, Haptik) ermöglicht.

**Speicherkonzept:** Ich habe AsyncStorage für lokale Persistenz gewählt. Die App speichert zwei Hauptdatenstrukturen: den aktuellen Spielzustand (`@gameState`) und kumulative Statistiken (`@gameStatistics`). Auto-Save nach jeder Transaktion garantiert, dass keine Daten verloren gehen.

**Gestiksteuerung:** Die App implementiert mehrere Interaktionsebenen:
- Touch-basierte Käufe für direkte Interaktion
- Shake-to-Undo basierend auf Accelerometer-Daten für intuitives Rückgängigmachen
- Scroll-Gesten für die Navigation durch Items

**Sensoren/Aktoren:** Der Accelerometer erkennt Schüttel-Bewegungen für die Undo-Funktion. Als Feedback kommen Haptic Engine und Vibration zum Einsatz, um verschiedene Aktionen (Kauf, Fehler, Spielende) mit unterschiedlichen haptischen Mustern zu bestätigen.

## Kritische Beurteilung

### Stärken der Umsetzung:

✅ **Durchdachte Architektur:**
- Klare Trennung zwischen View, ViewModel und Model (MVVM)
- Wiederverwendbare Komponenten und Logik
- Saubere Abhängigkeitshierarchie

✅ **Robuste Datenspeicherung:**
- Auto-Save verhindert Datenverlust
- Inkrementelle Statistik-Updates sind performant
- JSON-Serialisierung ist zukunftssicher für Erweiterungen

✅ **Intuitive Gestiksteuerung:**
- Shake-to-Undo ist innovativ und benutzerfreundlich
- Cooldown verhindert versehentliche Mehrfach-Aktionen
- Touch-Interaktionen sind responsiv

✅ **Differenziertes Feedback:**
- Unterschiedliche haptische Pattern für verschiedene Events
- Vibrations-Muster sind erkennbar und sinnvoll
- Sensorintegration funktioniert zuverlässig

### Verbesserungspotenzial:

⚠️ **Erweiterte Gesten:**
- **Fehlend:** Swipe-Gesten zum Verkaufen von Items
- **Fehlend:** Long-Press für Item-Details
- **Fehlend:** Pinch-to-Zoom für Item-Kategorien
- → Könnte die Benutzerinteraktion noch intuitiver machen

⚠️ **Speicher-Limitationen:**
- Nur lokale Speicherung, keine Cloud-Synchronisation
- Kein Backup-Mechanismus bei App-Deinstallation
- Keine Möglichkeit für Geräte-übergreifenden Fortschritt
- → Multi-Device Support würde die App aufwerten

⚠️ **Sensor-Nutzung:**
- Nur Accelerometer wird verwendet
- **Potenzial:** Gyroscope für Tilt-Steuerung
- **Potenzial:** Proximity Sensor für Hands-Free Features
- **Potenzial:** Ambient Light Sensor für Auto-Theme
- → Weitere Sensoren könnten das Erlebnis bereichern

⚠️ **Accessibility:**
- Haptisches Feedback kann nicht für alle Benutzer deaktiviert werden
- Keine Alternative für Shake-Geste bei eingeschränkter Motorik
- → Settings sollten Optionen zum Deaktivieren bieten

⚠️ **Performance-Optimierung:**
- AsyncStorage ist für grosse Datenmengen limitiert
- Bei vielen Statistik-Einträgen könnte SQLite besser sein
- Accelerometer läuft kontinuierlich (Batterie-Verbrauch)
- → Optimierungsbedarf bei Scale-Up

### Fazit:

Die Planung deckt alle Aspekte von HZ2 ab: Applikationstyp ist begründet gewählt, Speicherung ist funktional implementiert, Gestiksteuerung ist innovativ, und Sensoren/Aktoren sind sinnvoll eingesetzt. Die Architektur ist solide und erweiterbar.

**Erfüllungsgrad:** Die Planung erfüllt die Anforderungen vollständig. Die technischen Entscheidungen sind nachvollziehbar dokumentiert und in Code umgesetzt. Verbesserungspotenzial besteht vor allem in erweiterten Features (Cloud-Sync, mehr Sensoren), was aber über die Grundanforderungen hinausgeht.

**Lessons Learned:**
- Cross-Platform-Entwicklung erfordert sorgfältige Planung der nativen Features
- Sensor-Integration braucht Cooldowns und Schwellenwerte für Stabilität
- Haptisches Feedback verbessert UX signifikant, sollte aber konfigurierbar sein
- Lokale Speicherung ist ausreichend für MVP, Cloud-Sync wäre nice-to-have
