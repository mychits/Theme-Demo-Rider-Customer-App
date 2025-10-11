import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  StatusBar,
  SafeAreaView,
  Animated,
  Easing,
} from "react-native";
import { Ionicons, AntDesign } from "@expo/vector-icons";
import axios from "axios";
import { useRoute } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import url from "../../data/url";

const { width, height } = Dimensions.get("window");

// 🎨 Violet + Black Professional Theme
const Colors = {
  gradientStart: "#4B0082", // Deep indigo violet
  gradientEnd: "#000000", // Black for depth
  cardBackground: "rgba(255, 255, 255, 0.1)", // Glass effect
  white: "#FFFFFF",
  lightWhite: "rgba(255,255,255,0.85)",
  overlay: "rgba(0,0,0,0.6)",
  popupText: "#7A1CAC", // Accent violet for popup text
  shadow: "rgba(0,0,0,0.3)",
};

const Header = ({ userId, navigation }) => {
  const [userData, setUserData] = useState({
    full_name: "",
    phone_number: "",
  });
  const [showInfoPopup, setShowInfoPopup] = useState(false);
  const route = useRoute();

  const headerAnim = useRef(new Animated.Value(-height * 0.2)).current;

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (userId) {
          const response = await axios.get(`${url}/user/get-user-by-id/${userId}`);
          setUserData(response.data);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    fetchUserData();

    Animated.timing(headerAnim, {
      toValue: 0,
      duration: 800,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [userId]);

  const showBackButton = route.name !== "Home";

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.gradientStart} />
      <Animated.View
        style={[styles.animatedHeaderWrapper, { transform: [{ translateY: headerAnim }] }]}
      >
        <LinearGradient colors={[Colors.gradientStart, Colors.gradientEnd]} style={styles.headerGradient}>
          <View style={styles.headerContainer}>
            {/* Left Section: Back + Profile Card */}
            <View style={styles.leftContainer}>
              {showBackButton && (
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                  <Ionicons name="arrow-back" size={26} color={Colors.white} />
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.profileCard}
                activeOpacity={0.9}
                onPress={() =>
                  navigation.navigate("BottomTab", {
                    screen: "ProfileScreen",
                    params: { userId },
                  })
                }
              >
                <Image
                  source={require("../../../assets/profile (2).png")}
                  style={styles.profileImage}
                  resizeMode="cover"
                />
                <View>
                  <Text style={styles.profileName}>{userData.full_name || "Loading..."}</Text>
                  <Text style={styles.phoneNumber}>{userData.phone_number || "**********"}</Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Right: Info Button */}
            <TouchableOpacity
              onPress={() => setShowInfoPopup(true)}
              style={styles.infoIconContainer}
            >
              <AntDesign name="infocirlceo" size={24} color={Colors.white} />
            </TouchableOpacity>

            {/* Popup */}
            {showInfoPopup && (
              <TouchableOpacity
                style={styles.infoPopupOverlay}
                onPress={() => setShowInfoPopup(false)}
                activeOpacity={1}
              >
                <View style={styles.infoPopup}>
                  <TouchableOpacity
                    onPress={() => setShowInfoPopup(false)}
                    style={styles.closeButton}
                  >
                    <AntDesign name="closecircle" size={24} color={Colors.popupText} />
                  </TouchableOpacity>

                  <Image
                    source={require("../../../assets/CityChits.png")}
                    style={styles.popupImage}
                    resizeMode="contain"
                  />
                  <View style={styles.infoPopupTextContainer}>
                    <Text style={styles.mychitsText}>Demo Rider</Text>
                    <Text style={styles.customerAppText}>Customer App</Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}
          </View>
        </LinearGradient>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: Colors.gradientStart,
  },
  animatedHeaderWrapper: {
    zIndex: 10,
  },
  headerGradient: {
    paddingVertical: height * 0.012, // compact height
    paddingHorizontal: width * 0.045,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 8,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  leftContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    marginRight: width * 0.03,
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.cardBackground,
    paddingVertical: height * 0.007,
    paddingHorizontal: width * 0.035,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  profileImage: {
    width: width * 0.095,
    height: width * 0.095,
    borderRadius: width * 0.05,
    marginRight: width * 0.02,
    borderWidth: 1.5,
    borderColor: Colors.white,
  },
  profileName: {
    color: Colors.white,
    fontSize: width * 0.043,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  phoneNumber: {
    color: Colors.lightWhite,
    fontSize: width * 0.03,
    marginTop: height * 0.002,
  },
  infoIconContainer: {
    padding: width * 0.02,
  },

  // --- Popup Styles ---
  infoPopupOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width,
    height,
    backgroundColor: Colors.overlay,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
  },
  infoPopup: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    paddingVertical: height * 0.025,
    paddingHorizontal: width * 0.08,
    alignItems: "center",
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
    maxWidth: width * 0.8,
    position: "relative",
  },
  closeButton: {
    position: "absolute",
    top: height * 0.015,
    right: width * 0.03,
    zIndex: 1,
  },
  popupImage: {
    width: width * 0.45,
    height: width * 0.25,
    marginBottom: height * 0.02,
  },
  infoPopupTextContainer: {
    alignItems: "center",
  },
  mychitsText: {
    fontSize: width * 0.06,
    fontWeight: "800",
    color: Colors.popupText,
    textAlign: "center",
  },
  customerAppText: {
    fontSize: width * 0.04,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
    marginTop: height * 0.005,
  },
});

export default Header;
