import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import MapView, { Callout, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useHomeViewModel } from '../../src/viewmodels/useHomeViewModel';

export default function MapScreen() {
  const { clinics } = useHomeViewModel();
  const router = useRouter();
  const mapRef = useRef<MapView>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Allow location access to find clinics near you.');
        return;
      }
      setPermissionGranted(true);
      
      // Optional: Center map on user immediately
      let location = await Location.getCurrentPositionAsync({});
      mapRef.current?.animateToRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
    })();
  }, []);

  return (
    <View style={styles.container}>
      <MapView 
        ref={mapRef}
        style={styles.map}
        showsUserLocation={permissionGranted} // Shows the blue dot
        showsMyLocationButton={true} // Adds the "Center on me" button
        provider={PROVIDER_GOOGLE} // Use Google Maps on both iOS and Android if configured
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
            {/* Custom Callout (Bubble) */}
            <Callout tooltip onPress={() => router.push(`/clinic/${clinic.id}`)}>
              <View style={styles.calloutBubble}>
                <Text style={styles.calloutTitle}>{clinic.name}</Text>
                <Text style={styles.calloutType}>{clinic.type}</Text>
                <View style={styles.btn}>
                   <Text style={styles.btnText}>View Details</Text>
                </View>
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
    padding: 12,
    borderRadius: 8,
    width: 180,
    alignItems: 'center',
    borderColor: '#eee',
    borderWidth: 1,
  },
  calloutTitle: { fontWeight: 'bold', marginBottom: 2, textAlign: 'center' },
  calloutType: { fontSize: 10, color: '#666', marginBottom: 8 },
  btn: { backgroundColor: '#0165FC', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 4 },
  btnText: { color: 'white', fontSize: 12, fontWeight: '600' }
});