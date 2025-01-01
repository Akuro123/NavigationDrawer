import React, { useEffect, useState } from "react";
import {
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useFonts } from "expo-font";
import QuizRepo from "../../repo/QuizRepo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo"; 
import _ from "lodash";

interface Test {
  id: string;
  name: string;
  description: string;
  tags: string[];
  level: string;
}

export function Home(props: any) {
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [fontsLoaded] = useFonts({
    "Montserrat-Light": require("../../assets/fonts/Montserrat-Light.ttf"),
    "OpenSans_Condensed-BoldItalic": require("../../assets/fonts/OpenSans_Condensed-BoldItalic.ttf"),
  });

  const navigation = useNavigation(); 

  useEffect(() => {
    const fetchTests = async () => {
      setLoading(true);
      try {
        const netInfo = await NetInfo.fetch();
        if (netInfo.isConnected) {
          const data = await QuizRepo.getAllTests(); // Make sure this returns a proper array
          if (data && Array.isArray(data)) {
            const shuffledData = _.shuffle(data); // Shuffle only if data is an array
            setTests(shuffledData);
            await AsyncStorage.setItem("tests", JSON.stringify(shuffledData));
          } else {
            console.error("Invalid data format", data);
          }
        } else {
          const storedTests = await AsyncStorage.getItem("tests");
          if (storedTests) {
            setTests(JSON.parse(storedTests));
          } else {
            console.error("No internet connection and no data in AsyncStorage.");
          }
        }
      } catch (error) {
        console.error("Błąd podczas pobierania testów:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTests();
  }, []);

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

  const onRefresh = async (testName?: string) => {
    setRefreshing(true);
    try {
      if (testName) {
        const testId = await getTestIdFromName(testName);
        if (testId) {
          const testDetails = await QuizRepo.getTestDetails(testId);
          navigation.navigate('TestScreen', { item: testDetails });
        } else {
          console.error('Test not found');
        }
      } 
    } catch (error) {
      console.error('Error during refresh:', error);
    } finally {
      setRefreshing(false);
    }
  };
  const checkAsyncStorage = async () => {
    try {
      const storedTests = await AsyncStorage.getItem('tests');
      if (storedTests) {
        const parsedTests = JSON.parse(storedTests);
        
    
        const firstThreeTests = parsedTests.slice(0, 1);
        
        console.log('Zapisane w AsyncStorage', firstThreeTests);
      } else {
        console.log('Brak  w AsyncStorage.');
      }
    } catch (error) {
      console.error('Błąd  AsyncStorage:', error);
    }
  };
  
  
 
  checkAsyncStorage();

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContainer}>
        <View style={styles.tileContainer}>
          {tests.map((test) => (
            <TouchableOpacity
              key={test.id}
              style={styles.tile}
              onPress={() => onRefresh(test.name)} 
            >
              <Text style={styles.tileTitle}>{test.name}</Text>
              <View style={styles.tags}>
                {test.tags.map((tag, index) => (
                  <Text key={index} style={styles.tag}>
                    #{tag}
                  </Text>
                ))}
              </View>
              <Text style={styles.description}>{test.description}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    backgroundColor: "#FFFFFF",
  },
  scrollViewContainer: {
    flexGrow: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    paddingBottom: 50,
  },
  tileContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    width: "100%",
    marginVertical: 20,
  },
  tile: {
    padding: 20,
    margin: 10,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    width: "80%",
    height: 180,
    alignItems: "flex-start",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    fontFamily: "Montserrat-Light",
  },
  tileTitle: {
    fontSize: 15,
    color: "#333333",
    marginBottom: 5,
    fontFamily: "Montserrat-Light",
  },
  tags: {
    flexDirection: "row",
    justifyContent: "flex-start",
    flexWrap: "wrap",
    marginTop: 5,
  },
  tag: {
    backgroundColor: "#F0F0F0",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    fontSize: 12,
    margin: 3,
    color: "#555555",
    fontFamily: "OpenSans_Condensed-BoldItalic",
  },
  description: {
    fontSize: 14,
    color: "#666666",
    marginTop: 10,
    fontFamily: "OpenSans_Condensed-BoldItalic",
    lineHeight: 20,
  },
});
