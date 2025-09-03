import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useThemePreference } from '../contexts/ThemeContext';
import { EnhancedTabIcons } from './EnhancedTabIcons';

const TAB_CONFIG = [
  { key: 'Home', label: 'Home', icon: EnhancedTabIcons.Home },
  { key: 'Handsfree', label: 'Handsfree', icon: EnhancedTabIcons.Handsfree },
  { key: 'Chat', label: 'Chat', icon: EnhancedTabIcons.Chat },
  { key: 'Groups', label: 'Groups', icon: EnhancedTabIcons.Groups },
];

export default function BottomTabBar({ state, descriptors, navigation }) {
  const { colors } = useThemePreference();

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderTopColor: colors.border }]}> 
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
            activeOpacity={0.8}
          >
            <View style={[styles.iconWrapper, focused && { backgroundColor: colors.primary }]}> 
              {IconComponent && (
                <IconComponent
                  color={focused ? '#fff' : colors.text}
                  focused={focused}
                  size={24}
                />
              )}
            </View>
            <Text style={[styles.label, { color: focused ? '#fff' : colors.text, opacity: focused ? 1 : 0.6 }]}> 
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingBottom: 5,
    paddingTop: 5,
    height: 60,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    borderRadius: 16,
    padding: 8,
    marginBottom: 2,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
});








/*


import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useThemePreference } from '../contexts/ThemeContext';
import { EnhancedTabIcons } from './EnhancedTabIcons';

const TAB_CONFIG = [
  { key: 'Home', label: 'Home', icon: EnhancedTabIcons.Home },
  { key: 'Handsfree', label: 'Handsfree', icon: EnhancedTabIcons.Handsfree },
  { key: 'Chat', label: 'Chat', icon: EnhancedTabIcons.Chat },
  { key: 'Groups', label: 'Groups', icon: EnhancedTabIcons.Groups },
];

export default function BottomTabBar({ state, descriptors, navigation }) {
  const { colors } = useThemePreference();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.card, borderTopColor: colors.border },
      ]}
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = options.tabBarLabel || options.title || route.name;
        const focused = state.index === index;
        const IconComponent = TAB_CONFIG.find(
          (tab) => tab.key === route.name
        )?.icon;

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={focused ? { selected: true } : {}}
            onPress={() => navigation.navigate(route.name)}
            style={styles.tab}
            activeOpacity={0.8}
          >
            <View
              style={[
                styles.iconWrapper,
                focused && { backgroundColor: colors.primary },
              ]}
            >
              {IconComponent && (
                <IconComponent
                  color={focused ? '#fff' : colors.text + '99'} // active=white, inactive=grayish
                  size={24}
                />
              )}
            </View>
            <Text
              style={[
                styles.label,
                {
                  color: focused ? colors.primary : colors.text,
                  opacity: focused ? 1 : 0.6,
                },
              ]}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingBottom: 5,
    paddingTop: 5,
    height: 60,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    borderRadius: 16,
    padding: 8,
    marginBottom: 2,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
});


*/