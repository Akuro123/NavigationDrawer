import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator, DrawerContent, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import {HeaderButton, Text } from '@react-navigation/elements';
import {
  createStaticNavigation,
  StaticParamList,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Button, Image,ScrollView,RefreshControl} from 'react-native';
import bell from '../assets/bell.png';
import newspaper from '../assets/newspaper.png';
import { Home } from './screens/Home';
import { Profile } from './screens/Profile';
import { Settings } from './screens/Settings';
import { Updates } from './screens/Updates';
import { NotFound } from './screens/NotFound';
import NetInfo from "@react-native-community/netinfo";
import ResultsScreen from './screens/ResultsScreen';
import TestScreen from './screens/TestScreen';
import QuizRepo from '../repo/QuizRepo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import _ from 'lodash';
import React from 'react';

import { useState ,useEffect } from 'react';



const setUpInitial = async () => {

  const [isConnectedToNetwork, setIsConnectedToNetwork] = useState<boolean | null>(null);
  await fetchAllDatabase();

  const unsubscribe = NetInfo.addEventListener(state => {
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
    const netInfo = await NetInfo.fetch();
    if (netInfo.isConnected) {
      const results = await QuizRepo.getResults();
      const tests = await QuizRepo.getAllTests();
      const testsDetails: Record<string, any> = {};

      for (let i = 0; i < tests.length; i++) {
        testsDetails[tests[i].id] = await QuizRepo.getTestDetails(tests[i].id);
      }

      await AsyncStorage.setItem('storage-results', JSON.stringify(results));
      await AsyncStorage.setItem('storage-tests', JSON.stringify(tests));
      await AsyncStorage.setItem(
        'storage-tests-details',
        JSON.stringify(testsDetails),
      );

      console.log('Data successfully saved to AsyncStorage.');
    } else {
      console.log('No internet connection. Using cached data.');
    }
  } catch (error) {
    console.error('Error fetching database:', error);
  }
};



const fetchRandomTests = async () => {
  try {

    const result = await QuizRepo.getAllTests();
    return _.shuffle(result)[0]; 
  } catch (error) {
    console.error('Error fetching tests from QuizRepo:', error);

  
    const cachedResult = await AsyncStorage.getItem('storage-tests');
    if (cachedResult) {
      return _.shuffle(JSON.parse(cachedResult))[0]; 
    } else {
      throw new Error('No cached tests available.');
    }
  }
};
const getRandomTest = async (props: any) => {
  const test = await fetchRandomTests();
  props.navigation.navigate('TestScreen', { item: test }); 
}
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
    console.error('Error fetching tests:', error);
    return undefined;
  }
};







const DrawerContentCustom = (props: any) => {
  const [testNames, setTestNames] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false); 

  const fetchAndSetTestNames = async () => {
    try {
      const netInfo = await NetInfo.fetch();
      if (netInfo.isConnected) {
        const tests = await QuizRepo.getAllTests();
        const testNames = tests.map((test: any) => test.name);
        await AsyncStorage.setItem('storage-tests', JSON.stringify(tests));
        setTestNames(_.shuffle(testNames));
      } else {
        console.log('No internet. Loading test names from cache.');
        const cachedTests = await AsyncStorage.getItem('storage-tests');
        if (cachedTests) {
          const testNames = JSON.parse(cachedTests).map((test: any) => test.name);
          setTestNames(_.shuffle(testNames));
        } else {
          console.error('No cached test names available.');
        }
      }
    } catch (error) {
      console.error('Error fetching test names:', error);
    }
  };

  const fetchRandomTests = async () => {
    try {
      const result = await QuizRepo.getAllTests();
      return _.shuffle(result)[0];  
    } catch (error) {
      console.error('Error fetching tests from QuizRepo:', error);
  
      const cachedResult = await AsyncStorage.getItem('storage-tests');
      if (cachedResult) {
        return _.shuffle(JSON.parse(cachedResult))[0]; 
      } else {
        throw new Error('No cached tests available.');
      }
    }
  };


  const onRefresh = async (testName?: string) => {
    setRefreshing(true);
    try {
      let randomTest;
      if (testName) {
       
        const testId = await getTestIdFromName(testName);
        if (testId) {
          const testDetails = await QuizRepo.getTestDetails(testId);
          props.navigation.navigate('TestScreen', { item: testDetails });
        } else {
          console.error('Test not found');
        }
      } else {
        randomTest = await fetchRandomTests();
        props.navigation.navigate('TestScreen', { item: randomTest });
      }
      
      await fetchAndSetTestNames();
    } catch (error) {
      console.error('Error refreshing test:', error);
    }
    setRefreshing(false);
  };
  
  useEffect(() => {
    fetchAndSetTestNames();
    setUpInitial();
  }, []);

  return (
    <DrawerContentScrollView {...props}>
      <DrawerItemList {...props} />
      <Button
        title="Fetch All Tests"
        onPress={async () => {
          try {
        
            await fetchAllDatabase();
            console.log('All tests fetched and saved.');
            fetchAndSetTestNames();
          } catch (error) {
            console.error('Error fetching tests:', error);
          }
        }}
      />
      <Button
        title="Fetch Random Test"
        onPress={async () => {
          try {
         
            await getRandomTest(props);
          } catch (error) {
            console.error('Error fetching random test:', error);
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
    onPress={async () => {
      try {
        // Pobranie ID testu na podstawie jego nazwy
        const testId = await getTestIdFromName(name);
        
        // Jeśli test ID zostało znalezione, przejdź do ekranu z testem
        if (testId) {
          const testDetails = await QuizRepo.getTestDetails(testId);
          props.navigation.navigate('TestScreen', { item: testDetails });
        } else {
          console.error('Test not found');
        }
      } catch (error) {
        console.error('Error fetching test details:', error);
      }
    }}
  />
))}
          </ScrollView>
        </>
      )}
    </DrawerContentScrollView>
  );
}

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
