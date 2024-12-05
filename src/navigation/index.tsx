import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { HeaderButton, Text } from '@react-navigation/elements';
import {
  createStaticNavigation,
  StaticParamList,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Image } from 'react-native';
import bell from '../assets/bell.png';
import newspaper from '../assets/newspaper.png';
import { Home } from './screens/Home';
import { Profile } from './screens/Profile';
import { Settings } from './screens/Settings';
import { Updates } from './screens/Updates';
import { NotFound } from './screens/NotFound';
import Test1 from './screens/Test1';
import Test2 from './screens/Test2';
import Test3 from './screens/Test3';
import Test4 from './screens/Test4';
import ResultsScreen from './screens/ResultsScreen';


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
        presentation: "modal",
        headerRight: () => (
          <HeaderButton onPress={navigation.goBack}>
            <Text>Close</Text>
          </HeaderButton>
        ),
      }),
    },
    Test1: {
      screen: Test1,
      options: ({ navigation }) => ({
        presentation: "modal",
        title: "Test 1",
        headerRight: () => (
          <HeaderButton onPress={navigation.goBack}>
            <Text>Close</Text>
          </HeaderButton>
        ),
      }),
    },
    Test2: {
      screen: Test2,
      options: ({ navigation }) => ({
        presentation: "modal",
        title: "Test 2",
        headerRight: () => (
          <HeaderButton onPress={navigation.goBack}>
            <Text>Close</Text>
          </HeaderButton>
        ),
      }),
    },
    Test3: {
      screen: Test3,
      options: ({ navigation }) => ({
        presentation: "modal",
        title: "Test 3",
        headerRight: () => (
          <HeaderButton onPress={navigation.goBack}>
            <Text>Close</Text>
          </HeaderButton>
        ),
      }),
    },
    Test4: {
      screen: Test4,
      options: ({ navigation }) => ({
        presentation: "modal",
        title: "Test 4",
        headerRight: () => (
          <HeaderButton onPress={navigation.goBack}>
            <Text>Close</Text>
          </HeaderButton>
        ),
      }),
    },
  },
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
