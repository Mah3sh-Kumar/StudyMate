import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useThemePreference } from '../contexts/ThemeContext';
import { EnhancedTabIcons } from './EnhancedTabIcons';

const TAB_CONFIG = [
  { key: 'index', label: 'Home', icon: EnhancedTabIcons.Home },
  { key: 'handsfree', label: 'Handsfree', icon: EnhancedTabIcons.Handsfree },
  { key: 'chat', label: 'Chat', icon: EnhancedTabIcons.Chat },
  { key: 'groups', label: 'Groups', icon: EnhancedTabIcons.Groups },
];

export default function BottomTabBar({ state, descriptors, navigation }) {
  const { colors } = useThemePreference();

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
      <View style={[styles.innerContainer, { backgroundColor: colors.card }]}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label = options.tabBarLabel || options.title || route.name;
          const focused = state.index === index;
          const IconComponent = TAB_CONFIG.find(tab => tab.key === route.name)?.icon;
          
          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={focused ? { selected: true } : {}}
              onPress={() => navigation.navigate(route.name)}
              style={styles.tab}
              activeOpacity={0.7}
            >
              <View style={[
                styles.iconWrapper,
                focused && { 
                  backgroundColor: colors.primary,
                  transform: [{ scale: 1.0 }] // Remove scale animation
                }
              ]}>
                {IconComponent && (
                  <IconComponent
                    color={focused ? colors.card : colors.text}
                    focused={focused}
                  size={20} // Reduce icon size
                  />
                )}
              </View>
              <Text style={[
                styles.label,
                {
                  color: focused ? colors.primary : colors.textSecondary,
                  fontWeight: focused ? '700' : '500',
                  opacity: focused ? 1 : 0.8
                }
              ]}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    paddingBottom: 8,
    paddingTop: 8,
    paddingHorizontal: 4,
  },
  innerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    height: 50, // Reduce height from 56 to 50
    borderRadius: 25, // Adjust border radius accordingly
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6, // Reduce from 8 to 6
  },
  iconWrapper: {
    borderRadius: 16, // Reduce from 20 to 16
    padding: 6, // Reduce from 10 to 6
    marginBottom: 2, // Reduce from 4 to 2
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  label: {
    fontSize: 10, // Reduce from 11 to 10
    textAlign: 'center',
    letterSpacing: 0.3,
  },
});
