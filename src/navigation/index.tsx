import * as Network from "expo-network"; 
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator, DrawerContent, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { HeaderButton, Text } from '@react-navigation/elements';
import {
  createStaticNavigation,
  StaticParamList,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Button, Image, ScrollView, RefreshControl } from 'react-native';
import bell from '../assets/bell.png';
import newspaper from '../assets/newspaper.png';
import { Home } from './screens/Home';
import { Profile } from './screens/Profile';
import { Settings } from './screens/Settings';
import { Updates } from './screens/Updates';
import { NotFound } from './screens/NotFound';
import ResultsScreen from './screens/ResultsScreen';
import TestScreen from './screens/TestScreen';
import QuizRepo from '../repo/QuizRepo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import _ from 'lodash';
import React, { useState, useEffect } from 'react';


const setUpInitial = async () => {
  const [isConnectedToNetwork, setIsConnectedToNetwork] = useState<boolean | null>(null);
  await fetchAllDatabase();


  const unsubscribe = Network.addNetworkStateListener((state) => {
    if (state.isConnected !== isConnectedToNetwork) {
      setIsConnectedToNetwork(state.isConnected);
      if (!state.isConnected) {
        console.log('No network connection', 1000);
      } else {
        console.log('Connected to network', 1000);
      }
    }
  });

  return unsubscribe;
};

const fetchAllDatabase = async () => {
  try {
    const netInfo = await Network.getNetworkStateAsync(); 
    if (netInfo.isConnected) {
      const results = await QuizRepo.getResults();
      const tests = await QuizRepo.getAllTests();
      const testsDetails: Record<string, any> = {};

      for (let i = 0; i < tests.length; i++) {
        testsDetails[tests[i].id] = await QuizRepo.getTestDetails(tests[i].id);
      }

      await AsyncStorage.setItem('storage-results', JSON.stringify(results));
      await AsyncStorage.setItem('storage-tests', JSON.stringify(tests));
      await AsyncStorage.setItem('storage-tests-details', JSON.stringify(testsDetails));

      console.log('Data successfully saved to AsyncStorage.');
    } else {
      console.log('No internet connection. Using cached data.');
      const cachedTests = await AsyncStorage.getItem('storage-tests');
      if (cachedTests) {
        console.log('Loaded tests from cache.');
      } else {
        console.error('No cached tests available.');
      }
    }
  } catch (error) {
    console.error('Error fetching database:', error);
  }
};

const fetchRandomTests = async () => {
  try {
    const result = await QuizRepo.getAllTests();
    return _.shuffle(result); 
  } catch (error) {
    console.error('Error fetching tests from QuizRepo:', error);

    const cachedResult = await AsyncStorage.getItem('storage-tests');
    if (cachedResult) {
      return _.shuffle(JSON.parse(cachedResult)); 
    } else {
      throw new Error('No cached tests');
    }
  }
};

const getTestIdFromName = async (testName: string): Promise<string | undefined> => {
  try {
    const tests = await QuizRepo.getAllTests();
    const test = tests.find((test: any) => test.name === testName);
    if (test) {
      return test.id;
    } else {
      console.error('Test not found');
      return undefined;
    }
  } catch (error) {
   
    return undefined;
  }
};

