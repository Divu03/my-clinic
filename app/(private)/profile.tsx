import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ProfileScreen() {
  const router = useRouter();

  const handleLogout = async () => {
    await SecureStore.deleteItemAsync('accessToken');
    await SecureStore.deleteItemAsync('refreshToken');
    router.replace('/(public)/login');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
           <Ionicons name="person" size={40} color="white" />
        </View>
        <Text style={styles.name}>John Doe</Text>
        <Text style={styles.email}>john.doe@example.com</Text>
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.row}>
           <Ionicons name="create-outline" size={24} color="#333" />
           <Text style={styles.rowText}>Edit Profile</Text>
           <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.row}>
           <Ionicons name="notifications-outline" size={24} color="#333" />
           <Text style={styles.rowText}>Notifications</Text>
           <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F9FF' },
  header: { alignItems: 'center', padding: 40, backgroundColor: 'white', marginBottom: 20 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#0165FC', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  name: { fontSize: 22, fontWeight: 'bold' },
  email: { color: '#666' },
  section: { backgroundColor: 'white', paddingHorizontal: 20 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  rowText: { flex: 1, marginLeft: 15, fontSize: 16 },
  logoutBtn: { margin: 20, backgroundColor: '#FF3B30', padding: 15, borderRadius: 12, alignItems: 'center' },
  logoutText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});