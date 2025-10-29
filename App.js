import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, ActivityIndicator } from 'react-native';

// Import screens
import SplashScreen from './src/screens/SplashScreen';
import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import OwnerDashboard from './src/screens/OwnerDashboard';
import ManagerDashboard from './src/screens/ManagerDashboard';
import ReportsScreen from './src/screens/ReportsScreen';

// Import services
import { AuthService } from './src/services/auth';

const Stack = createStackNavigator();

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const currentUser = await AuthService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        setRole(currentUser.role);
      }
    } catch (error) {
      console.error('Auth state check error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (userData, userRole) => {
    setUser(userData);
    setRole(userRole);
  };

  const handleLogout = async () => {
    const result = await AuthService.logout();
    if (result.success) {
      setUser(null);
      setRole(null);
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#FFD700" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" backgroundColor="#FFD700" />
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerStyle: {
              backgroundColor: '#FFD700',
            },
            headerTintColor: '#1e3a8a',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        >
          {!user ? (
            <>
              <Stack.Screen 
                name="Splash" 
                component={SplashScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen 
                name="Login" 
                options={{ title: 'Login' }}
              >
                {(props) => <LoginScreen {...props} onLogin={handleLogin} />}
              </Stack.Screen>
              <Stack.Screen 
                name="Signup" 
                component={SignupScreen}
                options={{ title: 'Manager Signup' }}
              />
            </>
          ) : (
            <>
              {role === 'owner' ? (
                <>
                  <Stack.Screen 
                    name="OwnerDashboard" 
                    options={{ title: 'Owner Dashboard' }}
                  >
                    {(props) => <OwnerDashboard {...props} onLogout={handleLogout} />}
                  </Stack.Screen>
                  <Stack.Screen 
                    name="Reports" 
                    component={ReportsScreen}
                    options={{ title: 'Reports' }}
                  />
                </>
              ) : (
                <>
                  <Stack.Screen 
                    name="ManagerDashboard" 
                    options={{ title: 'Manager Dashboard' }}
                  >
                    {(props) => <ManagerDashboard {...props} user={user} onLogout={handleLogout} />}
                  </Stack.Screen>
                  <Stack.Screen 
                    name="Reports" 
                    component={ReportsScreen}
                    options={{ title: 'Reports' }}
                  />
                </>
              )}
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}