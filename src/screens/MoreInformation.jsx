
import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Linking, // For opening URLs
  Platform, // For platform-specific styles
  Dimensions, // To make styles responsive
  Alert, // Using Alert instead of console.log for user feedback
} from "react-native";
import { LinearGradient } from "expo-linear-gradient"; // Import LinearGradient for gradient backgrounds
import { MaterialIcons, FontAwesome } from "@expo/vector-icons"; // Import icons
import { NetworkContext } from "../context/NetworkProvider"; // Assuming this context exists
import Header from "../components/layouts/Header"; // Import the Header component
import { useSafeAreaInsets } from "react-native-safe-area-context"; // To handle safe area insets
import { ContextProvider } from "../context/UserProvider";
const { width, height } = Dimensions.get("window");
// Violet-themed colors configuration
const Colors = {
  primaryViolet: "#6A0DAD", // Main violet tone for primary elements
  secondaryViolet: "#8E44AD", // Secondary violet shade
  // Optionally, if you want to keep a contrasting accent for support actions,
  // you might change accentGreen. Here, all buttons use the violet theme.
  accentGreen: "#6A0DAD", // Overriding with violet tone for consistency
  accentOrange: "#FFA000", // Warm orange can remain for accents if needed
  backgroundLight: "#F3F0FF", // A very light violet background for the overall screen
  cardBackground: "#FFFFFF", // White for card elements
  textDark: "#2C3E50", // Dark grey for primary text
  textMedium: "#7F8C8D", // Medium grey for secondary text
  textLight: "#BDC3C7", // Light grey for subtle labels
  buttonPrimary: "#6A0DAD", // Violet for primary buttons
  buttonSecondary: "#95A5A6",
  dangerRed: "#E74C3C",
  successGreen: "#2ECC71",
  linkBlue: "#6A0DAD", // Violet for hyperlinks
  gradientStart: "#6A0DAD", // Gradient start color in violet
  gradientEnd: "#8E44AD",  // Gradient end color in violet
  shadowColor: "rgba(0,0,0,0.15)", // Subtle shadow
};
const MoreInformation = ({ navigation }) => {
  const { isConnected, isInternetReachable } = useContext(NetworkContext);
  const [appUser, setAppUser] = useContext(ContextProvider);
  const userId = appUser.userId || {};
  const insets = useSafeAreaInsets(); // Get safe area insets
  const handleWebsiteLink = async () => {
    const websiteUrl = "https://www.mychits.co.in";
    if (!isConnected || !isInternetReachable) {
      Alert.alert("No Internet", "Please check your internet connection to visit the website.");
      return;
    }
    try {
      const supported = await Linking.canOpenURL(websiteUrl);
      if (supported) {
        await Linking.openURL(websiteUrl);
      } else {
        Alert.alert("Error", `Don't know how to open this URL: ${websiteUrl}.`);
      }
    } catch (error) {
      console.error("An error occurred while opening the URL:", error);
      Alert.alert("Error", "Could not open website. Please try again.");
    }
  };
  return (
    <SafeAreaView
      style={[styles.fullScreenContainer, { paddingTop: insets.top }]}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor={Colors.primaryViolet}
      />
      <Header
        navigation={navigation}
        userId={userId}
        title="More Information"
      />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.contentCard}>
          <Text style={styles.mainTitle}>About Demo Rider</Text>
          <Text style={styles.sectionText}>
            Welcome to Demo Rider! We are dedicated to providing a seamless and
            transparent platform for managing your chit funds. Our goal is to
            empower users with easy access to their chit details, payment
            history, and group information, all at their fingertips.
          </Text>
          <Text style={styles.sectionText}>
            This application is designed with user-friendliness in mind,
            ensuring a smooth experience for both new and experienced chit fund
            participants. We continuously strive to improve our services and add
            new features based on your valuable feedback.
          </Text>
          <View style={styles.contactSection}>
            <Text style={styles.contactTitle}>Need Support?</Text>
            <TouchableOpacity
              style={styles.contactButton}
              onPress={() => Linking.openURL("tel:+919483900777")}
            >
              <MaterialIcons
                name="call"
                size={20}
                color={Colors.cardBackground}
              />
              <Text style={styles.contactButtonText}>Call Us</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.contactButton}
              onPress={() => Linking.openURL("mailto:support@mychits.co.in")}
            >
              <MaterialIcons
                name="email"
                size={20}
                color={Colors.cardBackground}
              />
              <Text style={styles.contactButtonText}>Email Support</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.websiteContainer}>
            <TouchableOpacity
              onPress={handleWebsiteLink}
              disabled={!isConnected || !isInternetReachable}
              style={styles.websiteLinkButtonInWhiteContainer}
            >
              <MaterialIcons
                name="language"
                size={20}
                color={Colors.cardBackground}
              />
              <Text style={styles.websiteLinkTextInWhiteContainer}>
                Visit Our Website
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <LinearGradient
          colors={[Colors.gradientStart, Colors.gradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.appInfoFooter}
        >
          <View style={styles.madeWithLoveContainer}>
            <Text style={styles.appInfoMadeWithLove}>
              Made with{" "}
              <Text style={{ color: "#FF6B6B", fontWeight: "bold" }}>❤</Text> in
              India
            </Text>
            <MaterialIcons
              name="public"
              size={16}
              color={Colors.cardBackground}
              style={styles.madeInIndiaIcon}
            />
          </View>
        </LinearGradient>
      </ScrollView>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    backgroundColor: Colors.backgroundLight, // Light violet-toned background for the whole screen
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: width * 0.05, // Responsive horizontal padding
    paddingBottom: height * 0.03, // Extra bottom padding
    justifyContent: "space-between", // Ensures footer is pushed to the bottom
  },
  contentCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 15,
    padding: width * 0.05,
    marginTop: height * 0.02,
    marginBottom: height * 0.03,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  iconContainer: {
    alignItems: "center",
    marginBottom: height * 0.02,
  },
  mainTitle: {
    fontSize: width * 0.07,
    fontWeight: "800",
    color: Colors.primaryViolet,
    marginBottom: height * 0.02,
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.05)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  sectionText: {
    fontSize: width * 0.042,
    color: Colors.textDark,
    lineHeight: width * 0.065,
    marginBottom: height * 0.015,
    textAlign: "justify",
  },
  contactSection: {
    marginTop: height * 0.03,
    borderTopWidth: 1,
    borderTopColor: Colors.textLight,
    paddingTop: height * 0.02,
    alignItems: "center",
    marginBottom: height * 0.02,
  },
  contactTitle: {
    fontSize: width * 0.05,
    fontWeight: "700",
    color: Colors.primaryViolet,
    marginBottom: height * 0.015,
  },
  contactButton: {
    flexDirection: "row",
    backgroundColor: Colors.primaryViolet, // Violet-themed call-to-action button
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    width: "80%",
    maxWidth: 250,
    shadowColor: Colors.primaryViolet,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  contactButtonText: {
    color: Colors.cardBackground,
    fontSize: width * 0.045,
    fontWeight: "bold",
    marginLeft: 10,
  },
  websiteContainer: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 15,
    paddingVertical: height * 0.025,
    paddingHorizontal: width * 0.05,
    marginTop: height * 0.02,
    marginBottom: height * 0.03,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.textLight,
  },
  websiteLinkButtonInWhiteContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    backgroundColor: Colors.primaryViolet, // Violet-themed button inside the white container
    width: "80%",
    maxWidth: 250,
    shadowColor: Colors.primaryViolet,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  websiteLinkTextInWhiteContainer: {
    fontSize: width * 0.045,
    color: Colors.cardBackground,
    fontWeight: "bold",
    marginLeft: 10,
  },
  appInfoFooter: {
    paddingVertical: height * 0.03,
    paddingHorizontal: width * 0.05,
    borderRadius: 20,
    alignItems: "center",
    marginTop: height * 0.03,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 12,
  },
  madeWithLoveContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  appInfoMadeWithLove: {
    fontSize: width * 0.038,
    color: Colors.cardBackground,
    marginRight: 5,
  },
  madeInIndiaIcon: {},
  versionText: {
    fontSize: width * 0.035,
    color: Colors.textLight,
    marginTop: 5,
  },
});
export default MoreInformation;