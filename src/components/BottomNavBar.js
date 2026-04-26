import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAppTheme } from '../context/ThemeContext';
import useCompactLayout from '../hooks/useCompactLayout';

const BottomNavBar = ({ navigation, currentRoute, onTabPress }) => {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  const isCompact = useCompactLayout();

  const navItems = [
    {
      name: 'Expense',
      icon: 'credit-card-outline',
      label: 'Expense',
      route: 'Expense'
    },
    {
      name: 'Budgets',
      icon: 'chart-pie',
      label: 'Budgets',
      route: 'BudgetDetails'
    },
    {
      name: 'History',
      icon: 'history',
      label: 'History',
      route: 'History'
    },
    {
      name: 'Reports',
      icon: 'chart-line',
      label: 'Reports',
      route: 'Reports'
    }
  ];

  const handleNavigation = (route) => {
    if (route !== currentRoute) {
      if (onTabPress) {
        onTabPress(route);
      } else {
        navigation.navigate(route);
      }
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          height: isCompact ? 82 : 100,
          paddingBottom: Math.max(insets.bottom, isCompact ? 4 : 8),
          backgroundColor: colors.background,
          borderColor: colors.border,
        },
      ]}
    >
      {navItems.map((item) => {
        const isActive = currentRoute === item.route;
        return (
          <TouchableOpacity
            key={item.name}
            style={styles.navItem}
            onPress={() => handleNavigation(item.route)}
            activeOpacity={0.7}
          >
            <Icon 
              name={item.icon} 
              size={isCompact ? 24 : 28} 
              color={isActive ? colors.primary : colors.textMuted} 
            />
            <Text style={[
              styles.navLabel,
              { fontSize: isCompact ? 11.5 : 13, marginTop: isCompact ? 2 : 4 },
              isActive ? { color: colors.primary, fontWeight: '700' } : { color: colors.textMuted }
            ]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 100,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 12,
  },
  navItem: {
    flex: 1,
    justifyContent: 'center',   // center vertically
    alignItems: 'center',       // center horizontally
    minHeight: 52,
  },
  navLabel: {
    fontSize: 13,
    marginTop: 4,
    fontWeight: '600',
    textAlign: 'center',
  },
});


export default BottomNavBar;
