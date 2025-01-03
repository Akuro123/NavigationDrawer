import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
} from 'react-native';
import QuizRepo from '../../repo/QuizRepo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

type Result = {
  nick: string;
  score: number;
  total: number;
  type: string;
  date: string;
};

export default function ResultsScreen() {
  const [results, setResults] = useState<Result[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected);
    });

    return () => unsubscribe();
  }, []);

  const fetchData = async () => {
    
    if (isOnline) {
      try {
        const data = await QuizRepo.getResults();
        if (data) {
          const mappedResults = data.map((item: any) => ({
            nick: item.nick,
            score: item.score,
            total: item.total,
            type: item.type,
            date: item.createdOn,
          }));
          setResults(mappedResults);

         
          await AsyncStorage.setItem('storage-results', JSON.stringify(mappedResults));
        }
      } catch (error) {
        console.error('Error fetching results:', error);
      }
    } else {
     
      const cachedResult = JSON.parse(await AsyncStorage.getItem('storage-results') || '[]');
      setResults(cachedResult);
    }
  };

  useEffect(() => {
    fetchData(); 
  }, [isOnline]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData().then(() => setRefreshing(false));
  }, [isOnline]);

  const renderItem = ({ item }: { item: Result }) => (
    <View style={styles.row}>
      <Text style={styles.cell}>{item.nick}</Text>
      <Text style={styles.cell}>{item.score}/{item.total}</Text>
      <Text style={styles.cell}>{item.type}</Text>
      <Text style={styles.cell}>{item.date}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={results}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListHeaderComponent={() => (
          <View style={styles.headerRow}>
            <Text style={styles.header}>Nick</Text>
            <Text style={styles.header}>Score</Text>
            <Text style={styles.header}>Type</Text>
            <Text style={styles.header}>Date</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
    paddingTop: 20,
    paddingHorizontal: 10,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#ddd',
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    width: '25%',
  },
  cell: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    width: '25%',
  },
});
