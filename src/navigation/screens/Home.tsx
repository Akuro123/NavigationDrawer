import React, { useEffect, useState, useCallback } from "react";
import {
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useFonts } from "expo-font";
import QuizRepo from "../../repo/QuizRepo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Network from "expo-network";
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
  const [isConnected, setIsConnected] = useState<boolean | undefined>(true);  
  const [fontsLoaded] = useFonts({
    "Montserrat-Light": require("../../assets/fonts/Montserrat-Light.ttf"),
    "OpenSans_Condensed-BoldItalic": require("../../assets/fonts/OpenSans_Condensed-BoldItalic.ttf"),
  });

  const navigation = useNavigation();

  useEffect(() => {
    const fetchNetworkStatus = async () => {
      const isOnline = await Network.isConnected();
      setIsConnected(isOnline); 
    };
    fetchNetworkStatus();
  }, []);

  const fetchTests = async () => {
    setLoading(true);
    try {
      if (!isConnected) {
        const storedTests = await AsyncStorage.getItem("storage-tests");
        if (storedTests) {
          const parsedTests = JSON.parse(storedTests);
          console.log("Tests loaded from AsyncStorage:", parsedTests);
          setTests(_.shuffle(parsedTests));  
        } else {
          console.error("No data in AsyncStorage.");
        }
      } else {
        const today = new Date().toISOString().split("T")[0];
        const lastFetchDate = await AsyncStorage.getItem("last-fetch-date");
        console.log(lastFetchDate);
  
        if (lastFetchDate !== today) {
          const data = await QuizRepo.getAllTests();
          if (data && Array.isArray(data)) {
            const shuffledData = _.shuffle(data);  
            console.log("Fetched tests:", shuffledData);
            setTests(shuffledData);
            await AsyncStorage.setItem("storage-tests", JSON.stringify(shuffledData)); 
            await AsyncStorage.setItem("last-fetch-date", today); 
          } else {
            console.error("Invalid data format", data);
          }
        } else {
          const storedTests = await AsyncStorage.getItem("storage-tests");
          if (storedTests) {
            const parsedTests = JSON.parse(storedTests);
            console.log("Tests loaded from AsyncStorage:", parsedTests);
            setTests(_.shuffle(parsedTests));  
          }
        }
      }
    } catch (error) {
      console.error("Error fetching tests:", error);
    } finally {
      setLoading(false);
    }
  };
  
  

  useEffect(() => {
    fetchTests();
  }, [isConnected]);


  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTests().finally(() => setRefreshing(false)); 
  }, [isConnected]); 

  const navigateToTest = async (test: Test) => {
    if (!isConnected) {
   
      const storedTests = await AsyncStorage.getItem("storage-tests");
      if (storedTests) {
        const parsedTests = JSON.parse(storedTests);
        const selectedTest = parsedTests.find((t: Test) => t.name === test.name);
        if (selectedTest) {
          console.log("Test found in AsyncStorage:", selectedTest);
          navigation.navigate("TestScreen", { item: selectedTest });
        } else {
          console.error("Test not found in AsyncStorage.");
        }
      }
    } else {
      
      navigation.navigate("TestScreen", { item: test });
    }
  };
  
  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollViewContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.tileContainer}>
          {tests.map((test) => (
            <TouchableOpacity
              key={test.id}
              style={styles.tile}
              onPress={() => navigateToTest(test)}
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
