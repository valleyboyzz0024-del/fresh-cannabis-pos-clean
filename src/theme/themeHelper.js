/**
 * Theme Helper Functions
 * 
 * This file contains utility functions for safely accessing theme properties
 * and preventing crashes due to undefined values.
 */

/**
 * Safely access a nested property in an object using a dot-notation path
 * @param {Object} obj - The object to access (usually theme)
 * @param {String} path - The dot-notation path to the property (e.g., 'fonts.medium')
 * @param {*} fallback - The fallback value if the property doesn't exist
 * @returns {*} The property value or fallback
 */
export const getSafeThemeValue = (obj, path, fallback = undefined) => {
  if (!obj || !path) return fallback;
  
  try {
    const keys = path.split('.');
    let result = obj;
    
    for (const key of keys) {
      if (result && typeof result === 'object' && key in result) {
        result = result[key];
      } else {
        return fallback;
      }
    }
    
    return result !== undefined ? result : fallback;
  } catch (error) {
    console.warn(`Error accessing theme path: ${path}`, error);
    return fallback;
  }
};

/**
 * Safely get a font variant from the theme
 * @param {Object} theme - The theme object
 * @param {String} variant - The font variant name
 * @returns {Object} The font variant object or a default font
 */
export const getSafeFont = (theme, variant) => {
  if (!theme || !theme.fonts) {
    return { fontFamily: 'System', fontWeight: 'normal' };
  }
  
  return theme.fonts[variant] || theme.fonts.regular || { fontFamily: 'System', fontWeight: 'normal' };
};

/**
 * Safely get a font size from the theme
 * @param {Object} theme - The theme object
 * @param {String} size - The font size name (small, medium, large)
 * @returns {Number} The font size or a default size
 */
export const getSafeFontSize = (theme, size) => {
  const defaultSizes = {
    small: 12,
    medium: 14,
    large: 16,
    xlarge: 20,
    xxlarge: 24
  };
  
  if (!theme || !theme.fontSizes) {
    return defaultSizes[size] || 14;
  }
  
  return theme.fontSizes[size] || defaultSizes[size] || 14;
};

/**
 * Safely get a color from the theme
 * @param {Object} theme - The theme object
 * @param {String} colorName - The color name
 * @returns {String} The color value or a default color
 */
export const getSafeColor = (theme, colorName) => {
  const defaultColors = {
    primary: '#1E8942',
    text: '#FFFFFF',
    background: '#121212',
    surface: '#1E1E1E',
    error: '#CF6679'
  };
  
  if (!theme || !theme.colors) {
    return defaultColors[colorName] || '#FFFFFF';
  }
  
  return theme.colors[colorName] || defaultColors[colorName] || '#FFFFFF';
};

/**
 * Create safe style props that avoid using deprecated shadow* properties
 * @param {Object} shadowStyle - The shadow style object from theme
 * @returns {Object} Safe shadow style object using boxShadow* properties
 */
export const getSafeShadowStyle = (shadowStyle) => {
  if (!shadowStyle) return {};
  
  // Convert any shadow* props to boxShadow* props
  const safeStyle = {};
  
  Object.entries(shadowStyle).forEach(([key, value]) => {
    if (key.startsWith('shadow')) {
      const newKey = key.replace('shadow', 'boxShadow');
      safeStyle[newKey] = value;
    } else {
      safeStyle[key] = value;
    }
  });
  
  return safeStyle;
};