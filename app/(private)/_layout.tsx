// app/(private)/_layout.tsx
import { Ionicons } from '@expo/vector-icons'; // Import icons
import { Tabs } from 'expo-router';
import { View } from 'react-native';
import { ActiveTokenBar } from '../../src/components/ActiveTokenBar';
import { QueueProvider } from '../../src/context/QueueContext';

export default function PrivateLayout() {
  return (
    <QueueProvider>
       <View style={{ flex: 1 }}>
         {/* This ensures the bar appears on TOP of all screens */}
         <View style={{ paddingTop: 50, backgroundColor: 'white' }}>
            <ActiveTokenBar />
         </View>
         <Tabs screenOptions={{ tabBarActiveTintColor: '#0165FC', headerShown: false }}>
            <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: ({color}) => <Ionicons name="home" size={24} color={color} /> }} />
            <Tabs.Screen name="map" options={{ title: 'Map', tabBarIcon: ({color}) => <Ionicons name="map" size={24} color={color} /> }} />
            <Tabs.Screen name="tokens" options={{ title: 'Queue', tabBarIcon: ({color}) => <Ionicons name="people" size={24} color={color} /> }} />
            <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: ({color}) => <Ionicons name="person" size={24} color={color} /> }} />
            {/* Hide detail screens from tabs */}
            <Tabs.Screen name="clinic/[id]" options={{ href: null }} /> 
         </Tabs>
       </View>
    </QueueProvider>
  );
}