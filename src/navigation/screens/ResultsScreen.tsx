import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

export default function ResultsScreen() {
  // Przykładowe dane
  const data = [
    { nick: 'Player1', point: 120, type: 'Type1', date: '2024-12-05' },
    { nick: 'Player2', point: 150, type: 'Type2', date: '2024-12-06' },
    { nick: 'Player3', point: 200, type: 'Type3', date: '2024-12-07' },
    { nick: 'Player4', point: 180, type: 'Type4', date: '2024-12-08' },
  ];

  return (
    <View style={styles.container}>
      {/* ScrollView pozwala na przewijanie tabeli w przypadku dużej ilości danych */}
      <ScrollView contentContainerStyle={styles.table}>
        {/* Nagłówki tabeli */}
        <View style={styles.row}>
          <Text style={styles.header}>Nick</Text>
          <Text style={styles.header}>Point</Text>
          <Text style={styles.header}>Type</Text>
          <Text style={styles.header}>Date</Text>
        </View>

        {/* Wiersze z danymi */}
        {data.map((item, index) => (
          <View key={index} style={styles.row}>
            <Text style={styles.cell}>{item.nick}</Text>
            <Text style={styles.cell}>{item.point}</Text>
            <Text style={styles.cell}>{item.type}</Text>
            <Text style={styles.cell}>{item.date}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7', // Jasne tło dla całej aplikacji
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  table: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderRadius: 8,
    elevation: 2, // Delikatny cień
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    width: '24%',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  cell: {
    fontSize: 14,
    color: '#555',
    width: '24%',
    textAlign: 'center',
  },
});
