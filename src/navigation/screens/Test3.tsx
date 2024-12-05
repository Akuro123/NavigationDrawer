import React from 'react';
import { StyleSheet, View, Text, Button, ScrollView } from 'react-native';

export default function Test3() {
  const handleAnswer = (answer: string) => {
    console.log(`Wybrana odpowiedź: ${answer}`);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.questionSection}>
        <Text style={styles.questionText}>Pytanie 1 z 10</Text>
        <Text style={styles.timerText}>Czas: 28 sek</Text>

        <View style={styles.progressBarBackground}>
          <View style={[styles.progressBarFill, { width: '90%' }]} />
        </View>

        <Text style={styles.questionContent}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla quam velit, vulputate eu pharetra nec, mattis ac neque. Duis vulputate commodo ...
        </Text>
        <Text style={styles.loremText}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla quam velit, vulputate eu pharetra nec, mattis ac neque. Duis vulputate commodo ...
        </Text>
      </View>

      <View style={styles.buttonRow}>
        <View style={styles.buttonContainer}>
          <Button title="Odpowiedź A" onPress={() => handleAnswer('A')} />
        </View>
        <View style={styles.buttonContainer}>
          <Button title="Odpowiedź B" onPress={() => handleAnswer('B')} />
        </View>
      </View>

      <View style={styles.buttonRow}>
        <View style={styles.buttonContainer}>
          <Button title="Odpowiedź C" onPress={() => handleAnswer('C')} />
        </View>
        <View style={styles.buttonContainer}>
          <Button title="Odpowiedź D" onPress={() => handleAnswer('D')} />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f8f8',
  },
  questionSection: {
    marginBottom: 30,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
  },
  timerText: {
    fontSize: 16,
    marginVertical: 10,
  },
  progressBarBackground: {
    width: '100%',
    height: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    marginVertical: 10,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FFD700',
    borderRadius: 5,
  },
  questionContent: {
    fontSize: 16,
    fontWeight: '400',
    marginVertical: 15,
  },
  loremText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#555',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  buttonContainer: {
    width: '48%',
  },
});
