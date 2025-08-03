import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Image,
  ActivityIndicator,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { supabase } from '../lib/supabase';
import * as ImagePicker from 'expo-image-picker';
import Toast from 'react-native-toast-message';

export default function UserProfileScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [profileImageUrl, setProfileImageUrl] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [income, setIncome] = useState('');
  const [userId, setUserId] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData?.user) throw userError || new Error('No user');
      setUserId(userData.user.id);
      setEmail(userData.user.email);
      // Fetch profile info
      const { data, error } = await supabase
        .from('users')
        .select('name, profile_image_url')
        .eq('id', userData.user.id)
        .single();
      if (!error && data) {
        setName(data.name || '');
        setProfileImageUrl(data.profile_image_url || null);
      }
      // Fetch income
      const { data: incomeData } = await supabase
        .from('incomes')
        .select('amount')
        .eq('user_id', userData.user.id)
        .order('created_at', { ascending: false })
        .limit(1);
      setIncome(incomeData?.[0]?.amount ? String(incomeData[0].amount) : '');
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Error loading profile' });
    } finally {
      setLoading(false);
    }
  };

  // Remove avatar/profile image section and related logic

  // Only keep name, email, and income fields

  const handleSave = async () => {
    setSaving(true);
    try {
      // Update user profile
      const { error } = await supabase
        .from('users')
        .update({ name, profile_image_url: profileImageUrl })
        .eq('id', userId);
      if (error) throw error;
      // Update income if changed
      if (income) {
        const { data: incomeData } = await supabase
          .from('incomes')
          .select('id')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(1);
        if (incomeData && incomeData.length > 0) {
          await supabase
            .from('incomes')
            .update({ amount: Number(income) })
            .eq('id', incomeData[0].id);
        } else {
          await supabase
            .from('incomes')
            .insert({ user_id: userId, amount: Number(income) });
        }
      }
      setEditMode(false);
      fetchProfile();
      Toast.show({ type: 'success', text1: 'Profile updated' });
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Error saving profile' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={64}
      >
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Icon name="arrow-left" size={24} color="#222" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>User Profile</Text>
            <TouchableOpacity onPress={() => setEditMode((e) => !e)}>
              <Icon name={editMode ? 'content-save' : 'pencil'} size={22} color="#A259FF" />
            </TouchableOpacity>
          </View>

          {/* Profile Image */}
          <View style={styles.avatarSection}>
            {/* Removed avatar/profile image section */}
          </View>

          {/* Profile Fields */}
          <View style={styles.formSection}>
            <Text style={styles.label}>Full Name</Text>
            {editMode ? (
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Enter your name"
              />
            ) : (
              <Text style={styles.value}>{name}</Text>
            )}

            <Text style={styles.label}>Email</Text>
            <Text style={styles.value}>{email}</Text>

            <Text style={styles.label}>Total Income</Text>
            {editMode ? (
              <TextInput
                style={styles.input}
                value={income}
                onChangeText={setIncome}
                placeholder="Enter total income"
                keyboardType="numeric"
              />
            ) : (
              <Text style={styles.value}>{income ? `₹${income}` : 'Not set'}</Text>
            )}
          </View>

          {/* Save Button */}
          {editMode && (
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.saveButtonText}>Save</Text>
              )}
            </TouchableOpacity>
          )}
        </ScrollView>
        <Toast />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
    color: '#222',
  },
  avatarSection: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 12,
  },
  avatarWrapper: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#F7F7F7',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  editIconOverlay: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    backgroundColor: '#A259FF',
    borderRadius: 12,
    padding: 4,
  },
  formSection: {
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  label: {
    fontSize: 14,
    color: '#888',
    marginTop: 16,
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: '#222',
    fontWeight: '600',
    marginBottom: 4,
  },
  input: {
    fontSize: 16,
    color: '#222',
    backgroundColor: '#F7F7F7',
    borderRadius: 8,
    paddingHorizontal: 18,
    paddingVertical: 14,
    marginBottom: 4,
  },
  saveButton: {
    marginTop: 32,
    marginHorizontal: 24,
    backgroundColor: '#A259FF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 