import { useColorScheme as useRNColorScheme } from 'react-native';

/**
 * Returns the current color scheme (light or dark) for the device.
 * This is the base implementation for React Native.
 */
export function useColorScheme() {
  return useRNColorScheme();
}