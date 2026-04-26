import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from "react-native";
import { supabase } from "../lib/supabase";
import { Animated, Easing } from "react-native";
import Toast from "react-native-toast-message";

export default function AuthScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");

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
          text2: data.session
            ? "Taking you into the app."
            : "Please log in to continue.",
        });

        if (!data.user?.id) {
          Toast.show({
            type: "error",
            text1: "Signup completed, but user record was missing.",
          });
          return;
        }

        if (!name.trim()) {
          Toast.show({
            type: "error",
            text1: "Please enter your name.",
          });
          return;
        }

        const { error: insertError } = await supabase.from("users").upsert([
          {
            id: data.user.id,
            email,
            name: name.trim(),
            profile_image_url: null,
          },
        ]);

        if (insertError) {
          Toast.show({
            type: "error",
            text1: insertError.message,
            position: "bottom",
            visibilityTime: 2000,
            autoHide: true,
            bottomOffset: 40,
          });
          return;
        }

        if (!data.session) {
          setIsLogin(true);
        }
      }
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

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
});
