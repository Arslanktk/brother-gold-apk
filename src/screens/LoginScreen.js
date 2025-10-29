import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { AuthService } from '../services/auth';

export default function LoginScreen({ navigation, onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOwnerMode, setIsOwnerMode] = useState(true);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsLoading(true);

    try {
      let result;
      
      if (isOwnerMode) {
        result = await AuthService.ownerLogin(email, password);
      } else {
        result = await AuthService.managerLogin(email, password);
      }

      if (result.success) {
        onLogin(result.user, result.role);
      } else {
        Alert.alert('Login Failed', result.error);
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#FFD700', '#FFA500', '#1e3a8a']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoid}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.logoContainer}>
              <Image
                source={require('../assets/icon.png')}
                style={styles.logo}
                resizeMode="contain"
              />
              <Text style={styles.appTitle}>Brother Gold</Text>
              <Text style={styles.appSubtitle}>Cricket BAT Factory</Text>
            </View>

            <View style={styles.formContainer}>
              <View style={styles.modeToggle}>
                <TouchableOpacity
                  style={[styles.modeButton, isOwnerMode && styles.activeMode]}
                  onPress={() => setIsOwnerMode(true)}
                >
                  <Text style={[styles.modeText, isOwnerMode && styles.activeModeText]}>
                    Owner Login
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modeButton, !isOwnerMode && styles.activeMode]}
                  onPress={() => setIsOwnerMode(false)}
                >
                  <Text style={[styles.modeText, !isOwnerMode && styles.activeModeText]}>
                    Manager Login
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder={isOwnerMode ? 'owner@brothergold.com' : 'Enter your email'}
                  placeholderTextColor="#999"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder={isOwnerMode ? 'Enter owner password' : 'Enter your password'}
                  placeholderTextColor="#999"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>

              <TouchableOpacity
                style={[styles.loginButton, isLoading && styles.disabledButton]}
                onPress={handleLogin}
                disabled={isLoading}
              >
                <Text style={styles.loginButtonText}>
                  {isLoading ? 'Logging in...' : 'Login'}
                </Text>
              </TouchableOpacity>

              {!isOwnerMode && (
                <TouchableOpacity
                  style={styles.signupLink}
                  onPress={() => navigation.navigate('Signup')}
                >
                  <Text style={styles.signupText}>
                    Don't have an account? Sign up as Manager
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1e3a8a',
    textAlign: 'center',
  },
  appSubtitle: {
    fontSize: 18,
    color: '#1e3a8a',
    textAlign: 'center',
    opacity: 0.8,
  },
  formContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  modeToggle: {
    flexDirection: 'row',
    marginBottom: 30,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    padding: 5,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeMode: {
    backgroundColor: '#FFD700',
  },
  modeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  activeModeText: {
    color: '#1e3a8a',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f8f8f8',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    color: '#333',
  },
  loginButton: {
    backgroundColor: '#FFD700',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  disabledButton: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: '#1e3a8a',
    fontSize: 18,
    fontWeight: 'bold',
  },
  signupLink: {
    alignItems: 'center',
  },
  signupText: {
    color: '#1e3a8a',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});