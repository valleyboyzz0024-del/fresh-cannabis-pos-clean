import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Import screens
import LoginScreen from '../screens/LoginScreen';
import DashboardScreen from '../screens/DashboardScreen';
import SalesScreen from '../screens/SalesScreen';
import CartScreen from '../screens/CartScreen';
import InventoryScreen from '../screens/InventoryScreen';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import SaleDetailScreen from '../screens/SaleDetailScreen';
import SettingsScreen from '../screens/SettingsScreen';
import CashFloatScreen from '../screens/CashFloatScreen';

import { theme } from '../theme/theme';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Simple static header configuration
const staticHeader = {
  title: 'Cannabis POS',
  headerShown: false
};

const SalesStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen 
      name="SalesMain" 
      component={SalesScreen} 
      options={{ headerShown: false }} 
    />
    <Stack.Screen 
      name="Cart" 
      component={CartScreen} 
      options={{ headerShown: false }} 
    />
    <Stack.Screen 
      name="SaleDetail" 
      component={SaleDetailScreen} 
      options={{ headerShown: false }} 
    />
    <Stack.Screen 
      name="ProductDetail" 
      component={ProductDetailScreen} 
      options={{ headerShown: false }} 
    />
  </Stack.Navigator>
);

const InventoryStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen 
      name="InventoryMain" 
      component={InventoryScreen} 
      options={{ headerShown: false }} 
    />
    <Stack.Screen 
      name="ProductDetail" 
      component={ProductDetailScreen} 
      options={{ headerShown: false }} 
    />
  </Stack.Navigator>
);

const SettingsStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen 
      name="SettingsMain" 
      component={SettingsScreen} 
      options={{ headerShown: false }} 
    />
    <Stack.Screen 
      name="CashFloat" 
      component={CashFloatScreen} 
      options={{ headerShown: false }} 
    />
  </Stack.Navigator>
);

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: theme.colors.primary,
      tabBarInactiveTintColor: theme.colors.disabled,
      tabBarStyle: {
        backgroundColor: theme.colors.surface,
        borderTopWidth: 0,
        elevation: 8,
        height: 60,
        paddingBottom: 8,
        paddingTop: 8,
      }
    }}
  >
    <Tab.Screen 
      name="Dashboard" 
      component={DashboardScreen} 
      options={{
        headerShown: false,
        tabBarIcon: ({ color, size }) => (
          <MaterialCommunityIcons name="view-dashboard" color={color} size={size} />
        ),
      }}
    />
    <Tab.Screen 
      name="Sales" 
      component={SalesStack} 
      options={{
        headerShown: false,
        tabBarIcon: ({ color, size }) => (
          <MaterialCommunityIcons name="cash-register" color={color} size={size} />
        ),
      }}
    />
    <Tab.Screen 
      name="Inventory" 
      component={InventoryStack} 
      options={{
        headerShown: false,
        tabBarIcon: ({ color, size }) => (
          <MaterialCommunityIcons name="package-variant-closed" color={color} size={size} />
        ),
      }}
    />
    <Tab.Screen 
      name="Settings" 
      component={SettingsStack} 
      options={{
        headerShown: false,
        tabBarIcon: ({ color, size }) => (
          <MaterialCommunityIcons name="cog" color={color} size={size} />
        ),
      }}
    />
  </Tab.Navigator>
);

const AppNavigator = () => {
  return (
    <NavigationContainer
      theme={{
        dark: true,
        colors: {
          primary: theme.colors.primary,
          background: theme.colors.background,
          card: theme.colors.surface,
          text: theme.colors.text,
          border: theme.colors.border,
          notification: theme.colors.notification,
        },
      }}
    >
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen 
          name="Login" 
          component={LoginScreen} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Main" 
          component={MainTabs} 
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;