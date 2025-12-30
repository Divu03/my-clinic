import { useRouter } from 'expo-router';
import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSignupViewModel } from '../../src/viewmodels/SignupViewModel';

export default function SignupScreen() {
  const router = useRouter();
  const { formData, updateField, handleSignup } = useSignupViewModel();

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Animated.View entering={FadeInDown.delay(200).duration(800)}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join My Clinic to manage your health</Text>
        </Animated.View>

        <View style={styles.form}>
          {/* First & Last Name Row */}
          <View style={styles.row}>
            <Animated.View entering={FadeInDown.delay(400)} style={{ flex: 1 }}>
              <TextInput 
                placeholder="First Name" 
                style={styles.input} 
                onChangeText={(val) => updateField('firstName', val)}
              />
            </Animated.View>
            <Animated.View entering={FadeInDown.delay(500)} style={{ flex: 1 }}>
              <TextInput 
                placeholder="Last Name" 
                style={styles.input} 
                onChangeText={(val) => updateField('lastName', val)}
              />
            </Animated.View>
          </View>

          <Animated.View entering={FadeInDown.delay(600)}>
            <TextInput 
              placeholder="Email Address" 
              style={styles.input} 
              keyboardType="email-address"
              onChangeText={(val) => updateField('email', val)}
            />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(700)}>
            <TextInput 
              placeholder="Password" 
              style={styles.input} 
              secureTextEntry 
              onChangeText={(val) => updateField('password', val)}
            />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(800)}>
            <TextInput 
              placeholder="Confirm Password" 
              style={styles.input} 
              secureTextEntry 
              onChangeText={(val) => updateField('confirmPassword', val)}
            />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(900)}>
            <TouchableOpacity style={styles.button} onPress={handleSignup}>
              <Text style={styles.buttonText}>Get Started</Text>
            </TouchableOpacity>
          </Animated.View>

          <TouchableOpacity onPress={() => router.back()} style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? <Text style={styles.link}>Login</Text></Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, paddingTop: 80, backgroundColor: '#fff' },
  title: { fontSize: 30, fontWeight: 'bold', color: '#0165FC' },
  subtitle: { fontSize: 16, color: '#666', marginBottom: 30, marginTop: 8 },
  form: { gap: 15 },
  row: { flexDirection: 'row', gap: 10 },
  input: {
    backgroundColor: '#F5F9FF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  button: {
    backgroundColor: '#0165FC',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  footer: { marginTop: 20, alignItems: 'center' },
  footerText: { color: '#666' },
  link: { color: '#0165FC', fontWeight: 'bold' },
});