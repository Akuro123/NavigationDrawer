import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Button, ScrollView, ActivityIndicator, TextInput, Alert } from 'react-native';
import QuizRepo from '../../repo/QuizRepo';

interface Answer {
  content: string;
  isCorrect: boolean;
}

interface Task {
  question: string;
  answers: Answer[];
  duration: number;
}

export default function Test2() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [isQuizCompleted, setIsQuizCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nick, setNick] = useState('');
  const [isNickEntered, setIsNickEntered] = useState(false);

  useEffect(() => {
    const fetchQuizByCategory = async () => {
      try {
        const quizzes = await QuizRepo.getAllTests();
        if (quizzes && quizzes.length > 0) {
          const selectedQuiz = quizzes.find((quiz: any) => quiz.tags.includes('elektronika','fizyka'));
          if (selectedQuiz) {
            const quizDetails = await QuizRepo.getTestDetails(selectedQuiz.id);
            if (quizDetails && quizDetails.tasks) {
              setTasks(quizDetails.tasks);
            } else {
              setError('Nie udało się załadować szczegółów quizu.');
            }
          } else {
            setError('Nie znaleziono quizu z określonej kategorii.');
          }
        } else {
          setError('Brak dostępnych quizów.');
        }
      } catch (err) {
        console.error(err);
        setError('Wystąpił problem z pobraniem quizu.');
      } finally {
        setLoading(false);
      }
    };

    fetchQuizByCategory();
  }, []);

  const handleAnswer = (isCorrect: boolean) => {
    if (isCorrect) {
      setScore(score + 1);
    }

    if (currentQuestionIndex + 1 < tasks.length) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setIsQuizCompleted(true);
      saveResult();
    }
  };

  const saveResult = async () => {
    try {
      const result = {
        nick,
        score,
        total: tasks.length,
        type: 'historia',
       
      };

      await QuizRepo.saveResult(result); 
      Alert.alert('Sukces!', 'Wynik został zapisany.');
    } catch (err) {
      console.error(err);
      Alert.alert('Błąd!', 'Nie udało się zapisać wyniku.');
    }
  };

  if (!isNickEntered) {
    return (
      <View style={styles.container}>
        <Text style={styles.questionText}>Podaj swój nick, aby rozpocząć quiz:</Text>
        <TextInput
          style={styles.input}
          placeholder="Wpisz nick"
          value={nick}
          onChangeText={setNick}
        />
        <Button
          title="Rozpocznij quiz"
          onPress={() => {
            if (nick.trim() === '') {
              Alert.alert('Błąd!', 'Nick nie może być pusty.');
            } else {
              setIsNickEntered(true);
            }
          }}
        />
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (isQuizCompleted) {
    return (
      <View style={styles.container}>
        <Text style={styles.questionText}>Quiz ukończony!</Text>
        <Text style={styles.timerText}>Twój wynik: {score} / {tasks.length}</Text>
        <Button
          title="Zacznij ponownie"
          onPress={() => {
            setCurrentQuestionIndex(0);
            setScore(0);
            setIsQuizCompleted(false);
            setIsNickEntered(false);
          }}
        />
      </View>
    );
  }

  const currentQuestion = tasks[currentQuestionIndex];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.questionSection}>
        <Text style={styles.questionText}>Pytanie {currentQuestionIndex + 1} z {tasks.length}</Text>
        <Text style={styles.timerText}>Czas: {currentQuestion.duration} sek</Text>

        <View style={styles.progressBarBackground}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${((currentQuestionIndex + 1) / tasks.length) * 100}%` },
            ]}
          />
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
    textAlign: 'center',
  },
  timerText: {
    fontSize: 16,
    marginVertical: 10,
    textAlign: 'center',
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
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
  },
});
