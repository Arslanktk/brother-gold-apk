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
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { collection, getDocs, addDoc, updateDoc, doc, query, where } from 'firebase/firestore';
import { db, storage } from '../services/firebase';
import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function ManagerDashboard({ navigation, user, onLogout }) {
  const [workers, setWorkers] = useState([]);
  const [showAddWorker, setShowAddWorker] = useState(false);
  const [showAddLog, setShowAddLog] = useState(false);
  const [workerName, setWorkerName] = useState('');
  const [workerDesignation, setWorkerDesignation] = useState('');
  const [workerImage, setWorkerImage] = useState(null);
  const [logWorker, setLogWorker] = useState(null);
  const [logDate, setLogDate] = useState(new Date().toISOString().split('T')[0]);
  const [logWork, setLogWork] = useState('');
  const [logAmount, setLogAmount] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadWorkers();
  }, [user]);

  const loadWorkers = async () => {
    if (!user?.assigned_factory) return;
    
    try {
      const q = query(
        collection(db, 'workers'),
        where('factory_id', '==', user.assigned_factory)
      );
      const querySnapshot = await getDocs(q);
      const workerList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setWorkers(workerList);
    } catch (error) {
      console.error('Error loading workers:', error);
      Alert.alert('Error', 'Failed to load workers');
    }
  };

  const handleAddWorker = async () => {
    if (!workerName.trim() || !workerDesignation.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      let imageUrl = null;
      
      if (workerImage) {
        const response = await fetch(workerImage);
        const blob = await response.blob();
        const imageRef = ref(storage, `worker_images/${Date.now()}.jpg`);
        await uploadBytes(imageRef, blob);
        imageUrl = await getDownloadURL(imageRef);
      }

      await addDoc(collection(db, 'workers'), {
        name: workerName.trim(),
        designation: workerDesignation.trim(),
        image_url: imageUrl,
        factory_id: user.assigned_factory,
        factory_name: user.assigned_factory_name,
        created_at: new Date().toISOString(),
        created_by: user.uid
      });

      setWorkerName('');
      setWorkerDesignation('');
      setWorkerImage(null);
      setShowAddWorker(false);
      Alert.alert('Success', 'Worker added successfully');
      loadWorkers();
    } catch (error) {
      console.error('Error adding worker:', error);
      Alert.alert('Error', 'Failed to add worker');
    }
  };

  const handleAddLog = async () => {
    if (!logWorker || !logWork.trim() || !logAmount.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      await addDoc(collection(db, 'daily_logs'), {
        worker_id: logWorker.id,
        worker_name: logWorker.name,
        date: logDate,
        nature_of_work: logWork.trim(),
        amount_PKR: parseFloat(logAmount),
        approved: false,
        factory_id: user.assigned_factory,
        factory_name: user.assigned_factory_name,
        created_at: new Date().toISOString(),
        created_by: user.uid
      });

      setLogWorker(null);
      setLogWork('');
      setLogAmount('');
      setShowAddLog(false);
      Alert.alert('Success', 'Daily log submitted for approval');
    } catch (error) {
      console.error('Error adding log:', error);
      Alert.alert('Error', 'Failed to add daily log');
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setWorkerImage(result.assets[0].uri);
    }
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadWorkers();
    setIsRefreshing(false);
  };

  const renderWorkerItem = ({ item }) => (
    <View style={styles.workerCard}>
      {item.image_url && (
        <Image source={{ uri: item.image_url }} style={styles.workerImage} />
      )}
      <View style={styles.workerInfo}>
        <Text style={styles.workerName}>{item.name}</Text>
        <Text style={styles.workerDesignation}>{item.designation}</Text>
        <Text style={styles.workerStats}>
          Added: {new Date(item.created_at).toLocaleDateString()}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.addLogButton}
        onPress={() => {
          setLogWorker(item);
          setShowAddLog(true);
        }}
      >
        <Text style={styles.addLogButtonText}>Add Log</Text>
      </TouchableOpacity>
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
            <View>
              <Text style={styles.title}>Manager Dashboard</Text>
              <Text style={styles.subtitle}>{user?.assigned_factory_name}</Text>
            </View>
            <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => setShowAddWorker(true)}
              >
                <Text style={styles.actionButtonText}>Add Worker</Text>
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
              Workers ({workers.length})
            </Text>
            {workers.length === 0 ? (
              <Text style={styles.emptyText}>No workers added yet</Text>
            ) : (
              <FlatList
                data={workers}
                renderItem={renderWorkerItem}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
              />
            )}
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* Add Worker Modal */}
      <Modal
        visible={showAddWorker}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddWorker(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Worker</Text>
            
            <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
              {workerImage ? (
                <Image source={{ uri: workerImage }} style={styles.selectedImage} />
              ) : (
                <Text style={styles.imageButtonText}>Select Photo</Text>
              )}
            </TouchableOpacity>

            <TextInput
              style={styles.modalInput}
              placeholder="Worker Name"
              value={workerName}
              onChangeText={setWorkerName}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Designation (e.g., Bat Maker)"
              value={workerDesignation}
              onChangeText={setWorkerDesignation}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowAddWorker(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.addButton]}
                onPress={handleAddWorker}
              >
                <Text style={styles.addButtonText}>Add Worker</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Log Modal */}
      <Modal
        visible={showAddLog}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddLog(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Add Daily Log - {logWorker?.name}
            </Text>
            
            <TextInput
              style={styles.modalInput}
              placeholder="Date"
              value={logDate}
              onChangeText={setLogDate}
            />
            <TextInput
              style={[styles.modalInput, styles.textArea]}
              placeholder="Nature of Work"
              value={logWork}
              onChangeText={setLogWork}
              multiline
              numberOfLines={3}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Amount (PKR)"
              value={logAmount}
              onChangeText={setLogAmount}
              keyboardType="numeric"
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowAddLog(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.addButton]}
                onPress={handleAddLog}
              >
                <Text style={styles.addButtonText}>Submit Log</Text>
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
  subtitle: {
    fontSize: 16,
    color: '#1e3a8a',
    opacity: 0.8,
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
  workerCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  workerImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  workerInfo: {
    flex: 1,
  },
  workerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  workerDesignation: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  workerStats: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
  },
  addLogButton: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
  },
  addLogButtonText: {
    color: '#1e3a8a',
    fontWeight: 'bold',
    fontSize: 12,
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
    width: '90%',
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
  textArea: {
    height: 80,
    textAlignVertical: 'top',
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
  imageButton: {
    backgroundColor: '#f0f0f0',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
  },
  imageButtonText: {
    color: '#666',
    fontSize: 16,
  },
  selectedImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
});