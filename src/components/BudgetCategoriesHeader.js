import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function BudgetCategoriesHeader() {
  const [showInfoModal, setShowInfoModal] = useState(false);

  return (
    <View>
      {/* Header with Info Icon */}
      <View style={styles.headerRow}>
        <View style={styles.titleContainer}>
        <Text style={styles.heading}>Budget Categories</Text>
          <TouchableOpacity 
            style={styles.infoButton}
            onPress={() => setShowInfoModal(true)}
          >
            <Ionicons name="information-circle-outline" size={20} color="#A259FF" />
        </TouchableOpacity>
        </View>
      </View>

      {/* Info Modal */}
      <Modal
        transparent={true}
        animationType="fade"
        visible={showInfoModal}
        onRequestClose={() => setShowInfoModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Budget Categories</Text>
           <Text
                style={{
                  color: "#888888",
                  fontSize: 14,
                  marginVertical: 8,
                  textAlign: "center",
                }}
              >
                Budgeting categories gives you control of your spending habits,{" "}
                {"\n"}
                Plan your money before it disappears.{"\n"} —
                <Text style={{ color: "#A259FF", fontWeight:'bold'}}> Lord MoneyMate💰</Text>
              </Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowInfoModal(false)}
            >
              <Text style={{ color: "#fff", fontWeight: "600" }}>Got it!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    marginBottom: 10,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  heading: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1C1C1E",
  },
  infoButton: {
    padding: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "white",
    width: "80%",
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 500,
    marginBottom: 10,
    // color: "#A259FF",
    textAlign: "center",
  },
  modalText: {
    fontSize: 14,
    color: "#444",
    lineHeight: 22,
    textAlign: "left",
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: "#A259FF",
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
}); 