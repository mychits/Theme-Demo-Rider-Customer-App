import React, { useState, useContext, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar,
  Animated,
  Image,
} from "react-native";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

// --- Custom Imports (Assuming these exist in your project) ---
import { NetworkContext } from "../context/NetworkProvider";
import { ContextProvider } from "../context/UserProvider";
import url from "../data/url";
import profileImage from "../../assets/profile (2).png"; 

// --- Unified Violet Color Palette ---
const Colors = {
  primaryViolet: "#5A189A", // Main Action Color
  secondaryViolet: "#9D4EDD", // Lighter action/disabled
  backgroundLight: "#FFFFFF", // Crisp White for the floating card
  screenBackground: "#F5F5F7", // Subtle light gray for the overall screen
  inputBackground: "#F3F0F9",
  inputBorder: "#D1C4E9",
  textDark: "#333333",
  headerGradientStart: "#2A0050", // Darker start for header (Official/Strong)
  headerGradientEnd: "#5A189A", 
  toastBg: "#EDE7F6", 
  toastText: "#4527A0", 
  redError: "#D32F2F",
};

// ==========================================================
// ---------------- 1. Custom Toast Component ----------------
// ==========================================================
/**
 * A sleek, animated custom toast component for showing notifications.
 */
const CustomToast = React.forwardRef(({ duration = 3000 }, ref) => {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState("");
  const opacity = useRef(new Animated.Value(0)).current;

  const show = (msg) => {
    // Stop current fade-out animation if a new message arrives
    Animated.timing(opacity).stop();
    
    setMessage(msg);
    setVisible(true);

    // Animation sequence: Fade In -> Hold -> Fade Out
    Animated.timing(opacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setTimeout(() => {
        Animated.timing(opacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }).start(() => {
          setVisible(false);
          setMessage("");
        });
      }, duration);
    });
  };

  React.useImperativeHandle(ref, () => ({
    show,
  }));

  if (!visible) return null;

  return (
    // pointerEvents="none" prevents the toast from blocking touch interactions underneath
    <Animated.View style={[toastStyles.toastContainer, { opacity }]} pointerEvents="none">
      <View style={toastStyles.toastContent}>
        <Text style={toastStyles.toastText}>{message}</Text>
      </View>
    </Animated.View>
  );
});

const toastStyles = StyleSheet.create({
  toastContainer: {
    position: "absolute",
    top: Platform.OS === 'ios' ? 90 : 60,
    left: "5%",
    right: "5%",
    backgroundColor: Colors.toastBg,
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 28,
    zIndex: 9999,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 10,
  },
  toastContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  toastText: {
    color: Colors.toastText,
    fontSize: 15,
    fontWeight: "600",
    flexShrink: 1,
    textAlign: "center",
  },
});

// ==========================================================
// ---------------- 2. Floating Input Component ----------------
// ==========================================================
/**
 * A reusable text input with an animated floating label.
 */
