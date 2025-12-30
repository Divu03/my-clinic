import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { DoctorClinic } from '../../../src/models/types';
import { getClinicDetails } from '../../../src/services/clinicService';

export default function ClinicDetails() {
  const { id } = useLocalSearchParams();
  const [clinic, setClinic] = useState<DoctorClinic | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClinic = async () => {
      try {
        if (id) {
          const data = await getClinicDetails(id as string);
          setClinic(data);
        }
      } catch (error) {
        console.error("Failed to fetch clinic details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchClinic();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0165FC" />
      </View>
    );
  }

  if (!clinic) {
    return (
      <View style={styles.center}>
        <Text>Clinic not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{clinic.name}</Text>
        <Text style={styles.type}>{clinic.type.replace('_', ' ')}</Text>
        <Text style={styles.description}>{clinic.description || 'No description available.'}</Text>
        
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Opening Hours</Text>
          <Text>{clinic.openingHours.start} - {clinic.openingHours.end}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#0165FC' },
  type: { fontSize: 16, color: '#666', marginVertical: 4 },
  description: { fontSize: 16, marginVertical: 10, lineHeight: 22 },
  infoBox: { marginTop: 20, padding: 15, backgroundColor: '#F5F9FF', borderRadius: 10 },
  infoTitle: { fontWeight: 'bold', marginBottom: 5 }
});