import { StatusBar } from 'expo-status-bar';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import DemoScreen from './src/screens/DemoScreen';
import { TapsilatProvider } from './src/sdk/TapsilatProvider';

export default function App() {
  return (
    <TapsilatProvider>
      <SafeAreaProvider>
        <SafeAreaView style={styles.safeArea}>
          <StatusBar style="dark" />
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.container}>
              <DemoScreen />
            </View>
          </ScrollView>
        </SafeAreaView>
      </SafeAreaProvider>
    </TapsilatProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f6f7fb'
  },
  scrollContent: {
    flexGrow: 1
  },
  container: {
    flex: 1,
    padding: 24,
    gap: 24
  }
});
