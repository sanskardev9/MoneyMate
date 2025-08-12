

import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
} from "react-native";
import { supabase } from "../lib/supabase";
import Toast from "react-native-toast-message";

export default function HomeScreen({ navigation }) {
  const [income, setIncome] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!income || isNaN(income) || Number(income) <= 0) {
      Alert.alert("Error", "Please enter a valid income amount.");
      return;
    }

    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase.from("incomes").insert([{
      user_id: user.id,
      amount: Number(income),
      type: 'salary',
    }]);

    if (error) {
      console.error("Income insert error:", error);
      Alert.alert("Error", "Failed to save income. Try again.");
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

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
      keyboardVerticalOffset={64}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          {renderForm()}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
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
  subtitle: {
    fontSize: 16,
    color: "#aaa",
    textAlign: "center",
    marginBottom: 32,
    opacity: 0.8,
  },
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


  button: {
    backgroundColor: '#A259FF',
    borderRadius: 10,
    paddingVertical: 14,
    marginTop: 8,
    shadowColor: '#A259FF',
    shadowOffset: { width: 0, height: 4 },
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
});
