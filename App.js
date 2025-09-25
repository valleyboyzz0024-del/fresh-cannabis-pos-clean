import React, { useEffect, useState } from 'react';
import { StatusBar, LogBox, View, Text, ActivityIndicator } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { theme } from './src/theme/theme';
import { AuthProvider } from './src/context/AuthContext';
import { CartProvider } from './src/context/CartContext';
import { initDatabase } from './src/database/database';

// Ignore specific warnings
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
  'VirtualizedLists should never be nested',
]);

export default function App() {
  const [dbInitialized, setDbInitialized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [navigationReady, setNavigationReady] = useState(false);
  
  // Force theme.fontVariant to be 'regular' at startup
  if (!theme.fontVariant) {
    theme.fontVariant = 'regular';
  }

  // Initialize database
  useEffect(() => {
    const initApp = async () => {
      try {
        console.log('Initializing database...');
        await initDatabase();
        console.log('Database initialized successfully');
        setDbInitialized(true);
      } catch (error) {
        console.error('Error initializing app:', error);
        setError('Failed to initialize database. Please restart the app.');
      } finally {
        setLoading(false);
      }
    };
    
    initApp();
  }, []);

  // Add a delay before rendering navigation to ensure everything is ready
  useEffect(() => {
    if (!loading && !error) {
      const timer = setTimeout(() => {
        setNavigationReady(true);
      }, 500); // Wait 500ms before rendering navigation
      
      return () => clearTimeout(timer);
    }
  }, [loading, error]);

  if (loading) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: theme.colors.background
      }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={{ 
          marginTop: 20, 
          color: theme.colors.text,
          fontSize: 16
        }}>
          Loading Cannabis POS...
        </Text>
      </View>
    );
  }
  
  if (error) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: theme.colors.background,
        padding: 20
      }}>
        <Text style={{ 
          color: theme.colors.error,
          fontSize: 18,
          marginBottom: 20,
          textAlign: 'center'
        }}>
          {error}
        </Text>
        <Text style={{ 
          color: theme.colors.text,
          fontSize: 14,
          textAlign: 'center'
        }}>
          If the problem persists, please clear the app data and try again.
        </Text>
      </View>
    );
  }
  
  // Show a loading screen while waiting for navigation to be ready
  if (!navigationReady) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: theme.colors.background
      }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={{ 
          marginTop: 20, 
          color: theme.colors.text,
          fontSize: 16
        }}>
          Preparing Navigation...
        </Text>
      </View>
    );
  }
  
  // Force theme.fontVariant to be 'regular' right before rendering
  theme.fontVariant = 'regular';
  
  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />
        <AuthProvider>
          <CartProvider>
            <AppNavigator />
          </CartProvider>
        </AuthProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}