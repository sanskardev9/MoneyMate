

import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
<<<<<<< HEAD
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
} from "react-native";
import { supabase } from "../lib/supabase";
import Toast from "react-native-toast-message";
=======
  Alert,
  Button,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { supabase } from "../lib/supabase";
import Toast from "react-native-toast-message";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'react-native';
>>>>>>> 3c4a371cd1c31a7fb48873943c1c293ece7a28db

export default function HomeScreen({ navigation }) {
  const [income, setIncome] = useState("");
  const [loading, setLoading] = useState(false);
<<<<<<< HEAD

  const handleSubmit = async () => {
    if (!income || isNaN(income) || Number(income) <= 0) {
      Alert.alert("Error", "Please enter a valid income amount.");
=======
  const [profileImage, setProfileImage] = useState(null);
  const [profileImageUrl, setProfileImageUrl] = useState(null);
  const [uploading, setUploading] = useState(false);

  React.useEffect(() => {
    // Fetch current profile image on mount
    (async () => {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData?.user) return;
      const userId = userData.user.id;
      const { data, error } = await supabase
        .from('users')
        .select('profile_image_url')
        .eq('id', userId)
        .single();
      if (!error && data && data.profile_image_url) {
        setProfileImageUrl(data.profile_image_url);
      }
    })();
  }, []);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera roll permissions to select a profile image.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaType.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setProfileImage(result.assets[0].uri);
      await uploadProfileImage(result.assets[0].uri);
    }
  };

  const uploadProfileImage = async (uri) => {
    setUploading(true);
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData?.user) throw userError || new Error('No user');
      const userId = userData.user.id;
      const response = await fetch(uri);
      const blob = await response.blob();
      const fileName = `profile_${userId}_${Date.now()}.jpg`;
      const { data, error } = await supabase.storage
        .from('profile-images')
        .upload(fileName, blob, { upsert: true, contentType: 'image/jpeg' });
      if (error) throw error;
      const { data: publicUrlData } = supabase.storage
        .from('profile-images')
        .getPublicUrl(fileName);
      setProfileImageUrl(publicUrlData.publicUrl);
      // Update user profile
      await supabase
        .from('users')
        .update({ profile_image_url: publicUrlData.publicUrl })
        .eq('id', userId);
      Toast.show({ type: 'success', text1: 'Profile image updated!' });
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Error saving image' });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    const amount = parseFloat(income);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert("Invalid Income", "Please enter a valid income amount.");
>>>>>>> 3c4a371cd1c31a7fb48873943c1c293ece7a28db
      return;
    }

    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

<<<<<<< HEAD
    const { error } = await supabase.from("incomes").insert([{
      user_id: user.id,
      amount: Number(income),
      type: 'salary',
    }]);
=======
    const { error } = await supabase.from("incomes").insert([
      {
        user_id: user.id,
        amount: amount,
      },
    ]);

    setLoading(false);
>>>>>>> 3c4a371cd1c31a7fb48873943c1c293ece7a28db

    if (error) {
      console.error("Income insert error:", error);
      Alert.alert("Error", "Failed to save income. Try again.");
<<<<<<< HEAD
      setLoading(false);
      return;
    }

    setLoading(false);

    Toast.show({
      type: "success",
      text1: "Income saved!",
      position: "bottom",
      visibilityTime: 2000,
      autoHide: true,
      bottomOffset: 40,
    });

    // Reset form
    setIncome("");

    setTimeout(() => {
      navigation.navigate("BudgetCategories");
    }, 1200);
  };

  const renderForm = () => (
    <>
      <Text style={styles.title}>MoneyMate💸 </Text>
      <Text style={styles.subtitle}>Where income starts evolving.</Text>

      <Text style={styles.label}>What's your monthly income?</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter amount in ₹"
        placeholderTextColor="#888888"
        keyboardType="numeric"
        value={income}
        onChangeText={setIncome}
      />

      <TouchableOpacity
        style={[styles.button, loading && { opacity: 0.6 }]}
        onPress={handleSubmit}
        disabled={loading}
      >
        <Text style={styles.buttonText}>{loading ? "Saving..." : "Save & Continue"}</Text>
      </TouchableOpacity>
    </>
  );

