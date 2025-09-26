# Theme Documentation for Fresh Cannabis POS

## Overview

This document provides information about the theme structure and font variants used in the Fresh Cannabis POS application. It also includes details about the fixes applied to handle theme-related issues.

## Theme Structure

The theme is defined in `src/theme/theme.js` and extends the DefaultTheme from react-native-paper. The theme includes:

1. **Colors**: Custom color palette for the dark theme
2. **Fonts**: Basic font configurations
3. **Roundness**: Border radius for UI elements
4. **Mode**: Set to 'adaptive' for platform-specific behavior

## Font Variants

### Current Font Variants

The theme currently defines the following font variants:

- `regular`: System font with normal weight
- `medium`: System font with 500 weight
- `light`: System font with 300 weight
- `thin`: System font with 100 weight
- `bold`: System font with bold weight
- `heavy`: System font with 900 weight

### Font Variant Usage

When using the `Text` component from react-native-paper, you can specify a font variant using the `variant` prop:

```jsx
<Text variant="regular">Regular text</Text>
<Text variant="bold">Bold text</Text>
```

### Font Variant Safety

To prevent crashes when using undefined font variants, we've implemented a safety mechanism in the Text component. This ensures that even if a variant is not defined in the theme, the app will not crash and will use a fallback font configuration.

## Applied Fixes

### 1. Text Component Patch

We've patched the Text component in react-native-paper to safely handle cases where `theme.fonts` or any property of `theme.fonts` is undefined. The patch is implemented in `fix-text-component-complete.js` and includes:

- Safe access to `theme.fonts[variant]`
- Safe access to `theme.fonts[props.variant]`
- Safe access to `Object.keys(theme.fonts)`

### 2. Theme Simplification

The theme has been simplified to prevent crashes:

- Removed complex font variant processing
- Added explicit fontVariant property
- Used simple font configuration with system fonts

### 3. useEffect Import Fix

Added missing `useEffect` imports in screen files that use the hook.

## Best Practices

1. **Always check theme availability**: When accessing theme properties, always check if they exist before using them.
2. **Use defined variants**: Stick to the defined font variants in the theme.
3. **Apply defensive coding**: When extending the theme, ensure backward compatibility.
4. **Test on multiple devices**: Verify that the theme works correctly on different screen sizes and platforms.

## Troubleshooting

If you encounter theme-related issues:

1. Check if the font variant is defined in the theme
2. Verify that the Text component is imported correctly
3. Run the fix scripts provided in `run-app.sh`
4. Clear the cache using `rm -rf node_modules/.cache && rm -rf .expo`

## Future Improvements

1. Consider adding more font variants as needed
2. Implement a more robust theme implementation with proper fallbacks
3. Add theme switching capability (light/dark mode)
4. Create a theme testing utility to verify all components with the theme