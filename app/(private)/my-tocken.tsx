import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Token } from '../../src/models/types';

const getStatusColor = (status: string) => {
  switch(status) {
    case 'WAITING': return '#FF9500'; // Orange
    case 'CALLED': return '#34C759';  // Green
    case 'IN_PROGRESS': return '#007AFF'; // Blue
    default: return '#8E8E93'; // Gray
  }
};

const TokenStatusCard = ({ token }: { token: Token }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>Token Number</Text>
      <Text style={styles.number}>{token.tokenNumber}</Text>
      <View style={[styles.badge, { backgroundColor: getStatusColor(token.status) }]}>
        <Text style={styles.statusText}>{token.status}</Text>
      </View>
    </View>
  );
};

export default function MyTokenScreen() {
  // Logic to fetch user's active token will go here
  return (
    <View style={styles.container}>
      <Text style={styles.header}>My Active Tokens</Text>
      <Text style={styles.emptyText}>You don't have any active tokens yet.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  card: {
    padding: 20,
    borderRadius: 15,
    backgroundColor: '#fff',
    elevation: 4,
    shadowOpacity: 0.1,
    alignItems: 'center'
  },
  label: { color: '#666', fontSize: 14 },
  number: { fontSize: 48, fontWeight: 'bold', color: '#0165FC', marginVertical: 10 },
  badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  statusText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#999' }
});