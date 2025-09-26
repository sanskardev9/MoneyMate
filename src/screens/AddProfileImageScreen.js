import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { supabase } from '../lib/supabase';
import * as ImagePicker from 'expo-image-picker';
import Toast from 'react-native-toast-message';

export default function AddProfileImageScreen({ onComplete }) {
  const [profileImage, setProfileImage] = useState(null);
  const [uploading, setUploading] = useState(false);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaType.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    setUploading(true);
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData?.user) throw userError || new Error('No user');
      const userId = userData.user.id;
      let profileImageUrl = null;
      if (profileImage) {
        const response = await fetch(profileImage);
        const blob = await response.blob();
        const fileName = `profile_${userId}_${Date.now()}.jpg`;
        const { data, error } = await supabase.storage
          .from('profile-images')
          .upload(fileName, blob, { upsert: true, contentType: 'image/jpeg' });
        if (error) throw error;
        const { data: publicUrlData } = supabase.storage
          .from('profile-images')
          .getPublicUrl(fileName);
        profileImageUrl = publicUrlData.publicUrl;
      }
      if (profileImageUrl) {
        const { error: updateError } = await supabase
          .from('users')
          .update({ profile_image_url: profileImageUrl })
          .eq('id', userId);
        if (updateError) throw updateError;
      }
      Toast.show({ type: 'success', text1: 'Profile image updated!' });
      onComplete && onComplete();
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Error saving image' });
      onComplete && onComplete();
    } finally {
      setUploading(false);
    }
  };

  const handleSkip = () => {
    onComplete && onComplete();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.heading}>Add a Profile Photo</Text>
        <Text style={styles.subtext}>(Optional)</Text>
        <TouchableOpacity style={styles.profileImageContainer} onPress={pickImage}>
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.profileImage} />
          ) : (
            <View style={styles.profileImagePlaceholder}>
              <Icon name="camera-plus" size={36} color="#A259FF" />
              <Text style={styles.profileImageText}>Tap to add photo</Text>
            </View>
          )}
        </TouchableOpacity>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.skipButton} onPress={handleSkip} disabled={uploading}>
            <Text style={styles.skipButtonText}>Skip</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.saveButton, !profileImage && { opacity: 0.5 }]}
            onPress={handleSave}
            disabled={!profileImage || uploading}
          >
            {uploading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>Save</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
      <Toast />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtext: {
    fontSize: 14,
    color: '#888',
    marginBottom: 24,
    textAlign: 'center',
  },
  profileImageContainer: {
    alignSelf: 'center',
    marginBottom: 32,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#A259FF',
  },
  profileImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: '#A259FF',
    borderStyle: 'dashed',
    backgroundColor: '#F7F7F7',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#A259FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  profileImageText: {
    color: '#A259FF',
    fontSize: 13,
    marginTop: 6,
    textAlign: 'center',
    fontWeight: '500',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    gap: 16,
  },
  skipButton: {
    backgroundColor: '#F0F0F0',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 10,
    marginRight: 8,
  },
  skipButtonText: {
    color: '#A259FF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#A259FF',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 10,
    marginLeft: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
}); 