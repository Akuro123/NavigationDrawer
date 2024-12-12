import AsyncStorage from '@react-native-async-storage/async-storage'; 
import { Button, Text } from '@react-navigation/elements';
import { StyleSheet, View, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';

export function Home() {
  const navigation = useNavigation();
  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean | null>(null);

  useEffect(() => {
    const checkFirstLaunch = async () => {
      try {
        const hasLaunched = await AsyncStorage.getItem('hasLaunched');
       
        if (hasLaunched === null) {
          
          await AsyncStorage.setItem('hasLaunched', 'true');
          setIsFirstLaunch(true);
        } else {
          setIsFirstLaunch(false);
        }
      } catch (error) {
        console.error('Błąd podczas sprawdzania pierwszego uruchomienia:', error);
      }
    };

    checkFirstLaunch();
  }, []);

  if (isFirstLaunch === null) {
    
    return <Text>Loading...</Text>;
  }

  if (isFirstLaunch) {
    return (
      <View style={styles.container}>
        <Text style={styles.cardText}>Regulamin aplikacji</Text>
        <Button onPress={() => setIsFirstLaunch(false)}>Akceptuję</Button>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.cardText}>Test 1</Text>
        <Button onPress={() => navigation.navigate('Test1')}>Check!</Button>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardText}>Test 2</Text>
        <Button onPress={() => navigation.navigate('Test2')}>Check!</Button>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardText}>Test 3</Text>
        <Button onPress={() => navigation.navigate('Test3')}>Check!</Button>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardText}>Test 4</Text>
        <Button onPress={() => navigation.navigate('Test4')}>Check!</Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f8f8',
  },
  card: {
    width: '100%',
    maxWidth: 450,
    height: 130,
    marginBottom: 15,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  cardText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    textAlign: 'center',
  },
});
