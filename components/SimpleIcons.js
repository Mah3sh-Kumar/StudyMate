import React from 'react';
import { Text } from 'react-native';

// Simple icon components to replace lucide-react-native for web compatibility
export const Eye = ({ size = 20, color = '#000', style }) => (
  <Text style={[{ fontSize: size, color }, style]}>👁</Text>
);

export const EyeOff = ({ size = 20, color = '#000', style }) => (
  <Text style={[{ fontSize: size, color }, style]}>🙈</Text>
);

export const Mail = ({ size = 20, color = '#000', style }) => (
  <Text style={[{ fontSize: size, color }, style]}>✉️</Text>
);

export const Lock = ({ size = 20, color = '#000', style }) => (
  <Text style={[{ fontSize: size, color }, style]}>🔒</Text>
);

export const User = ({ size = 20, color = '#000', style }) => (
  <Text style={[{ fontSize: size, color }, style]}>👤</Text>
);

export const Menu = ({ size = 20, color = '#000', style }) => (
  <Text style={[{ fontSize: size, color }, style]}>☰</Text>
);