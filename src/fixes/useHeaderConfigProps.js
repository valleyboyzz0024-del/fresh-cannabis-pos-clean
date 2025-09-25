// Patched version of useHeaderConfigProps.js that checks for undefined navigation and route
import { getHeaderTitle, HeaderTitle } from '@react-navigation/elements';
import { useLocale, useTheme } from '@react-navigation/native';
import { Platform, StyleSheet, View } from 'react-native';

export function useHeaderConfigProps({
  headerBackImageSource,
  headerBackButtonDisplayMode,
  headerBackButtonMenuEnabled,
  headerBackTitle,
  headerBackTitleStyle,
  headerBackVisible,
  headerShadowVisible,
  headerLargeStyle,
  headerLargeTitle,
  headerLargeTitleShadowVisible,
  headerLargeTitleStyle,
  headerBackground,
  headerLeft,
  headerRight,
  headerShown,
  headerStyle,
  headerBlurEffect,
  headerTintColor,
  headerTitle,
  headerTitleAlign,
  headerTitleStyle,
  headerTransparent,
  headerSearchBarOptions,
  headerTopInsetEnabled,
  headerBack,
  route,
  title
}) {
  // Early return if route is undefined
  if (!route) {
    return { 
      headerShown: false,
      title: '',
      hidden: true
    };
  }

  const { direction } = useLocale();
  const { colors } = useTheme();
  
  // Simple implementation that doesn't rely on complex font processing
  const tintColor = headerTintColor ?? (Platform.OS === 'ios' ? colors.primary : colors.text);
  
  const headerBackTitleStyleFlattened = StyleSheet.flatten(headerBackTitleStyle) || {};
  const headerLargeTitleStyleFlattened = StyleSheet.flatten(headerLargeTitleStyle) || {};
  const headerTitleStyleFlattened = StyleSheet.flatten(headerTitleStyle) || {};
  const headerStyleFlattened = StyleSheet.flatten(headerStyle) || {};
  const headerLargeStyleFlattened = StyleSheet.flatten(headerLargeStyle) || {};
  
  // Simple font processing that doesn't rely on complex logic
  const backTitleFontFamily = headerBackTitleStyleFlattened.fontFamily;
  const largeTitleFontFamily = headerLargeTitleStyleFlattened.fontFamily;
  const titleFontFamily = headerTitleStyleFlattened.fontFamily;
  
  const backTitleFontSize = 'fontSize' in headerBackTitleStyleFlattened ? headerBackTitleStyleFlattened.fontSize : undefined;
  
  const titleText = getHeaderTitle({
    title,
    headerTitle
  }, route.name);
  
  const titleColor = 'color' in headerTitleStyleFlattened ? headerTitleStyleFlattened.color : headerTintColor ?? colors.text;
  const titleFontSize = 'fontSize' in headerTitleStyleFlattened ? headerTitleStyleFlattened.fontSize : undefined;
  const titleFontWeight = headerTitleStyleFlattened.fontWeight;
  
  const largeTitleBackgroundColor = headerLargeStyleFlattened.backgroundColor;
  const largeTitleColor = 'color' in headerLargeTitleStyleFlattened ? headerLargeTitleStyleFlattened.color : undefined;
  const largeTitleFontSize = 'fontSize' in headerLargeTitleStyleFlattened ? headerLargeTitleStyleFlattened.fontSize : undefined;
  const largeTitleFontWeight = headerLargeTitleStyleFlattened.fontWeight;
  
  const headerTitleStyleSupported = {
    color: titleColor
  };
  
  if (headerTitleStyleFlattened.fontFamily != null) {
    headerTitleStyleSupported.fontFamily = headerTitleStyleFlattened.fontFamily;
  }
  
  if (titleFontSize != null) {
    headerTitleStyleSupported.fontSize = titleFontSize;
  }
  
  if (titleFontWeight != null) {
    headerTitleStyleSupported.fontWeight = titleFontWeight;
  }
  
  const headerBackgroundColor = headerStyleFlattened.backgroundColor ?? (headerBackground != null || headerTransparent ? 'transparent' : colors.card);
  
  const canGoBack = headerBack != null;
  
  // Simple implementation that doesn't rely on complex JSX
  return {
    backButtonInCustomView: headerBackVisible,
    backgroundColor: headerBackgroundColor,
    backTitle: headerBackTitle,
    backTitleVisible: headerBackButtonDisplayMode !== 'minimal',
    backButtonDisplayMode: headerBackButtonDisplayMode,
    backTitleFontFamily,
    backTitleFontSize,
    blurEffect: headerBlurEffect,
    color: tintColor,
    direction,
    disableBackButtonMenu: headerBackButtonMenuEnabled === false,
    hidden: headerShown === false,
    hideBackButton: headerBackVisible === false,
    hideShadow: headerShadowVisible === false || headerBackground != null || headerTransparent && headerShadowVisible !== true,
    largeTitle: headerLargeTitle,
    largeTitleBackgroundColor,
    largeTitleColor,
    largeTitleFontFamily,
    largeTitleFontSize,
    largeTitleFontWeight,
    largeTitleHideShadow: headerLargeTitleShadowVisible === false,
    title: titleText,
    titleColor,
    titleFontFamily,
    titleFontSize,
    titleFontWeight: String(titleFontWeight || 'normal'),
    topInsetEnabled: headerTopInsetEnabled,
    translucent: headerTransparent === true,
  };
}