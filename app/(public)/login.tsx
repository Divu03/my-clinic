import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

export default function LoginScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Top Section - Slick Fade In */}
      <Animated.View entering={FadeInUp.delay(200).duration(1000)} style={styles.header}>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Log in to manage your clinic</Text>
      </Animated.View>

      {/* Form Section - Staggered Slide Up */}
      <View style={styles.form}>
        <Animated.View entering={FadeInDown.delay(400).springify()}>
          <TextInput placeholder="Email" style={styles.input} placeholderTextColor="#999" />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(600).springify()}>
          <TextInput placeholder="Password" style={styles.input} secureTextEntry placeholderTextColor="#999" />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(800).springify()}>
          <TouchableOpacity 
            style={styles.button} 
            onPress={() => {/* We will add Auth logic later */}}
          >
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(1000).springify()} style={styles.footer}>
          <Text>Don't have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/signup')}>
            <Text style={styles.link}>Sign Up</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 24, justifyContent: 'center' },
  header: { marginBottom: 40 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#0165FC' },
  subtitle: { fontSize: 16, color: '#666', marginTop: 8 },
  form: { gap: 16 },
  input: {
    backgroundColor: '#F5F9FF',
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  button: {
    backgroundColor: '#0165FC',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#0165FC',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  link: { color: '#0165FC', fontWeight: 'bold' },
});