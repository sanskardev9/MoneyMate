import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ScrollView,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { supabase } from '../lib/supabase';
import Toast from 'react-native-toast-message';

export default function SettingsScreen({ navigation }) {
  const [userName, setUserName] = useState('');
  const [profileImageUrl, setProfileImageUrl] = useState(null);

  useEffect(() => {
    fetchUserName();
  }, []);

  const fetchUserName = async (retry = 0) => {
    try {
      const user = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('users')
        .select('name, profile_image_url')
        .eq('id', user.data.user.id)
        .single();
      
      if (!error && data) {
        if (data.name && data.name.trim()) {
          setUserName(data.name.trim());
        }
        if (data.profile_image_url) {
          setProfileImageUrl(data.profile_image_url);
        }
      } else if (retry < 3) {
        setTimeout(() => fetchUserName(retry + 1), 700);
      } else {
        setUserName('User');
      }
    } catch (error) {
      console.error('Error fetching user name:', error);
      if (retry < 3) {
        setTimeout(() => fetchUserName(retry + 1), 700);
      } else {
        setUserName('User');
      }
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await supabase.auth.signOut();
              Toast.show({
                type: 'success',
                text1: 'Logged out successfully',
              });
            } catch (error) {
              console.error('Error logging out:', error);
              Toast.show({
                type: 'error',
                text1: 'Error logging out',
              });
            }
          },
        },
      ]
    );
  };

  const settingsOptions = [
    {
      id: 'profile',
      title: 'Profile',
      subtitle: 'Manage your account information',
      icon: 'account',
      color: '#A259FF',
      onPress: () => {
        navigation.navigate('UserProfile');
      },
    },
    {
      id: 'notifications',
      title: 'Notifications',
      subtitle: 'Configure notification preferences',
      icon: 'bell',
      color: '#FF9500',
      onPress: () => {
        // TODO: Navigate to notifications screen
        Toast.show({
          type: 'info',
          text1: 'Notification settings coming soon',
        });
      },
    },
    {
      id: 'privacy',
      title: 'Privacy & Security',
      subtitle: 'Manage your privacy settings',
      icon: 'shield',
      color: '#34C759',
      onPress: () => {
        // TODO: Navigate to privacy screen
        Toast.show({
          type: 'info',
          text1: 'Privacy settings coming soon',
        });
      },
    },
    {
      id: 'help',
      title: 'Help & Support',
      subtitle: 'Get help and contact support',
      icon: 'help-circle',
      color: '#007AFF',
      onPress: () => {
        // TODO: Navigate to help screen
        Toast.show({
          type: 'info',
          text1: 'Help & support coming soon',
        });
      },
    },
    {
      id: 'about',
      title: 'About MoneyMate',
      subtitle: 'App version and information',
      icon: 'information',
      color: '#888888',
      onPress: () => {
        // TODO: Navigate to about screen
        Toast.show({
          type: 'info',
          text1: 'About page coming soon',
        });
      },
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-left" size={24} color="#222222" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* User Info */}
        <View style={styles.userSection}>
          <Text style={styles.userName}>{userName || 'User'}</Text>
          <Text style={styles.userSubtitle}>Manage your account</Text>
        </View>

        {/* Settings Options */}
        <View style={styles.settingsSection}>
          {settingsOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={styles.settingOption}
              onPress={option.onPress}
            >
              <View style={[styles.optionIcon, { backgroundColor: option.color + '20' }]}>
                <Icon name={option.icon} size={24} color={option.color} />
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>{option.title}</Text>
                <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
              </View>
              <Icon name="chevron-right" size={24} color="#CCCCCC" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Section */}
        <View style={styles.logoutSection}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Icon name="logout" size={20} color="#EB5757" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <Toast />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222222',
  },
  headerSpacer: {
    width: 40,
  },
  userSection: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  userAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F7F7F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  profileImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222222',
    marginBottom: 4,
  },
  userSubtitle: {
    fontSize: 14,
    color: '#888888',
  },
  settingsSection: {
    paddingVertical: 16,
  },
  settingOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222222',
    marginBottom: 2,
  },
  optionSubtitle: {
    fontSize: 14,
    color: '#888888',
  },
  logoutSection: {
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EB5757',
    backgroundColor: '#FFF5F5',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EB5757',
    marginLeft: 8,
  },
}); 