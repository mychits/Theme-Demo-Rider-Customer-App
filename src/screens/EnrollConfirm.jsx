import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ActivityIndicator,
  SafeAreaView,
  Platform,
  StatusBar,
  Dimensions,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import Header from "../components/layouts/Header";
import { NetworkContext } from "../context/NetworkProvider";
import Toast from "react-native-toast-message";
import { ContextProvider } from "../context/UserProvider";

const { width, height } = Dimensions.get("window");

// Single confetti piece component
const Confetti = ({ startX, color, delay }) => {
  const translateY = useState(new Animated.Value(-50))[0];
  const rotate = useState(new Animated.Value(0))[0];

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: height + 50,
            duration: 3000 + Math.random() * 2000,
            useNativeDriver: true,
          }),
          Animated.timing(rotate, {
            toValue: 1,
            duration: 3000 + Math.random() * 2000,
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(translateY, {
          toValue: -50,
          duration: 0,
          useNativeDriver: true,
        }),
        Animated.timing(rotate, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const rotation = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <Animated.View
      style={{
        width: 10,
        height: 20,
        backgroundColor: color,
        position: "absolute",
        top: 0,
        left: startX,
        borderRadius: 2,
        transform: [{ translateY }, { rotate: rotation }],
        opacity: 0.9,
      }}
    />
  );
};

const EnrollConfirm = ({ navigation, route }) => {
  const { group_name, tickets } = route?.params || {};
  const [appUser] = useContext(ContextProvider);
  const userId = appUser?.userId || null;
  const [scaleValue] = useState(new Animated.Value(0));
  const [showConfetti, setShowConfetti] = useState(false);

  const { isConnected, isInternetReachable } = useContext(NetworkContext);

  useEffect(() => {
    Animated.spring(scaleValue, {
      toValue: 1,
      friction: 3,
      tension: 200,
      useNativeDriver: true,
    }).start(() => setShowConfetti(true));

    if (!isConnected || !isInternetReachable) {
      Toast.show({
        type: "info",
        text1: "Offline Mode",
        text2: "Some features might be limited without internet.",
        position: "bottom",
        visibilityTime: 3000,
      });
    }
  }, [scaleValue, isConnected, isInternetReachable]);

  const handleGoToMyGroups = () => {
    if (!userId) {
      Toast.show({
        type: "error",
        text1: "Navigation Error",
        text2: "User ID is missing. Cannot navigate to My Groups.",
        position: "bottom",
        visibilityTime: 3000,
      });
      return;
    }
    navigation.navigate("BottomTab", {
      screen: "PaymentScreen",
      params: { userId },
    });
  };

  if (!userId) {
    return (
      <SafeAreaView style={styles.loadingScreen}>
        <ActivityIndicator size="large" color="#8A2BE2" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Status bar color */}
      <StatusBar translucent backgroundColor="#8A2BE2" barStyle="light-content" />

      {/* Spacer to push header below status bar */}
      <View style={styles.statusBarSpacer} />

      {/* Header */}
      <View style={styles.headerContainer}>
        <Header userId={userId} navigation={navigation} />
      </View>

      {/* Main content */}
      <View style={styles.mainContentWrapper}>
        <View style={styles.contentCard}>
          <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
            <AntDesign name="checkcircle" size={100} color="green" />
          </Animated.View>

          <Text style={styles.congratulationsText}>
            Congratulations! You successfully enrolled for{" "}
            <Text style={styles.groupName}>{group_name}</Text> with {tickets} tickets.
          </Text>

          <Text style={styles.activationText}>Account will be activated soon.</Text>

          {!isConnected && (
            <Text style={styles.offlineIndicator}>You are currently offline.</Text>
          )}

          <TouchableOpacity style={styles.button} onPress={handleGoToMyGroups}>
            <Text style={styles.buttonText}>Go to My Groups</Text>
          </TouchableOpacity>
        </View>

        {/* Confetti celebration */}
        {showConfetti &&
          Array.from({ length: 25 }).map((_, i) => {
            const startX = Math.random() * width;
            const colors = ["#FF3C38", "#FFDA38", "#38FF90", "#386BFF", "#DA38FF"];
            const color = colors[Math.floor(Math.random() * colors.length)];
            const delay = Math.random() * 500;
            return <Confetti key={i} startX={startX} color={color} delay={delay} />;
          })}
      </View>

      <Toast />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#8A2BE2" },
  statusBarSpacer: {
    height: Platform.OS === "android" ? StatusBar.currentHeight : 40,
    backgroundColor: "#8A2BE2",
  },
  headerContainer: {
    backgroundColor: "#8A2BE2",
    paddingBottom: 5,
  },
  mainContentWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
  },
  contentCard: {
    flex: 0,
    backgroundColor: "#fff",
    width: "95%",
    borderRadius: 10,
    padding: 15,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  congratulationsText: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 10,
    color: "#000",
  },
  groupName: {
    color: "#8A2BE2",
  },
  activationText: {
    fontSize: 16,
    textAlign: "center",
    color: "#666",
    marginBottom: 20,
  },
  offlineIndicator: {
    fontSize: 14,
    color: "orange",
    marginTop: 10,
    marginBottom: 10,
    textAlign: "center",
    fontWeight: "bold",
  },
  button: {
    backgroundColor: "#8A2BE2",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  loadingScreen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
  },
});

export default EnrollConfirm;