const DrawerContentCustom = (props: any) => {
  const [testNames, setTestNames] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAndSetTestNames = async () => {
    try {
      const netInfo = await Network.getNetworkStateAsync(); 
      if (netInfo.isConnected) {
        const tests = await QuizRepo.getAllTests();
        const testNames = tests.map((test: any) => test.name);
        await AsyncStorage.setItem('storage-tests', JSON.stringify(tests));
        setTestNames(_.shuffle(testNames));
      } else {
       
        const cachedTests = await AsyncStorage.getItem('storage-tests');
        if (cachedTests) {
          const testNames = JSON.parse(cachedTests).map((test: any) => test.name);
          setTestNames(_.shuffle(testNames));
        } 
      }
    } catch (error) {
      
    }
  };

  const onRefresh = async (testName?: string) => {
    setRefreshing(true);
    try {
      let randomTest;

      if (testName) {
        const cachedTests = await AsyncStorage.getItem('storage-tests');
        if (cachedTests) {
          const tests = JSON.parse(cachedTests);
          const test = tests.find((test: any) => test.name === testName);

          if (test) {
            props.navigation.navigate('TestScreen', { item: test });
          } 
        } 
      } else {
        const cachedTests = await AsyncStorage.getItem('storage-tests');
        if (cachedTests) {
          const tests = JSON.parse(cachedTests);
          randomTest = _.shuffle(tests)[0];
          props.navigation.navigate('TestScreen', { item: randomTest });
        } 
      }

      await fetchAndSetTestNames();
    } catch (error) {
     
    }
    setRefreshing(false);
  };

  const handleTestSelection = async (name: string) => {
    try {
      const testId = await getTestIdFromName(name);
      let testDetails;
  
      if (testId) {
        try {
          testDetails = await QuizRepo.getTestDetails(testId);
        } catch (repoError) {
          console.error('Error fetching test details from QuizRepo:', repoError);
          const cachedTestsDetails = await AsyncStorage.getItem('storage-tests-details');
          if (cachedTestsDetails) {
            const parsedDetails = JSON.parse(cachedTestsDetails);
            testDetails = parsedDetails[testId];
          }
        }
      }
  
      if (testDetails) {
        props.navigation.navigate('TestScreen', { item: testDetails });
      } else {
        
      
        const cachedTests = await AsyncStorage.getItem('storage-tests');
        if (cachedTests) {
          const tests = JSON.parse(cachedTests);
          const test = tests.find((test: any) => test.name === name);
          if (test) {
            props.navigation.navigate('TestScreen', { item: test });
          } else {
            console.error('Test not found');
          }
        } else {
          console.error('No cached tests');
        }
      }
    } catch (error) {
      console.error('Error', error);
      const cachedTestsDetails = await AsyncStorage.getItem('storage-tests-details');
      if (cachedTestsDetails) {
        const parsedDetails = JSON.parse(cachedTestsDetails);
        props.navigation.navigate('TestScreen', { item: parsedDetails });
      } else {
        console.error('No cached data');
      }
    }
  };

  useEffect(() => {
    fetchAndSetTestNames();
  }, []);

  return (
    <DrawerContentScrollView {...props}>
      <DrawerItemList {...props} />
      <Button
        title="Fetch All Tests"
        onPress={async () => {
          try {
            await fetchAllDatabase();
            console.log('fetched');
            fetchAndSetTestNames();
          } catch (error) {
            console.error('Error', error);
            alert('Error');
          }
        }}
      />
      <Button
        title="Fetch Random Test"
        onPress={async () => {
          try {
            await fetchRandomTests();
          } catch (error) {
          
            alert('Error.');
          }
        }}
      />
      {testNames.length > 0 && (
        <>
          <Text style={{ margin: 10, fontWeight: 'bold' }}>Test Lists</Text>
          <ScrollView
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            {testNames.map((name, index) => (
              <Button
                key={index}
                title={name}
                onPress={() => handleTestSelection(name)}
              />
            ))}
          </ScrollView>
        </>
      )}
    </DrawerContentScrollView>
  );
};


const Drawer = createDrawerNavigator({
  screens: {
    Home: {
      screen: Home,
      options: {
        title: 'Home',
      },
    },
    ResultsScreen: {
      screen: ResultsScreen,
      options: ({ navigation }) => ({
        presentation: 'modal',
        headerRight: () => (
          <HeaderButton onPress={navigation.goBack}>
            <Text>Close</Text>
          </HeaderButton>
        ),
      }),
    },
    TestScreen: {
      screen: TestScreen,
      options: ({ navigation }) => ({
        presentation: 'modal',
        headerRight: () => (
          <HeaderButton onPress={navigation.goBack}>
            <Text>Close</Text>
          </HeaderButton>
        ),
      }),
    },
  },
  drawerContent: (props) => <DrawerContentCustom {...props} />,
});
const RootStack = createNativeStackNavigator({
  screens: {
    Drawer: {
      screen: Drawer,
      options: {
        headerShown: false, 
      },
    },
    Settings: {
      screen: Settings,
      options: ({ navigation }) => ({
        presentation: 'modal',
        headerRight: () => (
          <HeaderButton onPress={navigation.goBack}>
            <Text>Close</Text>
          </HeaderButton>
        ),
      }),
    },
    NotFound: {
      screen: NotFound,
      options: {
        title: '404',
      },
      linking: {
        path: '*',
      },
    },
  },
});

export const Navigation = createStaticNavigation(RootStack);

type RootStackParamList = StaticParamList<typeof RootStack>;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

