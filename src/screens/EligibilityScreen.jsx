
import React, { useContext } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Platform,
  TouchableOpacity,
  Linking,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";
import { FontAwesome } from "@expo/vector-icons";
import Header from "../components/layouts/Header";
import { ContextProvider } from "../context/UserProvider";
const Colors = {
  primaryViolet: "#6E30CF",       // Main violet tone for headers & buttons
  secondaryViolet: "#8E44AD",     // Complementary violet shade if needed
  background: "#6E30CF",          // Background for the safe area and scrollView
  cardBackground: "#FFFFFF",      // Card elements background (white)
  textPrimary: "#333333",         // Dark text color for descriptions
  textSecondary: "#555555",       // Secondary text color
  sectionBackground: "#F0F8FF",   // Light background for section titles
  borderColor: "#E0E0E0",         // Soft border color for cards
  shadowColor: "rgba(0,0,0,0.15)", // General shadow color
  gradientStart: "#EDE7F6",        // Gradient start for footer
  gradientEnd: "#F3E5F5",          // Gradient end for footer
  whatsappBg: "#EDE7F6",           // WhatsApp button background
  whatsappText: "#6E30CF",         // WhatsApp button text color
};
const EligibilityScreen = ({ route, navigation }) => {
  const insets = useSafeAreaInsets();
  const [appUser] = useContext(ContextProvider);
  const userId = appUser.userId || {};
  const handleWebsiteLink = async () => {
    const websiteUrl = "https://mychits.co.in/";
    try {
      const supported = await Linking.canOpenURL(websiteUrl);
      if (supported) {
        await Linking.openURL(websiteUrl);
      } else {
        console.warn(`Can't open URL: ${websiteUrl}`);
      }
    } catch (error) {
      console.error("Error opening website:", error);
    }
  };
  const handleWhatsAppLink = async () => {
    const whatsappNumber = "+919900088888"; // Example number
    const whatsappMessage =
      "Hello, I have a question about chit fund eligibility.";
    const url = `whatsapp://send?phone=${whatsappNumber}&text=${encodeURIComponent(
      whatsappMessage
    )}`;
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        alert("WhatsApp is not installed on your device.");
      }
    } catch (error) {
      console.error("Error opening WhatsApp:", error);
      alert("Could not open WhatsApp. Please ensure it is installed.");
    }
  };
  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        {
          paddingTop:
            Platform.OS === "android" ? StatusBar.currentHeight : insets.top,
        },
      ]}
    >
      <StatusBar barStyle="light-content" backgroundColor={Colors.primaryViolet} />
      <Header userId={userId} navigation={navigation} />
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.mainContentContainer}>
          <Text style={styles.mainTitle}>Chit Fund Eligibility Criteria</Text>
          <Text style={styles.description}>
            To ensure a smooth and secure experience for all our subscribers,
            please review the following eligibility requirements before joining a chit group.
            Adherence to these guidelines ensures a transparent and mutually beneficial 
            arrangement for all participants.
          </Text>
          <Text style={styles.sectionTitle}>1. Basic Eligibility Criteria</Text>
          <Text style={styles.sectionDescription}>
            These are the fundamental requirements for all our potential subscribers.
          </Text>
          <View style={styles.listItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.listItemText}>
              <Text style={styles.listItemBold}>Age:</Text> Applicants must be 18 years or older.
            </Text>
          </View>
          <View style={styles.listItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.listItemText}>
              <Text style={styles.listItemBold}>Indian Resident:</Text> Available only to Indian citizens residing in Karnataka.
            </Text>
          </View>
          <View style={styles.listItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.listItemText}>
              <Text style={styles.listItemBold}>Sound Mind:</Text> Applicants must be of sound mind and capable of entering a legal contract.
            </Text>
          </View>
          <View style={styles.listItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.listItemText}>
              <Text style={styles.listItemBold}>Not an Undischarged Insolvent:</Text> Applicants must not be undischarged insolvents.
            </Text>
          </View>
          <Text style={styles.sectionTitle}>2. Financial Stability & Ability to Pay</Text>
          <Text style={styles.sectionDescription}>
            Your ability to consistently make payments is crucial.
          </Text>
          <View style={styles.listItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.listItemText}>
              <Text style={styles.listItemBold}>Income Proof:</Text> Regular income proof (e.g., salary slips, bank statements, or ITRs).
            </Text>
          </View>
          <View style={styles.listItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.listItemText}>
              <Text style={styles.listItemBold}>Minimum Income:</Text> A minimum monthly income of ₹10,000 is generally required.
            </Text>
          </View>
          <View style={styles.listItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.listItemText}>
              <Text style={styles.listItemBold}>Comfortable Chit Installment:</Text> Ensure your post-expense balance comfortably covers the installment.
            </Text>
          </View>
          <Text style={styles.sectionTitle}>3. KYC (Know Your Customer) Documents</Text>
          <Text style={styles.sectionDescription}>
            Provide self-attested copies of the following documents to complete your application:
          </Text>
          <View style={styles.subSection}>
            <Text style={styles.subSectionTitle}>Identity Proof (Any one):</Text>
            <View style={styles.listItem}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.listItemText}>PAN Card (Mandatory)</Text>
            </View>
          </View>
          <View style={styles.listItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.listItemText}>Aadhar Card</Text>
          </View>
          <View style={styles.listItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.listItemText}>Voter ID</Text>
          </View>
          <View style={styles.listItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.listItemText}>Passport</Text>
          </View>
          <View style={styles.subSection}>
            <Text style={styles.subSectionTitle}>Address Proof (Any one, recent):</Text>
            <View style={styles.listItem}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.listItemText}>Aadhar / Voter ID / Passport (if current address)</Text>
            </View>
            <View style={styles.listItem}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.listItemText}>Latest Utility Bills (not older than 3 months)</Text>
            </View>
            <View style={styles.listItem}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.listItemText}>Bank Statement (with current address)</Text>
            </View>
            <View style={styles.listItem}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.listItemText}>House Tax Receipt (for property owners)</Text>
            </View>
          </View>
          <View style={styles.listItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.listItemText}><Text style={styles.listItemBold}>Recent Passport-sized Photograph</Text></Text>
          </View>
          <View style={styles.listItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.listItemText}>
              <Text style={styles.listItemBold}>Bank Account Details:</Text> For monthly payments and prize money disbursement.
            </Text>
          </View>
          <Text style={styles.sectionTitle}>4. Conditions for Prize Money Disbursement</Text>
          <Text style={styles.sectionDescription}>
            After winning an auction, ensure the following before receiving your prize money:
          </Text>
          <View style={styles.listItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.listItemText}>
              <Text style={styles.listItemBold}>No Pending Dues:</Text> All previous installments must be up to date.
            </Text>
          </View>
          <View style={styles.listItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.listItemText}>
              <Text style={styles.listItemBold}>Security Requirements:</Text> Fulfill the security requirements as per your chit agreement.
            </Text>
          </View>
          <View style={styles.listItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.listItemText}>
              <Text style={styles.listItemBold}>Guarantor Eligibility:</Text> Any guarantor must meet our eligibility criteria (e.g., age, income, credit score).
            </Text>
          </View>
          <View style={styles.listItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.listItemText}>
              <Text style={styles.listItemBold}>Minimum Installments Paid:</Text> (If applicable) You must have paid a minimum number of installments to qualify.
            </Text>
          </View>
          <Text style={styles.sectionTitle}>5. Important Disclaimers & Advice</Text>
          <View style={styles.listItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.listItemText}>
              <Text style={styles.listItemBold}>Read Terms and Conditions:</Text> Please read the complete Terms and Conditions of our chit schemes carefully.
            </Text>
          </View>
          <View style={styles.listItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.listItemText}>
              <Text style={styles.listItemBold}>Financial Planning:</Text> Choose a chit value and installment plan aligned with your financial capacity.
            </Text>
          </View>
          <View style={styles.listItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.listItemText}>
              <Text style={styles.listItemBold}>Consequences of Discontinuation:</Text> Defaulting on installments or discontinuing participation may have financial implications.
            </Text>
          </View>
          <Text style={styles.footerText}>
            Meeting these eligibility criteria is essential for compliant participation in our chit fund schemes. For further clarifications or assistance, please contact our customer support.
          </Text>
          <LinearGradient
            colors={[Colors.gradientStart, Colors.gradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.appInfoFooter}
          >
            <TouchableOpacity
              onPress={handleWhatsAppLink}
              style={styles.whatsappButton}
            >
              <FontAwesome name="whatsapp" size={24} color={Colors.whatsappText} />
              <Text style={styles.whatsappButtonText}>Chat with us on WhatsApp</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleWebsiteLink}>
              <Text style={styles.appInfoWebsiteLink}>
                Visit our Website: <Text style={{ fontWeight: "bold" }}>mychits.co.in</Text>
              </Text>
            </TouchableOpacity>
            <View style={styles.madeWithLoveContainer}>
              <Text style={styles.appInfoMadeWithLove}>
                Made with <Text style={{ color: "#E53935" }}>❤️</Text> in India
              </Text>
              <MaterialIcons
                name="public"
                size={16}
                color={Colors.primaryViolet}
                style={styles.madeInIndiaIcon}
              />
            </View>
          </LinearGradient>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.primaryViolet,
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingHorizontal: 10,
    paddingBottom: 30,
    backgroundColor: Colors.background,
  },
  mainContentContainer: {
    flex: 1,
    backgroundColor: Colors.cardBackground,
    borderRadius: 15,
    padding: 15,
    marginTop: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.borderColor,
    ...Platform.select({
      ios: {
        shadowColor: Colors.shadowColor,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 15,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  mainTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: Colors.primaryViolet,
    marginBottom: 15,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    color: Colors.textPrimary,
    marginBottom: 20,
    textAlign: "center",
    lineHeight: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.primaryViolet,
    marginTop: 25,
    marginBottom: 10,
    paddingBottom: 5,
    paddingLeft: 5,
    backgroundColor: Colors.sectionBackground,
    borderRadius: 8,
    paddingVertical: 5,
    ...Platform.select({
      ios: {
        shadowColor: Colors.shadowColor,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  sectionDescription: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginBottom: 15,
    lineHeight: 22,
  },
  subSection: {
    marginLeft: 15,
    marginTop: 10,
    marginBottom: 10,
  },
  subSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  bullet: {
    fontSize: 16,
    color: Colors.primaryViolet,
    marginRight: 8,
    lineHeight: 22,
  },
  listItemText: {
    flex: 1,
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  listItemBold: {
    fontWeight: "bold",
  },
  footerText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 30,
    textAlign: "center",
    fontStyle: "italic",
    marginBottom: 20,
  },
  appInfoFooter: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 0,
    paddingVertical: 25,
    paddingHorizontal: 25,
    width: "95%",
    alignSelf: "center",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: Colors.borderColor,
    ...Platform.select({
      ios: {
        shadowColor: Colors.shadowColor,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  appInfoWebsiteLink: {
    fontSize: 17,
    color: Colors.primaryViolet,
    textDecorationLine: "underline",
    marginBottom: 8,
    textAlign: "center",
    fontWeight: "500",
    letterSpacing: 0.5,
  },
  madeWithLoveContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    justifyContent: "center",
  },
  appInfoMadeWithLove: {
    fontSize: 15,
    color: Colors.textSecondary,
    letterSpacing: 0.3,
  },
  madeInIndiaIcon: {
    marginLeft: 8,
  },
  whatsappButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.whatsappBg,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginBottom: 15,
    ...Platform.select({
      ios: {
        shadowColor: Colors.shadowColor,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  whatsappButtonText: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.whatsappText,
  },
});
export default EligibilityScreen;