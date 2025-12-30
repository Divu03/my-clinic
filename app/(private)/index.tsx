import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useHomeViewModel } from '../../src/viewmodels/useHomeViewModel';

export default function HomeScreen() {
  const { clinics, loading } = useHomeViewModel();
  const router = useRouter();

  const renderClinic = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => router.push(`/clinic/${item.id}`)}
    >
      <View style={styles.cardHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.name[0]}</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.type}>{item.type.replace('_', ' ')}</Text>
          <View style={styles.metaRow}>
            <Ionicons name="time-outline" size={14} color="#666" />
            <Text style={styles.metaText}>{item.openingHours.start} - {item.openingHours.end}</Text>
          </View>
        </View>
        <View style={styles.distanceBadge}>
          <Text style={styles.distanceText}>
             {item.distance_km ? `${item.distance_km.toFixed(1)} km` : 'Near'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Nearby Clinics</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#0165FC" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={clinics}
          keyExtractor={(item) => item.id}
          renderItem={renderClinic}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 20 },
  headerTitle: { fontSize: 28, fontWeight: 'bold', marginBottom: 15, marginTop: 10 },
  list: { paddingBottom: 20 },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0'
  },
  cardHeader: { flexDirection: 'row', flex: 1, alignItems: 'center' },
  avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#E0F0FF', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  avatarText: { color: '#0165FC', fontSize: 20, fontWeight: 'bold' },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  type: { fontSize: 13, color: '#0165FC', fontWeight: '600', marginTop: 2 },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  metaText: { fontSize: 12, color: '#888', marginLeft: 4 },
  distanceBadge: { backgroundColor: '#F5F9FF', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  distanceText: { fontSize: 12, fontWeight: 'bold', color: '#0165FC' }
});