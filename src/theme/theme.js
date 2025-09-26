import { DefaultTheme } from 'react-native-paper';

// Completely simplified theme with NO variants to prevent crashes
export const theme = {
  ...DefaultTheme,
  dark: true,
  mode: 'adaptive',
  roundness: 10,
  
  // Explicitly define fontVariant to prevent undefined errors
  fontVariant: 'regular',
  
  colors: {
    ...DefaultTheme.colors,
    primary: '#D4AF37', // Gold
    accent: '#D4AF37',  // Gold
    background: '#121212',
    surface: '#1E1E1E',
    text: '#FFFFFF',
    disabled: '#757575',
    placeholder: '#9E9E9E',
    backdrop: 'rgba(0, 0, 0, 0.5)',
    notification: '#D4AF37',
    error: '#CF6679',
    success: '#4CAF50',
    warning: '#FF9800',
    info: '#2196F3',
    onSurface: '#FFFFFF',
    secondaryContainer: '#2E2E2E',
    card: '#1E1E1E',
    border: '#2E2E2E',
  },
  
  // Use simple font configuration without complex processing
  fonts: {
    regular: {
      fontFamily: 'System',
      fontWeight: 'normal',
    },
    medium: {
      fontFamily: 'System',
      fontWeight: '500',
    },
    light: {
      fontFamily: 'System',
      fontWeight: '300',
    },
    thin: {
      fontFamily: 'System',
      fontWeight: '100',
    },
    bold: {
      fontFamily: 'System',
      fontWeight: 'bold',
    },
    heavy: {
      fontFamily: 'System',
      fontWeight: '900',
    }
  },
};

export const buttonStyles = {
  large: {
    height: 60,
    marginVertical: 10,
    borderRadius: 10,
    justifyContent: 'center',
  },
  medium: {
    height: 50,
    marginVertical: 8,
    borderRadius: 8,
    justifyContent: 'center',
  },
  small: {
    height: 40,
    marginVertical: 5,
    borderRadius: 6,
    justifyContent: 'center',
  },
};

export const shadowStyles = {
  small: {
    boxShadowColor: '#000',
    boxShadowOffset: { width: 0, height: 2 },
    boxShadowOpacity: 0.25,
    boxShadowRadius: 3.84,
    elevation: 2,
  },
  medium: {
    boxShadowColor: '#000',
    boxShadowOffset: { width: 0, height: 4 },
    boxShadowOpacity: 0.3,
    boxShadowRadius: 4.65,
    elevation: 4,
  },
  large: {
    boxShadowColor: '#000',
    boxShadowOffset: { width: 0, height: 6 },
    boxShadowOpacity: 0.37,
    boxShadowRadius: 7.49,
    elevation: 6,
  },
};