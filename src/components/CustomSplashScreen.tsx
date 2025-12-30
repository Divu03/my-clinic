import React from 'react';
import { StatusBar, StyleSheet, Text, View } from 'react-native';

export default function CustomSplashScreen() {
  return (
    <View style={styles.container}>
      {/* Ensures the status bar matches the splash color */}
      <StatusBar barStyle="light-content" backgroundColor="#0165FC" />
      
      <Text style={styles.text}>My Clinic</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0165FC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#FFFFFF',
    fontSize: 42,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});