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

interface Test {
  id: string;
  name: string;
  description: string;
  tags: string[];
  level: string;
}

export function Home() {
  const navigation = useNavigation();
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [fontsLoaded] = useFonts({
    "Montserrat-Light": require("../../assets/fonts/Montserrat-Light.ttf"),
    "OpenSans_Condensed-BoldItalic": require("../../assets/fonts/OpenSans_Condensed-BoldItalic.ttf"),
  });

  useEffect(() => {
    const fetchTests = async () => {
      setLoading(true);
      try {
        const data = await QuizRepo.getAllTests();
        if (data) {
          setTests(data);
        }
      } catch (error) {
        console.error("Błąd podczas pobierania testów:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTests();
  }, []);

  const navigateToTest = (testId: string) => {
    switch (testId) {
      case "62032610069ef9b2616c761e":
        navigation.navigate("Test1" as never);
        break;
      case "62032610069ef9b2616c761c":
        navigation.navigate("Test2" as never);
        break;
      case "62032610069ef9b2616c761d":
        navigation.navigate("Test3" as never);
        break;
      case "62032610069ef9b2616c761b":
        navigation.navigate("Test4" as never);
        break;
      default:
        console.warn("Nieznany test ID:", testId);
    }
  };

  if (!fontsLoaded) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContainer}>
        <View style={styles.tileContainer}>
          {tests.map((test) => (
            <TouchableOpacity
              key={test.id}
              style={styles.tile}
              onPress={() => navigateToTest(test.id)}
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
