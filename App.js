import React from 'react';
import { StatusBar, LogBox } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { theme } from './src/theme/theme';
import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider } from './src/context/AuthContext';
import { CartProvider } from './src/context/CartContext';
import { initializeDatabase } from './src/database/database';

// Ignore specific warnings
LogBox.ignoreLogs([
  'Animated: `useNativeDriver` was not specified',
  'shadow* style props are deprecated',
  'props.pointerEvents is deprecated'
]);

// Initialize the database
console.log('Initializing database...');
initializeDatabase()
  .then(() => {
    console.log('Database initialized successfully');
  })
  .catch(error => {
    console.error('Database initialization failed:', error);
  });

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={theme.colors.background}
        />
        <AuthProvider>
          <CartProvider>
            <AppNavigator />
          </CartProvider>
        </AuthProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}