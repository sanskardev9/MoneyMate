import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { supabase } from "../lib/supabase";
import { Animated, Easing } from "react-native";
import Toast from "react-native-toast-message";
import * as ImagePicker from 'expo-image-picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AddProfileImageScreen from './AddProfileImageScreen';

export default function AuthScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [justSignedUp, setJustSignedUp] = useState(false);

  const logoAnim = useRef(new Animated.Value(0)).current;
  const [typedText, setTypedText] = useState("");
  const [showTagline, setShowTagline] = useState(false);
  const fullText = "Let’s MoneyMate — it’s all about those atomic habits.";
  useEffect(() => {
    let i = 0;
    setTypedText("");
    setShowTagline(false);
    const interval = setInterval(() => {
      setTypedText((prev) => {
        if (i < fullText.length) {
          const next = prev + fullText[i];
          i++;
          if (i === fullText.length) {
            setShowTagline(true);
          }
          return next;
        }
        return prev;
      });
      if (i >= fullText.length) clearInterval(interval);
    }, 60);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    Animated.timing(logoAnim, {
      toValue: 1,
      duration: 800,
      delay: 300,
      easing: Easing.out(Easing.exp),
      useNativeDriver: true,
    }).start();
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

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const uploadProfileImage = async (userId) => {
    if (!profileImage) return null;

    try {
      console.log('Starting image upload for user:', userId);
      const response = await fetch(profileImage);
      const blob = await response.blob();
      
      const fileName = `profile_${userId}_${Date.now()}.jpg`;
      console.log('Uploading file:', fileName);
      
      const { data, error } = await supabase.storage
        .from('profile-images')
        .upload(fileName, blob, { 
          upsert: true,
          contentType: 'image/jpeg'
        });

      if (error) {
        console.error('Supabase storage upload error:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        return null;
      }

      console.log('Upload successful, getting public URL');
      const { data: { publicUrl } } = supabase.storage
        .from('profile-images')
        .getPublicUrl(fileName);

      console.log('Public URL:', publicUrl);
      return publicUrl;
    } catch (error) {
      console.error('Error uploading profile image:', error);
      return null;
    }
  };
  const handleAuth = async () => {
    if (!email || !password || (!isLogin && !name)) {
      Toast.show({
        type: "error",
        text1: "Please fill all fields",
      });
      return;
    }

    if (isLogin) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        Toast.show({
          type: "error",
          text1: "Login failed",
          text2: error.message,
        });
      } else {
        Toast.show({ type: "success", text1: "Welcome back!" });
      }
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        Toast.show({
          type: "error",
          text1: "Signup failed",
          text2: error.message,
        });
      } else {
        Toast.show({
          type: "success",
          text1: "Account created!",
          text2: "Check your inbox to confirm your email.",
        });

        // Store user data in users table
        if (name && name.trim()) {
          const { error: insertError } = await supabase
            .from("users")
            .insert([{ 
              id: data.user.id, 
              email, 
              name: name.trim(),
              profile_image_url: null 
            }]);
          if (insertError) {
            Toast.show({
              type: 'error',
              text1: insertError.message,
              position: 'bottom',
              visibilityTime: 2000,
              autoHide: true,
              bottomOffset: 40,
            });
          } else {
            Toast.show({
              type: 'success',
              text1: 'Signup successful!',
              position: 'bottom',
              visibilityTime: 2000,
              autoHide: true,
              bottomOffset: 40,
            });
            setJustSignedUp(true);
            return;
          }
        } else {
          Toast.show({
            type: 'error',
            text1: 'Please enter your name.',
            position: 'bottom',
            visibilityTime: 2000,
            autoHide: true,
            bottomOffset: 40,
          });
          return;
        }
      }
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      {justSignedUp && (
        <AddProfileImageScreen onComplete={() => setJustSignedUp(false)} />
      )}

      <Animated.Text
        style={[
          styles.brandText,
          {
            opacity: logoAnim,
            transform: [{ scale: logoAnim }],
            color: "#000",
            fontWeight: "bold",
            fontStyle:"italic",
          },
        ]}
      >
        MoneyMate💸 
      </Animated.Text>

      <Text style={styles.heading}>
        {isLogin ? "Welcome Back" : "Create Account"}
      </Text>
      <Text style={styles.tagline}>
        <Text style={{ fontWeight: "bold", color: "#A259FF" }}>
          {typedText.slice(0, fullText.indexOf('—') !== -1 ? fullText.indexOf('—') : typedText.length)}
        </Text>
        <Text style={{ color: '#222222' }}>
          {typedText.slice(fullText.indexOf('—'))}
        </Text>
      </Text>

      {!isLogin && (
        <>
          <TextInput
            style={styles.input}
            placeholder="Your Name"
            placeholderTextColor="rgba(136,136,136,0.5)"
            value={name}
            onChangeText={setName}
          />
        </>
      )}

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="rgba(136,136,136,0.5)"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="rgba(136,136,136,0.5)"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.button} onPress={handleAuth}>
        <Text style={styles.buttonText}>{isLogin ? "Login" : "Sign Up"}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
        <Text style={styles.toggle}>
          {isLogin
            ? "Don't have an account? Sign Up"
            : "Already have an account? Login"}
        </Text>
      </TouchableOpacity>
      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  brandText: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    color: "#A259FF",
    marginBottom: 16,
    textShadowColor: "#A259FF44",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
    letterSpacing: 1.2,
  },
  heading: {
    color: "#222222",
    fontSize: 20,
    fontWeight: "500",
    textAlign: "center",
    marginBottom: 20,
    opacity: 0.9,
  },
  input: {
    height: 50,
    backgroundColor: "#F7F7F7",
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    color: "#222222",
    fontSize: 16,
    borderWidth: 0,
    borderColor: "transparent",
    placeholderTextColor: "#888888",
  },
  button: {
    backgroundColor: "#A259FF",
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 8,
    shadowColor: "#A259FF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 6,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "center",
  },
  toggle: {
    color: "#888888",
    textAlign: "center",
    marginTop: 20,
    fontSize: 14,
    opacity: 0.6,
    textDecorationLine: "underline",
    // borderColor: "#E0E0E0",
    borderRadius: 10,
    // borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  tagline: {
    color: "#888888",
    textAlign: "center",
    fontSize: 14,
    marginBottom: 24,
    lineHeight: 20,
    textShadowColor: "#A259FF55",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
  profileImageContainer: {
    alignSelf: 'center',
    marginBottom: 20,
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
  profileImageSection: {
    marginBottom: 20,
  },
  profileImageLabel: {
    color: '#888888',
    fontSize: 14,
    marginBottom: 8,
    textAlign: 'center',
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
});