const FloatingLabelInput = ({
  label,
  value,
  onChangeText,
  keyboardType = "default",
  secureTextEntry = false,
  multiline = false,
  numberOfLines = 1,
  isRequired = false,
  autoCapitalize = "none",
  maxLength = undefined,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const animatedIsFocused = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(animatedIsFocused, {
      toValue: isFocused || value ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isFocused, value]);

  const labelStyle = {
    position: "absolute",
    left: 15,
    // Animated movement path
    top: animatedIsFocused.interpolate({
      inputRange: [0, 1],
      outputRange: [18, -10],
    }),
    fontSize: animatedIsFocused.interpolate({
      inputRange: [0, 1],
      outputRange: [16, 11],
    }),
    color: animatedIsFocused.interpolate({
      inputRange: [0, 1],
      outputRange: ["#999", Colors.primaryViolet],
    }),
    backgroundColor: Colors.backgroundLight,
    paddingHorizontal: 4,
    zIndex: 1,
    // Add subtle shadow to label when floating over the border
    textShadowColor: 'rgba(255, 255, 255, 0.8)', 
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
  };

  return (
    <View style={styles.inputContainer}>
      <Animated.Text style={labelStyle}>
        {label} {isRequired && <Text style={{ color: Colors.redError }}>*</Text>}
      </Animated.Text>
      <TextInput
        style={[
          styles.inputField,
          isFocused && { borderColor: Colors.primaryViolet },
          multiline && { minHeight: 100, paddingTop: 15, textAlignVertical: 'top' },
        ]}
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        multiline={multiline}
        numberOfLines={numberOfLines}
        blurOnSubmit
        autoCapitalize={autoCapitalize}
        maxLength={maxLength}
      />
    </View>
  );
};

// ==========================================================
// ---------------- 3. Main Screen Component ----------------
// ==========================================================
const IntroduceNewCustomers = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  
  const [appUser] = useContext(ContextProvider); 
  const { isConnected, isInternetReachable } = useContext(NetworkContext);
  
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const customToastRef = useRef();

  const showCustomToast = (message) => {
    customToastRef.current?.show(message);
  };

  // Function to handle form submission and API call
  const handleCreateUser = async () => {
    // 1. Network Check
    if (!isConnected || !isInternetReachable) {
      showCustomToast("No internet connection. Please check your network.");
      return;
    }

    // 2. Client-Side Validation
    if (!fullName.trim() || !phoneNumber.trim()) {
      showCustomToast("Full Name and Phone Number are required.");
      return;
    }
    if (!/^\d{10}$/.test(phoneNumber.trim())) {
      showCustomToast("Please enter a valid 10-digit phone number.");
      return;
    }
    if (email.trim() && !/^\S+@\S+\.\S+$/.test(email.trim())) {
      showCustomToast("Please enter a valid email address.");
      return;
    }
    if (zipCode.trim() && !/^\d{5}$/.test(zipCode.trim())) {
        showCustomToast("Please enter a valid 5-digit Zip Code.");
        return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(`${url}/user/add-user`, {
        full_name: fullName.trim(),
        email: email.trim(),
        phone_number: phoneNumber.trim(),
        Zipcode: zipCode.trim(), 
        track_source: "mobile",
      });

      if (response.status === 201) {
        showCustomToast(response.data.message || "Customer created successfully! 🎉");
        
        // Reset form fields
        setFullName("");
        setEmail("");
        setPhoneNumber("");
        setZipCode("");

        // Navigate back
        setTimeout(() => navigation.goBack(), 1500); 

      } else {
        showCustomToast(response.data.message || "Request completed, but with an unexpected status.");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message 
        || "An error occurred while creating the customer.";
      showCustomToast(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfilePress = () => {
    // Navigate to the ProfileScreen nested within the BottomTab navigator
    navigation.navigate("BottomTab", { screen: "ProfileScreen" });
  };

  return (
    <SafeAreaView style={styles.outerContainer}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={Colors.headerGradientStart}
      />

      {/* Gradient Header - Remains strong and official */}
      <LinearGradient
        colors={[Colors.headerGradientStart, Colors.headerGradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.headerContainer, { paddingTop: insets.top + 10 }]}
      >
        <View style={styles.headerRow}>
          {/* Back Button */}
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
          >
            <Ionicons name="arrow-back" size={26} color="#fff" />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>Introduce New Customer</Text>
          
          {/* Profile Image Button (The requested change) */}
          <TouchableOpacity 
            onPress={handleProfilePress} // <--- Navigates to ProfileScreen
            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
          >
            <Image source={profileImage} style={styles.headerProfileImage} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Main Content Area - Contains the Floating Card */}
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? insets.top + 50 : 0}
      >
        {/* Floating Card for the form */}
        <View style={styles.mainCard}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled" 
          >
            {/* Form Title inside the card */}
            <Text style={styles.cardFormTitle}>Customer Referral Details</Text>
            <Text style={styles.cardFormSubtitle}>Enter the required information to create a new customer lead.</Text>

            <FloatingLabelInput
              label="Full Name"
              value={fullName}
              onChangeText={setFullName}
              isRequired
              autoCapitalize="words"
            />
            <FloatingLabelInput
              label="Phone Number"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
              isRequired
              maxLength={10}
            />
            <FloatingLabelInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <FloatingLabelInput
              label="Zip Code"
              value={zipCode}
              onChangeText={setZipCode}
              keyboardType="numeric"
              maxLength={5}
            />

            <TouchableOpacity
              style={[
                styles.submitButton,
                isLoading && styles.submitButtonDisabled,
              ]}
              onPress={handleCreateUser}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.submitButtonText}>Create Customer</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>

      {/* Custom Toast component */}
      <CustomToast ref={customToastRef} />
    </SafeAreaView>
  );
};

// ==========================================================
// ---------------- 4. Stylesheet (Refined Look) ----------------
// ==========================================================
const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: Colors.screenBackground, // Subtle light gray background
  },
  headerContainer: {
    // Keep the nice, structured bottom rounding
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    paddingHorizontal: 20,
    paddingBottom: 20,
    // Stronger, official header shadow
    shadowColor: Colors.headerGradientStart,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 10,
    zIndex: 10, // Ensure header is above the card
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "800",
  },
  headerProfileImage: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 2,
    borderColor: '#fff',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  // Floating Card Style
  mainCard: {
    flex: 1,
    backgroundColor: Colors.backgroundLight, // Crisp white
    marginHorizontal: 15, // Centers the card and gives breathing room
    borderRadius: 20, // Fully rounded corners
    paddingHorizontal: 20,
    paddingTop: 25,
    marginTop: 20, // Space below the header
    marginBottom: 20, // Space above bottom safe area
    overflow: 'hidden', 
    // Strong, professional shadow for the floating effect
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 15,
  },
  cardFormTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: 5,
  },
  cardFormSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 30,
    fontWeight: '500',
  },
  scrollContent: {
    paddingBottom: 20, // Padding within the card
  },
  inputContainer: {
    marginBottom: 25,
    position: "relative",
  },
  inputField: {
    backgroundColor: Colors.inputBackground,
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingTop: 20, 
    paddingBottom: 10,
    fontSize: 16,
    borderWidth: 2,
    borderColor: Colors.inputBorder,
    color: Colors.textDark,
  },
  submitButton: {
    backgroundColor: Colors.primaryViolet,
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 40,
    shadowColor: Colors.primaryViolet,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  submitButtonDisabled: {
    backgroundColor: Colors.secondaryViolet,
    opacity: 0.7,
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    textTransform: "uppercase",
  },
});

export default IntroduceNewCustomers;