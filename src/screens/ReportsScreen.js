import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
  FlatList,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../services/firebase';
import { VictoryChart, VictoryBar, VictoryAxis, VictoryTheme, VictoryPie, VictoryLabel } from 'victory-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import moment from 'moment';

export default function ReportsScreen({ navigation, route }) {
  const [logs, setLogs] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [factories, setFactories] = useState([]);
  const [filterType, setFilterType] = useState('daily');
  const [selectedFactory, setSelectedFactory] = useState('all');
  const [startDate, setStartDate] = useState(moment().startOf('month').format('YYYY-MM-DD'));
  const [endDate, setEndDate] = useState(moment().endOf('month').format('YYYY-MM-DD'));
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const user = route.params?.user;
  const isOwner = !user || user.role === 'owner';

  useEffect(() => {
    loadData();
  }, [filterType, selectedFactory, startDate, endDate]);

  const loadData = async () => {
    await Promise.all([
      loadLogs(),
      loadWorkers(),
      loadFactories()
    ]);
  };

  const loadLogs = async () => {
    try {
      let q = collection(db, 'daily_logs');
      let conditions = [];

      // Apply date filter
      if (filterType === 'custom') {
        conditions.push(where('date', '>=', startDate));
        conditions.push(where('date', '<=', endDate));
      } else {
        const today = moment().format('YYYY-MM-DD');
        const weekStart = moment().startOf('week').format('YYYY-MM-DD');
        const monthStart = moment().startOf('month').format('YYYY-MM-DD');
        const yearStart = moment().startOf('year').format('YYYY-MM-DD');

        switch (filterType) {
          case 'daily':
            conditions.push(where('date', '==', today));
            break;
          case 'weekly':
            conditions.push(where('date', '>=', weekStart));
            break;
          case 'monthly':
            conditions.push(where('date', '>=', monthStart));
            break;
          case 'yearly':
            conditions.push(where('date', '>=', yearStart));
            break;
        }
      }

      // Apply factory filter
      if (!isOwner && user?.assigned_factory) {
        conditions.push(where('factory_id', '==', user.assigned_factory));
      } else if (selectedFactory !== 'all') {
        conditions.push(where('factory_id', '==', selectedFactory));
      }

      // Build the query
      if (conditions.length > 0) {
        q = query(collection(db, 'daily_logs'), ...conditions);
      }

      const querySnapshot = await getDocs(q);
      const logList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setLogs(logList);
    } catch (error) {
      console.error('Error loading logs:', error);
      Alert.alert('Error', 'Failed to load logs');
    }
  };

  const loadWorkers = async () => {
    try {
      let q = collection(db, 'workers');
      
      if (!isOwner && user?.assigned_factory) {
        q = query(q, where('factory_id', '==', user.assigned_factory));
      }

      const querySnapshot = await getDocs(q);
      const workerList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setWorkers(workerList);
    } catch (error) {
      console.error('Error loading workers:', error);
    }
  };

  const loadFactories = async () => {
    if (!isOwner) return;
    
    try {
      const querySnapshot = await getDocs(collection(db, 'factories'));
      const factoryList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setFactories(factoryList);
    } catch (error) {
      console.error('Error loading factories:', error);
    }
  };

  const generateChartData = () => {
    // Group logs by worker for bar chart
    const workerData = {};
    logs.forEach(log => {
      if (!workerData[log.worker_name]) {
        workerData[log.worker_name] = 0;
      }
      workerData[log.worker_name] += log.amount_PKR;
    });

    return Object.entries(workerData).map(([name, amount]) => ({
      x: name.length > 10 ? name.substring(0, 10) + '...' : name,
      y: amount
    }));
  };

  const generatePieData = () => {
    // Group logs by factory for pie chart (owner only)
    if (!isOwner) return [];
    
    const factoryData = {};
    logs.forEach(log => {
      if (!factoryData[log.factory_name]) {
        factoryData[log.factory_name] = 0;
      }
      factoryData[log.factory_name] += log.amount_PKR;
    });

    return Object.entries(factoryData).map(([name, amount], index) => ({
      x: name,
      y: amount
    }));
  };

  const exportToPDF = async () => {
    try {
      const chartData = generateChartData();
      const totalAmount = logs.reduce((sum, log) => sum + log.amount_PKR, 0);
      
      const html = `
        <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Brother Gold - Reports</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .header { text-align: center; margin-bottom: 30px; }
              .company-name { font-size: 24px; font-weight: bold; color: #FFD700; }
              .report-title { font-size: 18px; color: #1e3a8a; }
              .summary { background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0; }
              .summary-item { margin: 5px 0; }
              .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
              .table th, .table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              .table th { background-color: #FFD700; color: #1e3a8a; }
              .footer { margin-top: 30px; text-align: center; color: #666; }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="company-name">Brother Gold Cricket BAT Factory</div>
              <div class="report-title">${filterType.charAt(0).toUpperCase() + filterType.slice(1)} Report</div>
              <div>Generated: ${moment().format('YYYY-MM-DD HH:mm:ss')}</div>
            </div>
            
            <div class="summary">
              <div class="summary-item"><strong>Period:</strong> ${filterType === 'custom' ? `${startDate} to ${endDate}` : filterType}</div>
              <div class="summary-item"><strong>Total Logs:</strong> ${logs.length}</div>
              <div class="summary-item"><strong>Total Amount:</strong> ₨${totalAmount.toLocaleString()}</div>
              <div class="summary-item"><strong>Average per Log:</strong> ₨${(totalAmount / logs.length || 0).toLocaleString()}</div>
            </div>
            
            <table class="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Worker</th>
                  <th>Work Description</th>
                  <th>Amount (PKR)</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${logs.map(log => `
                  <tr>
                    <td>${log.date}</td>
                    <td>${log.worker_name}</td>
                    <td>${log.nature_of_work}</td>
                    <td>₨${log.amount_PKR.toLocaleString()}</td>
                    <td>${log.approved ? 'Approved' : 'Pending'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            
            <div class="footer">
              <p>Brother Gold Cricket BAT Factory © 2024</p>
              <p>This report was generated automatically</p>
            </div>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html });
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      } else {
        Alert.alert('Success', 'PDF generated successfully');
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      Alert.alert('Error', 'Failed to generate PDF');
    }
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
  };

  const totalAmount = logs.reduce((sum, log) => sum + log.amount_PKR, 0);
  const chartData = generateChartData();
  const pieData = generatePieData();

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
            <Text style={styles.title}>Reports</Text>
            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => setShowFilters(true)}
            >
              <Text style={styles.filterButtonText}>Filters</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Summary</Text>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Total Logs</Text>
                <Text style={styles.summaryValue}>{logs.length}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Total Amount</Text>
                <Text style={styles.summaryValue}>₨{totalAmount.toLocaleString()}</Text>
              </View>
            </View>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Average</Text>
                <Text style={styles.summaryValue}>
                  ₨{(totalAmount / logs.length || 0).toLocaleString()}
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Pending</Text>
                <Text style={styles.summaryValue}>
                  {logs.filter(log => !log.approved).length}
                </Text>
              </View>
            </View>
          </View>

          {chartData.length > 0 && (
            <View style={styles.chartCard}>
              <Text style={styles.chartTitle}>Earnings by Worker</Text>
              <VictoryChart
                width={350}
                height={250}
                theme={VictoryTheme.material}
                domainPadding={20}
              >
                <VictoryAxis
                  style={{
                    tickLabels: { fontSize: 10, angle: -45 }
                  }}
                />
                <VictoryAxis
                  dependentAxis
                  label="Amount (PKR)"
                  style={{
                    axisLabel: { fontSize: 12, padding: 35 }
                  }}
                />
                <VictoryBar
                  data={chartData}
                  style={{
                    data: { fill: '#FFD700' }
                  }}
                />
              </VictoryChart>
            </View>
          )}

          {isOwner && pieData.length > 0 && (
            <View style={styles.chartCard}>
              <Text style={styles.chartTitle}>Earnings by Factory</Text>
              <VictoryPie
                data={pieData}
                width={350}
                height={250}
                colorScale={['#FFD700', '#FFA500', '#1e3a8a', '#87CEEB']}
                labelRadius={90}
                innerRadius={50}
              />
            </View>
          )}

          <View style={styles.logsCard}>
            <View style={styles.logsHeader}>
              <Text style={styles.logsTitle}>Recent Logs</Text>
              <TouchableOpacity
                style={styles.exportButton}
                onPress={exportToPDF}
              >
                <Text style={styles.exportButtonText}>Export PDF</Text>
              </TouchableOpacity>
            </View>
            
            {logs.length === 0 ? (
              <Text style={styles.emptyText}>No logs found</Text>
            ) : (
              <FlatList
                data={logs.slice(0, 10)} // Show only recent 10
                renderItem={({ item }) => (
                  <View style={styles.logItem}>
                    <View style={styles.logRow}>
                      <Text style={styles.logDate}>{item.date}</Text>
                      <Text style={[styles.logStatus, item.approved ? styles.approved : styles.pending]}>
                        {item.approved ? 'Approved' : 'Pending'}
                      </Text>
                    </View>
                    <Text style={styles.logWorker}>{item.worker_name}</Text>
                    <Text style={styles.logWork} numberOfLines={2}>
                      {item.nature_of_work}
                    </Text>
                    <Text style={styles.logAmount}>₨{item.amount_PKR.toLocaleString()}</Text>
                  </View>
                )}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
              />
            )}
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* Filters Modal */}
      <Modal
        visible={showFilters}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Filter Reports</Text>
            
            <Text style={styles.filterLabel}>Time Period</Text>
            <View style={styles.filterButtons}>
              {['daily', 'weekly', 'monthly', 'yearly', 'custom'].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[styles.filterOption, filterType === type && styles.activeFilter]}
                  onPress={() => setFilterType(type)}
                >
                  <Text style={[styles.filterOptionText, filterType === type && styles.activeFilterText]}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {filterType === 'custom' && (
              <>
                <Text style={styles.filterLabel}>Start Date</Text>
                <TextInput
                  style={styles.modalInput}
                  value={startDate}
                  onChangeText={setStartDate}
                  placeholder="YYYY-MM-DD"
                />
                <Text style={styles.filterLabel}>End Date</Text>
                <TextInput
                  style={styles.modalInput}
                  value={endDate}
                  onChangeText={setEndDate}
                  placeholder="YYYY-MM-DD"
                />
              </>
            )}

            {isOwner && (
              <>
                <Text style={styles.filterLabel}>Factory</Text>
                <View style={styles.factoryButtons}>
                  <TouchableOpacity
                    style={[styles.factoryOption, selectedFactory === 'all' && styles.activeFactory]}
                    onPress={() => setSelectedFactory('all')}
                  >
                    <Text style={selectedFactory === 'all' && styles.activeFactoryText}>
                      All Factories
                    </Text>
                  </TouchableOpacity>
                  {factories.map((factory) => (
                    <TouchableOpacity
                      key={factory.id}
                      style={[styles.factoryOption, selectedFactory === factory.id && styles.activeFactory]}
                      onPress={() => setSelectedFactory(factory.id)}
                    >
                      <Text style={selectedFactory === factory.id && styles.activeFactoryText}>
                        {factory.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowFilters(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.applyButton]}
                onPress={() => {
                  setShowFilters(false);
                  loadData();
                }}
              >
                <Text style={styles.applyButtonText}>Apply</Text>
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
  filterButton: {
    backgroundColor: '#1e3a8a',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  filterButtonText: {
    color: '#FFD700',
    fontWeight: 'bold',
  },
  summaryCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e3a8a',
    marginBottom: 15,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e3a8a',
  },
  chartCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    alignItems: 'center',
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e3a8a',
    marginBottom: 15,
  },
  logsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
  },
  logsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  logsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e3a8a',
  },
  exportButton: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
  },
  exportButtonText: {
    color: '#1e3a8a',
    fontWeight: 'bold',
    fontSize: 14,
  },
  logItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  logRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  logDate: {
    fontSize: 14,
    color: '#666',
  },
  logStatus: {
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    fontWeight: 'bold',
  },
  approved: {
    backgroundColor: '#4caf50',
    color: 'white',
  },
  pending: {
    backgroundColor: '#ff9800',
    color: 'white',
  },
  logWorker: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  logWork: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  logAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e3a8a',
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
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  filterButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  filterOption: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    margin: 5,
  },
  activeFilter: {
    backgroundColor: '#FFD700',
  },
  filterOptionText: {
    color: '#666',
    fontWeight: 'bold',
  },
  activeFilterText: {
    color: '#1e3a8a',
  },
  factoryButtons: {
    marginBottom: 20,
  },
  factoryOption: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 10,
    marginVertical: 5,
    alignItems: 'center',
  },
  activeFactory: {
    backgroundColor: '#FFD700',
  },
  activeFactoryText: {
    color: '#1e3a8a',
    fontWeight: 'bold',
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
  applyButton: {
    backgroundColor: '#FFD700',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: 'bold',
  },
  applyButtonText: {
    color: '#1e3a8a',
    fontWeight: 'bold',
  },
});