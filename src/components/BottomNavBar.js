import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const BottomNavBar = ({ navigation, currentRoute }) => {
  const insets = useSafeAreaInsets();

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
      name: 'Reports',
      icon: 'chart-line',
      label: 'Reports',
      route: 'Reports'
    }
  ];

  const handleNavigation = (route) => {
    if (route !== currentRoute) {
      navigation.navigate(route);
    }
  };

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 8) }]}>
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
              size={28} 
              color={isActive ? '#A259FF' : '#888888'} 
            />
            <Text style={[
              styles.navLabel,
              isActive ? styles.navLabelActive : styles.navLabelInactive
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
    minHeight: 60,
  },
  navLabel: {
    fontSize: 13,
    marginTop: 4,
    fontWeight: '600',
    textAlign: 'center',
  },
  navLabelActive: {
    color: '#A259FF',
    fontWeight: '700',
  },
  navLabelInactive: {
    color: '#888888',
  },
});


export default BottomNavBar;
