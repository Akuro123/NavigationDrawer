import React, { useEffect, useState } from 'react';
import {
  View,
  FlatList,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Button,
} from 'react-native';
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Network from "expo-network";
import QuizRepo from '../../repo/QuizRepo';
import _, { result } from 'lodash';
import { Text, HeaderButton } from '@react-navigation/elements';

const wait = (timeout: number) => new Promise((resolve) => setTimeout(resolve, timeout));

const TestScreen = (props: any) => {
  const [currentQuiz, setCurrentQuiz] = useState<any>(props.route?.params?.item);
  const [currentQuestion, setCurrentQuestion] = useState<any>();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [points, setPoints] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [correctAnswer, setCorrectAnswer] = useState<string | null>(null);
  const [seconds, setSeconds] = useState<number>(30);
  const [quizData, setQuizData] = useState<any[]>([]);
  const [isEnd, setIsEnd] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasSentResult, setHasSentResult] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const navigation = useNavigation();

  const resetState = () => {
    setCurrentQuiz(null);
    setCurrentQuestionIndex(0);
    setPoints(0);
    setSeconds(30);
    setQuizData([]);
    setIsEnd(false);
    setHasSentResult(false);

    const newQuiz = props.route?.params?.item;
    setCurrentQuiz(newQuiz);
  };

  const fetchTestDetails = async () => {
    try {
      if (isConnected) {
        const details = await QuizRepo.getTestDetails(currentQuiz.id);
        if (details) {
          details.tasks = _.shuffle(details.tasks);
          setQuizData(details.tasks);
          setCurrentQuestion({ ...details.tasks[0], answers: _.shuffle(details.tasks[0].answers) });
          setSeconds(details.tasks[0].duration);

          
          const cachedData = await AsyncStorage.getItem('storage-tests-details') || '{}';
          const updatedCache = { ...JSON.parse(cachedData), [currentQuiz.id]: details };
          await AsyncStorage.setItem('storage-tests-details', JSON.stringify(updatedCache));
        }
      } else {
      
        const cachedData = await AsyncStorage.getItem('storage-tests-details');
        if (cachedData) {
          const offlineDetails = JSON.parse(cachedData)[currentQuiz.id];
          offlineDetails.tasks = _.shuffle(offlineDetails.tasks);
          setQuizData(offlineDetails.tasks);
          setCurrentQuestion({
            ...offlineDetails.tasks[0],
            answers: _.shuffle(offlineDetails.tasks[0].answers),
          });
          setSeconds(offlineDetails.tasks[0].duration);
        }
      }
    } catch (error) {
      console.error('Error fetching test details:', error);
    }
    setIsLoading(false);
  };

  const checkInternetConnection = async () => {
    try {
      const state = await Network.getNetworkStateAsync();
      setIsConnected(state.isConnected);
    } catch (error) {
      console.error('Error checking internet connection:', error);
      setIsConnected(false);
    }
  };

  const handleNextQuestion = async (answer?: any) => {
    if (!currentQuestion) return;

    setCorrectAnswer(currentQuestion.answers.find((a: any) => a.isCorrect)?.content || null);
    if (answer?.isCorrect) setPoints((prev) => prev + 1);
    setSelectedAnswer(answer?.content || null);

    await wait(500);

    if (currentQuestionIndex + 1 < quizData.length) {
      const nextQuestion = quizData[currentQuestionIndex + 1];
      setCurrentQuestionIndex((prev) => prev + 1);
      setCurrentQuestion({ ...nextQuestion, answers: _.shuffle(nextQuestion.answers) });
      setSeconds(nextQuestion.duration);
    } else {
      setIsEnd(true);
    }

    setSelectedAnswer(null);
    setCorrectAnswer(null);
  };

  const saveOfflineResults = async () => {
    const offlineResults = {
      quizId: currentQuiz?.id,
      points,
      total: quizData.length,
      timestamp: new Date().toISOString(),
    };

    try {
      const existingResults = await AsyncStorage.getItem('offline-quiz-results');
      const results = existingResults ? JSON.parse(existingResults) : [];
      results.push(offlineResults);
      await AsyncStorage.setItem('offline-quiz-results', JSON.stringify(results));
    } catch (error) {
      console.error(error);
    }
  };

  const sendQuizResult = async () => {
    await QuizRepo.saveResults({
      nick: 'fistaszek',
      score: points,
      total: quizData.length,
      type: currentQuiz.tags?.join(',') || 'General',
    });
  };

  const handleSubmitResults = async () => {
    await saveOfflineResults();
    if (isConnected) {
      await sendQuizResult();
    }
  };

  useEffect(() => {
    checkInternetConnection();
  }, []);

  useEffect(() => {
    if (currentQuiz?.id) {
      fetchTestDetails();
    }
  }, [currentQuiz]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (seconds > 0) setSeconds((prev) => prev - 1);
      else handleNextQuestion();
    }, 1000);

    return () => clearInterval(interval);
  }, [seconds]);

  if (isLoading) return <ActivityIndicator size="large" />;
  if (!isConnected) {
    if (isEnd && !hasSentResult) saveOfflineResults();
    return (
      <View style={styles.container}>
        <Text style={styles.error}>Brak połączenia z Internetem </Text>
        <Text>
          Question {currentQuestionIndex + 1} of {quizData.length}
        </Text>
        <Text>Time Remaining: {seconds} seconds</Text>
        <Text style={styles.questionText}>{currentQuestion?.question}</Text>
        <FlatList
          data={currentQuestion?.answers || []}
          keyExtractor={(item, index) => `${item.content}-${index}`}
          renderItem={({ item }) => (
            <Pressable
              style={[
                styles.answer,
                item.content === correctAnswer && styles.correctAnswer,
                item.content === selectedAnswer && styles.selectedAnswer,
              ]}
              onPress={() => handleNextQuestion(item)}
            >
              <Text>{item.content}</Text>
            </Pressable>
          )}
        />
      </View>
    );
  }

  if (isEnd)
    return (
      <View style={styles.centered}>
        <Text style={styles.endText}>Quiz Finished!</Text>
        <Text style={styles.scoreText}>
          Your Score: {points}/{quizData.length} ({((points / quizData.length) * 100).toFixed(2)}%)
        </Text>
        <Button title="Submit Results" onPress={handleSubmitResults} />
        <View style={styles.buttonSpacer} />
        <HeaderButton
          onPress={() => {
            resetState();
            navigation.navigate('Home');
          }}
        >
          <Text>Go Home</Text>
        </HeaderButton>
      </View>
    );
  

  return (
    <View style={styles.container}>
      <Text>
        Question {currentQuestionIndex + 1} of {quizData.length}
      </Text>
      <Text>Time Remaining: {seconds} seconds</Text>
      <Text style={styles.questionText}>{currentQuestion?.question}</Text>
      <FlatList
        data={currentQuestion?.answers || []}
        keyExtractor={(item, index) => `${item.content}-${index}`}
        renderItem={({ item }) => (
          <Pressable
            style={[
              styles.answer,
              item.content === correctAnswer && styles.correctAnswer,
              item.content === selectedAnswer && styles.selectedAnswer,
            ]}
            onPress={() => handleNextQuestion(item)}
          >
            <Text>{item.content}</Text>
          </Pressable>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  questionText: { fontSize: 18, marginVertical: 20 },
  answer: {
    padding: 15,
    marginVertical: 5,
    borderWidth: 1,
    borderRadius: 5,
  },
  correctAnswer: { backgroundColor: 'green' },
  selectedAnswer: { backgroundColor: 'red' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  endText: { fontSize: 24, fontWeight: 'bold' },
  error: { color: 'red', textAlign: 'center', marginTop: 20 },
  scoreText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  feedbackText: {
    fontSize: 16,
    color: 'gray',
    marginVertical: 10,
    textAlign: 'center',
  },
  buttonSpacer: {
    marginVertical: 20, 
  },
  
});

export default TestScreen;