=======
    } else {
      Toast.show({
        type: "success",
        text1: "Saved!",
        position: "bottom",
        visibilityTime: 2000,
        autoHide: true,
        bottomOffset: 40,
      });

      setIncome("");

      setTimeout(() => {
        navigation.navigate("BudgetCategories");
      }, 1200);
    }
  };

>>>>>>> 3c4a371cd1c31a7fb48873943c1c293ece7a28db
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
      keyboardVerticalOffset={64}
    >
<<<<<<< HEAD
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          {renderForm()}
        </View>
      </ScrollView>
=======
      <View style={styles.container}>
        <Text style={styles.title}>MoneyMate💸 </Text>
        <Text style={styles.subtitle}>
           Where income starts evolving.
        </Text>

        <Text style={styles.label}>What’s your monthly income?</Text>

        <TextInput
          style={styles.input}
          placeholder="Enter amount in ₹"
          placeholderTextColor="#888888"
          keyboardType="numeric"
          value={income}
          onChangeText={setIncome}
        />

        <TouchableOpacity
          style={[styles.button, loading && { opacity: 0.6 }]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.buttonText}>{loading ? "Saving..." : "Continue"}</Text>
        </TouchableOpacity>
      </View>
>>>>>>> 3c4a371cd1c31a7fb48873943c1c293ece7a28db
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
<<<<<<< HEAD
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  container: { 
    flex: 1, 
    backgroundColor: '#FFFFFF', 
    justifyContent: "center", 
    padding: 24 
  },
  title: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    color: '#222222', 
    marginBottom: 8, 
    textAlign: 'center', 
    fontStyle: 'italic', 
    textShadowColor: '#A259FF33', 
    textShadowOffset: { width: 0, height: 0 }, 
    textShadowRadius: 6 
  },
=======
  container: { flex: 1, backgroundColor: '#FFFFFF', justifyContent: 'center', padding: 24 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#222222', marginBottom: 8, textAlign: 'center', fontStyle: 'italic', textShadowColor: '#A259FF33', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 6 },
>>>>>>> 3c4a371cd1c31a7fb48873943c1c293ece7a28db
  subtitle: {
    fontSize: 16,
    color: "#aaa",
    textAlign: "center",
    marginBottom: 32,
    opacity: 0.8,
  },
<<<<<<< HEAD
  label: { 
    fontSize: 16, 
    color: '#888888', 
    marginBottom: 4,
    marginTop: 16 
  },
  hint: {
    fontSize: 12,
    color: '#888888',
    marginBottom: 8,
    fontStyle: 'italic',
  },
=======
  label: { fontSize: 16, color: '#888888', marginBottom: 8 },
>>>>>>> 3c4a371cd1c31a7fb48873943c1c293ece7a28db
  input: {
    borderWidth: 0,
    backgroundColor: '#F7F7F7',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    color: '#222222',
    fontSize: 16,
    borderColor: '#A259FF',
    placeholderTextColor: '#888888',
  },
<<<<<<< HEAD


=======
>>>>>>> 3c4a371cd1c31a7fb48873943c1c293ece7a28db
  button: {
    backgroundColor: '#A259FF',
    borderRadius: 10,
    paddingVertical: 14,
    marginTop: 8,
    shadowColor: '#A259FF',
    shadowOffset: { width: 0, height: 4 },
<<<<<<< HEAD
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
=======
    shadowOpacity: 0.6,
    shadowRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
  profileImageSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  profileImageContainer: {
    alignSelf: 'center',
    marginBottom: 8,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#A259FF',
  },
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
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
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
    fontWeight: '500',
  },
  profileImageWrapper: {
    position: 'relative',
  },
  changeImageOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#A259FF',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
>>>>>>> 3c4a371cd1c31a7fb48873943c1c293ece7a28db
});
