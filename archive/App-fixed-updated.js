import React, { useEffect, useState } from 'react';
import { StatusBar, LogBox, View, Text, ActivityIndicator, Platform } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { theme } from './src/theme/theme';
import { AuthProvider } from './src/context/AuthContext';
import { CartProvider } from './src/context/CartContext';
import { initDatabase } from './src/database/database';
import ErrorHandler from './src/utils/ErrorHandler';
import createSafeTheme from './src/utils/safeTheme';

// Only set the global error handler on native platforms where ErrorUtils is defined
if (Platform.OS !== 'web' && typeof global.ErrorUtils !== 'undefined') {
  global.ErrorUtils.setGlobalHandler(ErrorHandler);
} else {
  // For web, use a different error handling approach
  if (typeof window !== 'undefined') {
    window.onerror = (message, source, lineno, colno, error) => {
      console.error('Global error caught:', error);
      // You can add web-specific error handling here
      return false; // Let the default handler run as well
    };
  }
}

// Create a safe version of the theme
const safeTheme = createSafeTheme(theme);

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
  
  // Ensure theme has all required properties
  useEffect(() => {
    // Make sure theme.fonts exists
    if (!theme.fonts) {
      theme.fonts = {};
    }
    
    // Make sure theme.sizes exists
    if (!theme.sizes) {
      theme.sizes = {
        small: 8,
        medium: 16,
        large: 24,
        xlarge: 32
      };
    }
    
    // Ensure fontVariant is set
    theme.fontVariant = 'regular';
    
    // Add missing font variants if needed
    const requiredVariants = ['regular', 'medium', 'light', 'thin', 'bold', 'bodyMedium', 'bodySmall', 'bodyLarge'];
    requiredVariants.forEach(variant => {
      if (!theme.fonts[variant]) {
        theme.fonts[variant] = {
          fontFamily: 'System',
          fontWeight: variant === 'bold' ? 'bold' : variant === 'medium' ? '500' : 'normal',
          fontSize: variant.includes('Small') ? 12 : variant.includes('Large') ? 16 : 14
        };
      }
    });
  }, []);

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
        backgroundColor: safeTheme.getColor('background')
      }}>
        <ActivityIndicator size="large" color={safeTheme.getColor('primary')} />
        <Text style={{ 
          marginTop: 20, 
          color: safeTheme.getColor('text'),
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
        backgroundColor: safeTheme.getColor('background'),
        padding: 20
      }}>
        <Text style={{ 
          color: safeTheme.getColor('error'),
          fontSize: 18,
          marginBottom: 20,
          textAlign: 'center'
        }}>
          {error}
        </Text>
        <Text style={{ 
          color: safeTheme.getColor('text'),
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
        backgroundColor: safeTheme.getColor('background')
      }}>
        <ActivityIndicator size="large" color={safeTheme.getColor('primary')} />
        <Text style={{ 
          marginTop: 20, 
          color: safeTheme.getColor('text'),
          fontSize: 16
        }}>
          Preparing Navigation...
        </Text>
      </View>
    );
  }
  
  // Make the safe theme available to the entire app
  theme.safe = safeTheme;
  
  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <StatusBar barStyle="light-content" backgroundColor={safeTheme.getColor('background')} />
        <AuthProvider>
          <CartProvider>
            <AppNavigator />
          </CartProvider>
        </AuthProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}