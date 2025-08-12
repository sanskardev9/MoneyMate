import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Card } from 'react-native-paper';
import { getUpcomingRepayments, getRepaymentStatus, logRepayment } from '../lib/repaymentHelper';
import Toast from 'react-native-toast-message';

const RepaymentReminder = ({ onRepaymentLogged }) => {
  const [upcomingRepayments, setUpcomingRepayments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUpcomingRepayments();
  }, []);

  const loadUpcomingRepayments = async () => {
    try {
      const repayments = await getUpcomingRepayments();
      setUpcomingRepayments(repayments);
    } catch (error) {
      console.error('Error loading repayments:', error);
    }
  };

  const handleRepayment = async (repayment) => {
    Alert.alert(
      'Log Repayment',
      `Are you sure you want to log a repayment of ₹${repayment.amount.toLocaleString('en-IN')} to ${repayment.source}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Log Repayment', 
          style: 'default',
          onPress: async () => {
            setLoading(true);
            const result = await logRepayment(
              repayment.amount, 
              repayment.source, 
              `Repayment for loan from ${repayment.source}`
            );
            setLoading(false);
            
            if (result.success) {
              Toast.show({
                type: 'success',
                text1: 'Repayment logged!',
                text2: 'Your repayment has been recorded as an expense.',
                position: 'bottom',
                visibilityTime: 3000,
              });
              loadUpcomingRepayments(); // Refresh the list
              if (onRepaymentLogged) onRepaymentLogged();
            } else {
              Alert.alert('Error', 'Failed to log repayment. Please try again.');
            }
          }
        }
      ]
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'overdue': return '#FF4444';
      case 'urgent': return '#FF8800';
      case 'upcoming': return '#FFAA00';
      case 'future': return '#00AA00';
      default: return '#888888';
    }
  };

  const getStatusText = (status, days) => {
    switch (status) {
      case 'overdue': return `${days} days overdue`;
      case 'urgent': return `Due in ${days} days`;
      case 'upcoming': return `Due in ${days} days`;
      case 'future': return `Due in ${days} days`;
      default: return '';
    }
  };

  if (upcomingRepayments.length === 0) {
    return null; // Don't show anything if no repayments
  }

  return (
    <Card style={styles.container}>
      <Card.Content>
        <Text style={styles.title}>📋 Upcoming Repayments</Text>
        {upcomingRepayments.map((repayment, index) => {
          const status = getRepaymentStatus(repayment.due_date);
          return (
            <View key={index} style={styles.repaymentItem}>
              <View style={styles.repaymentInfo}>
                <Text style={styles.repaymentSource}>
                  {repayment.source}
                </Text>
                <Text style={styles.repaymentAmount}>
                  ₹{repayment.amount.toLocaleString('en-IN')}
                </Text>
                <Text style={[
                  styles.repaymentStatus,
                  { color: getStatusColor(status.status) }
                ]}>
                  {getStatusText(status.status, status.days)}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.repaymentButton}
                onPress={() => handleRepayment(repayment)}
                disabled={loading}
              >
                <Text style={styles.repaymentButtonText}>
                  {loading ? 'Logging...' : 'Log Repayment'}
                </Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#FFF8F0',
    borderWidth: 1,
    borderColor: '#FFE4CC',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222222',
    marginBottom: 12,
  },
  repaymentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#FFE4CC',
  },
  repaymentInfo: {
    flex: 1,
  },
  repaymentSource: {
    fontSize: 14,
    fontWeight: '600',
    color: '#222222',
  },
  repaymentAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#A259FF',
    marginTop: 2,
  },
  repaymentStatus: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  repaymentButton: {
    backgroundColor: '#A259FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 12,
  },
  repaymentButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default RepaymentReminder; 