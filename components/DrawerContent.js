import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { ThemeContext } from '../contexts/ThemeContext'; // adjust path as needed

const menuItems = [
  { label: 'Plan', icon: <MaterialCommunityIcons name="calendar-check" size={24} /> },
  { label: 'Quiz', icon: <MaterialCommunityIcons name="clipboard-text" size={24} /> },
  { label: 'Tracker', icon: <MaterialCommunityIcons name="chart-line" size={24} /> },
  { label: 'Flashcards', icon: <Ionicons name="ios-albums" size={24} /> },
  { label: 'Summarizer', icon: <MaterialCommunityIcons name="file-document-edit" size={24} /> },
  { label: 'Settings', icon: <Ionicons name="settings-sharp" size={24} /> },
];

const DrawerContent = ({ navigation, state }) => {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const colors = {
    background: isDark ? '#181A20' : '#fff',
    text: isDark ? '#fff' : '#222',
    primary: isDark ? '#4F8EF7' : '#1976D2',
    itemBg: isDark ? '#23262F' : '#F0F4FA',
    footerBg: isDark ? '#181A20' : '#F8F9FB',
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}> 
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.logo, { color: colors.primary }]}>StudyMate</Text>
      </View>

      {/* Menu Items */}
      <View style={styles.menu}>
        {menuItems.map((item, idx) => {
          const focused = state?.index === idx;
          return (
            <TouchableOpacity
              key={item.label}
              style={[
                styles.menuItem,
                focused && {
                  backgroundColor: colors.primary + '22',
                  borderRadius: 12,
                },
              ]}
              onPress={() => navigation.navigate(item.label)}
              activeOpacity={0.7}
            >
              <View style={styles.iconWrapper}>
                {React.cloneElement(item.icon, {
                  color: focused ? colors.primary : colors.text,
                })}
              </View>
              <Text
                style={[
                  styles.menuText,
                  {
                    color: focused ? colors.primary : colors.text,
                    fontWeight: focused ? 'bold' : 'normal',
                  },
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Footer */}
      <View style={[styles.footer, { backgroundColor: colors.footerBg }]}> 
        <TouchableOpacity style={styles.footerBtn} onPress={() => navigation.navigate('About')}>
          <Ionicons name="information-circle-outline" size={18} color={colors.text} />
          <Text style={[styles.footerText, { color: colors.text }]}>About</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerBtn} onPress={() => navigation.navigate('Help')}>
          <Ionicons name="help-circle-outline" size={18} color={colors.text} />
          <Text style={[styles.footerText, { color: colors.text }]}>Help</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerBtn} onPress={() => {/* handle logout */}}>
          <MaterialCommunityIcons name="logout" size={18} color={colors.text} />
          <Text style={[styles.footerText, { color: colors.text }]}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    paddingTop: 40,
    paddingBottom: 24,
    alignItems: 'center',
    borderBottomWidth: 0.5,
    borderBottomColor: '#ccc',
  },
  logo: {
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  menu: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginVertical: 6,
  },
  iconWrapper: {
    marginRight: 16,
  },
  menuText: {
    fontSize: 17,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 14,
    borderTopWidth: 0.5,
    borderTopColor: '#ccc',
  },
  footerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerText: {
    fontSize: 14,
    marginLeft: 4,
  },
});

export default DrawerContent;
