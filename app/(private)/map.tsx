import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import MapView, { Callout, Marker } from 'react-native-maps';
import { useHomeViewModel } from '../../src/viewmodels/useHomeViewModel';

export default function MapScreen() {
  const { clinics } = useHomeViewModel();
  const router = useRouter();

  return (
    <View style={styles.container}>
      <MapView 
        style={styles.map}
        initialRegion={{
          latitude: 43.4516,
          longitude: -80.4925,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        {clinics.map((clinic) => (
          <Marker
            key={clinic.id}
            coordinate={{ latitude: clinic.latitude, longitude: clinic.longitude }}
          >
            <Callout tooltip onPress={() => router.push(`/clinic/${clinic.id}`)}>
              <View style={styles.calloutBubble}>
                <Text style={styles.calloutTitle}>{clinic.name}</Text>
                <Text style={styles.calloutBtn}>View Details</Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width: '100%', height: '100%' },
  calloutBubble: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 8,
    width: 150,
    alignItems: 'center',
    elevation: 5
  },
  calloutTitle: { fontWeight: 'bold', marginBottom: 5 },
  calloutBtn: { color: '#0165FC', fontSize: 12 }
});