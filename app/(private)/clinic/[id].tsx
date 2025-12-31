import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useQueue } from '../../../src/context/QueueContext';
import { DoctorClinic } from '../../../src/models/types';
import { getClinicDetails } from '../../../src/services/clinicService';
import { TokenService } from '../../../src/services/token.service'; // You might need to export this from your service file

export default function ClinicDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { joinQueue, activeToken } = useQueue(); // Import global queue context
  
  const [clinic, setClinic] = useState<DoctorClinic | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        if (id) {
          // If using mock data, find it from the list. Otherwise fetch from API.
          // const data = await getClinicDetails(id as string);
          // For now, let's assume fetch works or use your mock logic
           const data = await getClinicDetails(id as string);
           setClinic(data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const handleJoinQueue = async () => {
    if (activeToken) {
      Alert.alert("Already in Queue", "You are already in a queue. Leave it before joining another.");
      return;
    }

    try {
      setJoining(true);
      // Call Backend to generate token
      // NOTE: You need to implement this in your frontend service
      const response = await TokenService.generateTokenForClinic(clinic!.id); 
      
      // Update Global Context
      joinQueue(response.data); // Assuming response.data is the Token object
      
      Alert.alert("Success", "You have joined the queue!");
      router.push('/(private)/tokens'); // Navigate to the Queue/Token tab
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to join queue");
    } finally {
      setJoining(false);
    }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#0165FC" /></View>;
  if (!clinic) return <View style={styles.center}><Text>Clinic not found</Text></View>;

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
        {/* Hero Image */}
        <Image 
          source={{ uri: clinic.logo || 'https://via.placeholder.com/400x200' }} 
          style={styles.heroImage} 
        />
        
        <View style={styles.content}>
          <Text style={styles.name}>{clinic.name}</Text>
          <Text style={styles.type}>{clinic.type.replace('_', ' ')}</Text>
          
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={20} color="#666" />
            <Text style={styles.infoText}>{clinic.address || "No address provided"}</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={20} color="#666" />
            <Text style={styles.infoText}>Open: {clinic.openingHours.start} - {clinic.openingHours.end}</Text>
          </View>

          <View style={styles.divider} />
          
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.description}>{clinic.description || "No description available."}</Text>
        </View>
      </ScrollView>

      {/* Sticky Bottom Button */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.joinBtn, joining && { opacity: 0.7 }]} 
          onPress={handleJoinQueue}
          disabled={joining}
        >
          {joining ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.joinText}>Join Queue Now</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  heroImage: { width: '100%', height: 250, resizeMode: 'cover' },
  content: { padding: 20 },
  name: { fontSize: 26, fontWeight: 'bold', color: '#333' },
  type: { fontSize: 16, color: '#0165FC', marginBottom: 15, fontWeight: '600' },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 10 },
  infoText: { color: '#555', fontSize: 15, flex: 1 },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  description: { lineHeight: 24, color: '#666' },
  footer: { padding: 20, backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#eee' },
  joinBtn: { backgroundColor: '#0165FC', padding: 18, borderRadius: 12, alignItems: 'center' },
  joinText: { color: 'white', fontSize: 18, fontWeight: 'bold' }
});