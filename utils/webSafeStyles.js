import { Platform } from 'react-native';

// Web-compatible shadow styles
export const createWebSafeStyles = (styles) => {
  if (Platform.OS === 'web') {
    // Convert React Native shadow properties to CSS box-shadow for web
    const convertedStyles = {};
    Object.keys(styles).forEach(key => {
      const style = styles[key];
      if (style && typeof style === 'object') {
        const newStyle = { ...style };
        
        // Convert shadow properties to boxShadow for web
        if (style.shadowColor || style.shadowOffset || style.shadowOpacity || style.shadowRadius || style.elevation) {
          const shadowColor = style.shadowColor || '#000';
          const shadowOffset = style.shadowOffset || { width: 0, height: 2 };
          const shadowOpacity = style.shadowOpacity || 0.1;
          const shadowRadius = style.shadowRadius || 4;
          const elevation = style.elevation || 0;
          
          // Create CSS box-shadow
          const alpha = Math.round(shadowOpacity * 255).toString(16).padStart(2, '0');
          const shadowColorWithAlpha = shadowColor + alpha;
          
          newStyle.boxShadow = `${shadowOffset.width}px ${shadowOffset.height}px ${shadowRadius}px ${shadowColorWithAlpha}`;
          
          // Remove React Native specific shadow properties
          delete newStyle.shadowColor;
          delete newStyle.shadowOffset;
          delete newStyle.shadowOpacity;
          delete newStyle.shadowRadius;
          delete newStyle.elevation;
        }
        
        convertedStyles[key] = newStyle;
      } else {
        convertedStyles[key] = style;
      }
    });
    return convertedStyles;
  }
  return styles;
};

// Simple shadow style creator that works on both platforms
export const createShadow = ({
  shadowColor = '#000',
  shadowOffset = { width: 0, height: 2 },
  shadowOpacity = 0.1,
  shadowRadius = 4,
  elevation = 3
} = {}) => {
  if (Platform.OS === 'web') {
    const alpha = Math.round(shadowOpacity * 255).toString(16).padStart(2, '0');
    return {
      boxShadow: `${shadowOffset.width}px ${shadowOffset.height}px ${shadowRadius}px ${shadowColor}${alpha}`
    };
  }
  
  return {
    shadowColor,
    shadowOffset,
    shadowOpacity,
    shadowRadius,
    elevation
  };
};