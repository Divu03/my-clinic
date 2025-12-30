import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useQueue } from '../../src/context/QueueContext';

export default function TokensScreen() {
  const { activeToken, queueStatus, leaveQueue } = useQueue();

  if (!activeToken) {
    return (
      <View style={styles.center}>
        <Ionicons name="sad-outline" size={60} color="#ccc" />
        <Text style={styles.emptyText}>You are not in any queue.</Text>
        <Text style={styles.subEmpty}>Find a clinic nearby to join!</Text>
      </View>
    );
  }

  const peopleAhead = queueStatus ? (activeToken.tokenNumber - queueStatus.currentTokenNo) : 0;

  return (
    <View style={styles.container}>
      <View style={styles.ticket}>
        <Text style={styles.clinicName}>Queue Token</Text>
        
        <View style={styles.numberContainer}>
          <Text style={styles.number}>{activeToken.tokenNumber}</Text>
        </View>

        <View style={styles.statusRow}>
          <View style={styles.stat}>
            <Text style={styles.label}>Current Serving</Text>
            <Text style={styles.val}>{queueStatus?.currentTokenNo || '-'}</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.label}>People Ahead</Text>
            <Text style={styles.val}>{peopleAhead > 0 ? peopleAhead : 0}</Text>
          </View>
        </View>

        <View style={[styles.statusBadge, { backgroundColor: activeToken.status === 'CALLED' ? '#4CAF50' : '#FF9800' }]}>
            <Text style={styles.statusText}>{activeToken.status}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.leaveBtn} onPress={leaveQueue}>
        <Text style={styles.leaveText}>Leave Queue</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F9FF', padding: 20, justifyContent: 'center' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  emptyText: { fontSize: 18, fontWeight: 'bold', color: '#333', marginTop: 20 },
  subEmpty: { color: '#888' },
  ticket: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  clinicName: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 20 },
  numberContainer: { 
    backgroundColor: '#F0F8FF', 
    width: 120, 
    height: 120, 
    borderRadius: 60, 
    justifyContent: 'center', 
    alignItems: 'center',
    marginBottom: 30
  },
  number: { fontSize: 60, fontWeight: 'bold', color: '#0165FC' },
  statusRow: { flexDirection: 'row', width: '100%', justifyContent: 'space-between', marginBottom: 20 },
  stat: { alignItems: 'center' },
  label: { color: '#888', fontSize: 12 },
  val: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  statusBadge: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20 },
  statusText: { color: 'white', fontWeight: 'bold' },
  leaveBtn: { marginTop: 40, alignItems: 'center' },
  leaveText: { color: '#FF3B30', fontSize: 16, fontWeight: '600' }
});