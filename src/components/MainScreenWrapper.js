import React from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import BottomNavBar from './BottomNavBar';

const MainScreenWrapper = ({ children, navigation, currentRoute }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {children}
      </View>
      <View style={styles.navbarContainer}>
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
