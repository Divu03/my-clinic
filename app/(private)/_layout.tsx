import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: '#0165FC', headerShown: false }}>
      <Tabs.Screen name="index" options={{ 
        title: 'Home', 
        tabBarIcon: ({ color }) => <Ionicons name="map-outline" size={24} color={color} /> 
      }} />
      <Tabs.Screen name="search" options={{ 
        title: 'Search', 
        tabBarIcon: ({ color }) => <Ionicons name="search-outline" size={24} color={color} /> 
      }} />
      <Tabs.Screen name="tokens" options={{ 
        title: 'My Queue', 
        tabBarIcon: ({ color }) => <Ionicons name="ticket-outline" size={24} color={color} /> 
      }} />
      <Tabs.Screen name="profile" options={{ 
        title: 'Profile', 
        tabBarIcon: ({ color }) => <Ionicons name="person-outline" size={24} color={color} /> 
      }} />
    </Tabs>
  );
}