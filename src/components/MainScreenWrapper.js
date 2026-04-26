import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomNavBar from './BottomNavBar';
import { useAppTheme } from '../context/ThemeContext';
import { useTabShell } from '../context/TabShellContext';

const MainScreenWrapper = ({ children, navigation, currentRoute }) => {
  const { colors } = useAppTheme();
  const tabShell = useTabShell();

  if (tabShell) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.content}>{children}</View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        {children}
      </View>
      <View style={[styles.navbarContainer, { backgroundColor: colors.background }]}>
        <BottomNavBar navigation={navigation} currentRoute={currentRoute} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    position: 'relative',
  },
  navbarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
  },
});

export default MainScreenWrapper;
