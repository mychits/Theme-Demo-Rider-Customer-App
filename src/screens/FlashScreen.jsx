import React, { useEffect } from "react";
import { View, Image, Text, StyleSheet, Dimensions } from "react-native";
import { useNavigation } from "@react-navigation/native";

const { width, height } = Dimensions.get("window");

const FlashScreen = () => {
  const navigation = useNavigation();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace("Login");
    }, 2500);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.imageTextContainer}>
        <Image
          source={require("../../assets/CityChits.png")}
          style={styles.image}
        />
        <Text style={styles.mainText}>Demo Rider</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: width,
    height: height,
    backgroundColor: "#6E30CF",
    alignItems: "center",
    justifyContent: "center",
  },
  imageTextContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: height * 0.2,
  },
  image: {
    width: 400,
    height: 600,
    resizeMode: "contain",
  },
  mainText: {
    color: "#FFFFFF",
    fontSize: 36,
    fontWeight: "700",
    textAlign: "center",
    fontFamily: "Roboto",
    letterSpacing: 1,
  },
});

export default FlashScreen;
