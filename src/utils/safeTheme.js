/**
 * Safe Theme Access Utility
 * 
 * This utility provides safe access to theme properties to prevent
 * "Cannot read property 'X' of undefined" errors.
 */

/**
 * Safely access a nested property in an object
 * 
 * @param {Object} obj - The object to access
 * @param {string} path - The path to the property (e.g., 'fonts.medium')
 * @param {any} defaultValue - The default value to return if the property doesn't exist
 * @returns {any} - The property value or the default value
 */
export const getNestedValue = (obj, path, defaultValue = null) => {
  if (!obj) return defaultValue;
  
  const keys = path.split('.');
  let result = obj;
  
  for (const key of keys) {
    if (result === undefined || result === null || typeof result !== 'object') {
      return defaultValue;
    }
    result = result[key];
  }
  
  return result !== undefined ? result : defaultValue;
};

/**
 * Safely access a font property from the theme
 * 
 * @param {Object} theme - The theme object
 * @param {string} variant - The font variant to access
 * @returns {Object} - The font object or a default font
 */
export const getFont = (theme, variant) => {
  const defaultFont = {
    fontFamily: 'System',
    fontWeight: 'normal',
    fontSize: 14,
  };
  
  return getNestedValue(theme, `fonts.${variant}`, defaultFont);
};

/**
 * Safely access a color from the theme
 * 
 * @param {Object} theme - The theme object
 * @param {string} color - The color name to access
 * @returns {string} - The color value or a default color
 */
export const getColor = (theme, color) => {
  return getNestedValue(theme, `colors.${color}`, '#000000');
};

/**
 * Safely access a size from the theme
 * 
 * @param {Object} theme - The theme object
 * @param {string} size - The size name to access (small, medium, large, etc.)
 * @returns {number} - The size value or a default size
 */
export const getSize = (theme, size) => {
  // Default sizes if theme.sizes is undefined
  const defaultSizes = {
    small: 8,
    medium: 16,
    large: 24,
    xlarge: 32,
  };
  
  return getNestedValue(theme, `sizes.${size}`, defaultSizes[size] || 16);
};

/**
 * Create a safe theme wrapper that provides safe access to all theme properties
 * 
 * @param {Object} theme - The original theme object
 * @returns {Object} - A safe theme object with accessor methods
 */
export const createSafeTheme = (theme) => {
  return {
    ...theme,
    getFont: (variant) => getFont(theme, variant),
    getColor: (color) => getColor(theme, color),
    getSize: (size) => getSize(theme, size),
    get: (path, defaultValue) => getNestedValue(theme, path, defaultValue),
  };
};

export default createSafeTheme;