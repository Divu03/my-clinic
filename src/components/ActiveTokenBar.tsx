import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useQueue } from '../context/QueueContext';

export const ActiveTokenBar = () => {
  const { activeToken, queueStatus } = useQueue();
  const router = useRouter();

  if (!activeToken) return null;

  return (
    <TouchableOpacity onPress={() => router.push('/(private)/tokens')} style={styles.container}>
      <View style={styles.left}>
        <Ionicons name="ticket" size={20} color="white" />
        <Text style={styles.text}>Token #{activeToken.tokenNumber}</Text>
      </View>
      <View style={styles.right}>
        <Text style={styles.subtext}>
          Current: {queueStatus?.currentTokenNo || '-'}
        </Text>
        <Ionicons name="chevron-forward" size={16} color="white" />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0165FC',
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#0165FC',
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  right: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  text: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  subtext: { color: 'rgba(255,255,255,0.8)', fontSize: 12 },
});