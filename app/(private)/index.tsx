import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ActivityIndicator, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useHomeViewModel } from '../../src/viewmodels/useHomeViewModel';

export default function HomeScreen() {
  const { clinics, radius, setRadius, loading } = useHomeViewModel();
  const [filterVisible, setFilterVisible] = useState(false);

  return (
    <View style={styles.container}>
      {/* Header / Filter Bar */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.filterButton} onPress={() => setFilterVisible(true)}>
          <Ionicons name="options-outline" size={24} color="#0165FC" />
          <Text style={styles.filterText}>Within {radius}km</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#0165FC" />
        </View>
      ) : (
        <MapView 
          style={styles.map}
          initialRegion={{
            latitude: 43.4643, // Default to Kitchener
            longitude: -80.4844,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        >
          {clinics.map((clinic) => (
            <Marker 
              key={clinic.id} 
              coordinate={{ latitude: clinic.latitude, longitude: clinic.longitude }}
              title={clinic.name}
              description={clinic.type}
            />
          ))}
        </MapView>
      )}

      <RadiusFilterModal 
        visible={filterVisible} 
        currentRadius={radius} 
        onSelect={(val: number) => setRadius(val)} 
        onClose={() => setFilterVisible(false)} 
      />
    </View>
  );
}

const RadiusFilterModal = ({ visible, currentRadius, onSelect, onClose }: any) => (
  <Modal visible={visible} transparent animationType="fade">
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>Select Search Radius</Text>
        {[5, 10, 25, 50, 100].map(val => (
          <TouchableOpacity 
            key={val} 
            style={[styles.option, currentRadius === val && styles.selectedOption]} 
            onPress={() => { onSelect(val); onClose(); }}
          >
            <Text style={[styles.optionText, currentRadius === val && styles.selectedOptionText]}>
              {val} km
            </Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    position: 'absolute', 
    top: 50, 
    left: 20, 
    right: 20, 
    zIndex: 10,
  },
  filterButton: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 25,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  filterText: { marginLeft: 8, fontWeight: 'bold', color: '#333' },
  map: { width: '100%', height: '100%' },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  modalOverlay: { 
    flex: 1, 
    justifyContent: 'center', 
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 20
  },
  modalContent: { 
    backgroundColor: 'white', 
    padding: 20, 
    borderRadius: 15 
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  option: { padding: 15, borderRadius: 10, marginVertical: 5, backgroundColor: '#F5F9FF' },
  selectedOption: { backgroundColor: '#0165FC' },
  optionText: { textAlign: 'center', fontSize: 16, color: '#333' },
  selectedOptionText: { color: 'white', fontWeight: 'bold' },
  closeButton: { marginTop: 10, padding: 15 },
  closeButtonText: { textAlign: 'center', color: '#FF3B30', fontWeight: 'bold' }
});