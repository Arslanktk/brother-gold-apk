import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
  TextInput,
  FlatList,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { collection, getDocs, addDoc, updateDoc, doc, query, where } from 'firebase/firestore';
import { db } from '../services/firebase';
import { AuthService } from '../services/auth';

export default function OwnerDashboard({ navigation, onLogout }) {
  const [pendingManagers, setPendingManagers] = useState([]);
  const [factories, setFactories] = useState([]);
  const [showAddFactory, setShowAddFactory] = useState(false);
  const [newFactoryName, setNewFactoryName] = useState('');
  const [newFactoryLocation, setNewFactoryLocation] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await Promise.all([
      loadPendingManagers(),
      loadFactories()
    ]);
  };

  const loadPendingManagers = async () => {
    try {
      const pending = await AuthService.getPendingManagers();
      setPendingManagers(pending);
    } catch (error) {
      console.error('Error loading pending managers:', error);
      Alert.alert('Error', 'Failed to load pending managers');
    }
  };

  const loadFactories = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'factories'));
      const factoryList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setFactories(factoryList);
    } catch (error) {
      console.error('Error loading factories:', error);
      Alert.alert('Error', 'Failed to load factories');
    }
  };

  const handleApproveManager = async (managerId, managerData) => {
    Alert.alert(
      'Approve Manager',
      `Approve ${managerData.name || managerData.email} as manager?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          onPress: async () => {
            try {
              // Show factory selection
              if (factories.length === 0) {
                Alert.alert('No Factories', 'Please add a factory first');
                return;
              }

              Alert.alert(
                'Select Factory',
                'Choose a factory for this manager:',
                [
                  ...factories.map(factory => ({
                    text: `${factory.name} - ${factory.location}`,
                    onPress: async () => {
                      try {
                        // Update manager status and assign factory
                        await updateDoc(doc(db, 'users', managerId), {
                          role: 'manager',
                          status: 'approved',
                          assigned_factory: factory.id,
                          assigned_factory_name: factory.name,
                          approved_at: new Date().toISOString()
                        });

                        Alert.alert('Success', 'Manager approved successfully');
                        loadPendingManagers();
                      } catch (error) {
                        console.error('Error approving manager:', error);
                        Alert.alert('Error', 'Failed to approve manager');
                      }
                    }
                  })),
                  { text: 'Cancel', style: 'cancel' }
                ]
              );
            } catch (error) {
              console.error('Error in approval process:', error);
            }
          }
        }
      ]
    );
  };

  const handleAddFactory = async () => {
    if (!newFactoryName.trim() || !newFactoryLocation.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      await addDoc(collection(db, 'factories'), {
        name: newFactoryName.trim(),
        location: newFactoryLocation.trim(),
        created_at: new Date().toISOString(),
        created_by: 'owner'
      });

      setNewFactoryName('');
      setNewFactoryLocation('');
      setShowAddFactory(false);
      Alert.alert('Success', 'Factory added successfully');
      loadFactories();
    } catch (error) {
      console.error('Error adding factory:', error);
      Alert.alert('Error', 'Failed to add factory');
    }
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
  };

  const renderManagerItem = ({ item }) => (
    <View style={styles.managerCard}>
      <View style={styles.managerInfo}>
        <Text style={styles.managerName}>{item.name || 'Unknown'}</Text>
        <Text style={styles.managerEmail}>{item.email}</Text>
        <Text style={styles.managerStatus}>Status: Pending Approval</Text>
      </View>
      <TouchableOpacity
        style={styles.approveButton}
        onPress={() => handleApproveManager(item.id, item)}
      >
        <Text style={styles.approveButtonText}>Approve</Text>
      </TouchableOpacity>
    </View>
  );

  const renderFactoryItem = ({ item }) => (
    <View style={styles.factoryCard}>
      <Text style={styles.factoryName}>{item.name}</Text>
      <Text style={styles.factoryLocation}>{item.location}</Text>
      <Text style={styles.factoryStats}>
        Created: {new Date(item.created_at).toLocaleDateString()}
      </Text>
    </View>
  );

  return (
    <LinearGradient
      colors={['#FFD700', '#FFA500', '#1e3a8a']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Owner Dashboard</Text>
            <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => setShowAddFactory(true)}
              >
                <Text style={styles.actionButtonText}>Add Factory</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => navigation.navigate('Reports')}
              >
                <Text style={styles.actionButtonText}>View Reports</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Pending Managers ({pendingManagers.length})
            </Text>
            {pendingManagers.length === 0 ? (
              <Text style={styles.emptyText}>No pending manager approvals</Text>
            ) : (
              <FlatList
                data={pendingManagers}
                renderItem={renderManagerItem}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
              />
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Factories ({factories.length})
            </Text>
            {factories.length === 0 ? (
              <Text style={styles.emptyText}>No factories added yet</Text>
            ) : (
              <FlatList
                data={factories}
                renderItem={renderFactoryItem}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
              />
            )}
          </View>
        </ScrollView>
      </SafeAreaView>

      <Modal
        visible={showAddFactory}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddFactory(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Factory</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Factory Name"
              value={newFactoryName}
              onChangeText={setNewFactoryName}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Factory Location"
              value={newFactoryLocation}
              onChangeText={setNewFactoryLocation}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowAddFactory(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.addButton]}
                onPress={handleAddFactory}
              >
                <Text style={styles.addButtonText}>Add Factory</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  scrollContent: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e3a8a',
  },
  logoutButton: {
    backgroundColor: '#1e3a8a',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  logoutText: {
    color: '#FFD700',
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e3a8a',
    marginBottom: 15,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    backgroundColor: '#1e3a8a',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    flex: 0.48,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#FFD700',
    fontWeight: 'bold',
    fontSize: 16,
  },
  managerCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  managerInfo: {
    flex: 1,
  },
  managerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  managerEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  managerStatus: {
    fontSize: 12,
    color: '#ff9800',
    marginTop: 5,
    fontWeight: '600',
  },
  approveButton: {
    backgroundColor: '#4caf50',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  approveButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  factoryCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  factoryName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  factoryLocation: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  factoryStats: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
  },
  emptyText: {
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 30,
    borderRadius: 20,
    width: '80%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalInput: {
    backgroundColor: '#f8f8f8',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 0.48,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  addButton: {
    backgroundColor: '#FFD700',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: 'bold',
  },
  addButtonText: {
    color: '#1e3a8a',
    fontWeight: 'bold',
  },
});