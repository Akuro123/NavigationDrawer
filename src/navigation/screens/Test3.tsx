import React, { useState } from 'react';
import { StyleSheet, View, Text, Button, ScrollView } from 'react-native';
import tasks from './questions';

interface Answer {
  content: string;
  isCorrect: boolean;
}

interface Task {
  question: string;
  answers: Answer[];
  duration: number;
}

export default function Test3() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [isQuizCompleted, setIsQuizCompleted] = useState(false);

  const currentQuestion = tasks[currentQuestionIndex] as Task;

  const handleAnswer = (isCorrect: boolean) => {
    if (isCorrect) {
      setScore(score + 1);
    }

    if (currentQuestionIndex + 1 < tasks.length) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setIsQuizCompleted(true);
    }
  };

  if (isQuizCompleted) {
    return (
      <View style={styles.container}>
        <Text style={styles.questionText}>Quiz ukończony!</Text>
        <Text style={styles.timerText}>Twój wynik: {score} / {tasks.length}</Text>
        <Button title="Zacznij ponownie" onPress={() => {
          setCurrentQuestionIndex(0);
          setScore(0);
          setIsQuizCompleted(false);
        }} />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.questionSection}>
        <Text style={styles.questionText}>Pytanie {currentQuestionIndex + 1} z {tasks.length}</Text>
        <Text style={styles.timerText}>Czas: {currentQuestion.duration} sek</Text>

        <View style={styles.progressBarBackground}>
          <View style={[styles.progressBarFill, { width: `${((currentQuestionIndex + 1) / tasks.length) * 100}%` }]} />
        </View>

        <Text style={styles.questionContent}>{currentQuestion.question}</Text>
      </View>

      <View style={styles.buttonRow}>
        {currentQuestion.answers.map((answer, index) => (
          <View key={index} style={styles.buttonContainerHalf}>
            <Button title={answer.content} onPress={() => handleAnswer(answer.isCorrect)} />
          </View>
        ))}
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
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  buttonContainerHalf: {
    width: '48%',
    marginVertical: 5,
  },
});