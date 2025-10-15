
import React, { useEffect, useRef } from "react";
import { 
  View, 
  Image, 
  Text, 
  StyleSheet, 
  Dimensions, 
  Animated 
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
const { width, height } = Dimensions.get("window");
const FlashScreen = () => {
  const navigation = useNavigation();
  const fadeAnim = useRef(new Animated.Value(0)).current; // For fade-in effect
  const scaleAnim = useRef(new Animated.Value(0.8)).current; // For scaling effect
  useEffect(() => {
    // Start a parallel animation for fading in and scaling up the logo
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();
    const timer = setTimeout(() => {
      navigation.replace("Login");
    }, 2500);
    return () => clearTimeout(timer);
  }, [navigation, fadeAnim, scaleAnim]);
  return (
    <LinearGradient
      colors={["#6E30CF", "#BFA5EA"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <Animated.View 
        style={[
          styles.logoContainer,
          { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
        ]}
      >
        <Image
          source={require("../../assets/CityChits.png")}
          style={styles.image}
        />
        <Text style={styles.mainText}>Demo Rider</Text>
      </Animated.View>
    </LinearGradient>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    width,
    height,
    alignItems: "center",
    justifyContent: "center",
  },
  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: height * 0.1,
  },
  image: {
    width: width * 0.7,
    height: height * 0.5,
    resizeMode: "contain",
    marginBottom: 20,
  },
  mainText: {
    color: "#FFFFFF",
    fontSize: 36,
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: 1,
    textShadowColor: "rgba(0, 0, 0, 0.25)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
});
export default FlashScreen;