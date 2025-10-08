import React, { useState, useEffect, useRef, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Animated,
  SafeAreaView,
  Keyboard,
  ActivityIndicator,
  Dimensions,
  StatusBar,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

// Assuming these imports are correct for your project structure
import url from "../data/url";
import { ContextProvider } from "../context/UserProvider";

const { height: screenHeight } = Dimensions.get("window");

// --- Theme Colors ---
const PRIMARY_COLOR = "#6E30CF"; // Violet/Purple
const ACCENT_COLOR = "#050550ff"; // Lighter Violet
const BACKGROUND_COLOR = "#b49ff0ff"; // Light background (Kept same for contrast)
const TEXT_COLOR = "#000000";
const HINT_COLOR = "#0f1010ff";

// --- Toast Component ---
const Toast = React.forwardRef(({ duration = 2000 }, ref) => {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState("");
  const [imageSource, setImageSource] = useState(null);
  const opacity = useRef(new Animated.Value(0)).current;

  React.useImperativeHandle(ref, () => ({
    show: (msg, imgSrc) => {
      setMessage(msg);
      setImageSource(imgSrc);
      setVisible(true);
      Animated.timing(opacity, {
        toValue: 1,
        duration: 500,
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
            setImageSource(null);
          });
        }, duration);
      });
    },
  }));

  if (!visible) return null;
  

  return (
    <Animated.View style={[styles.toastContainer, { opacity }]}>
      <View style={styles.toastContent}>
        {imageSource && (
          <Image source={imageSource} style={styles.toastImage} />
        )}
        <Text style={styles.toastText}>{message}</Text>
      </View>
    </Animated.View>
  );
});

// --- Register Screen Component ---
export default function Register() {
  const navigation = useNavigation();
  const toastRef = useRef();
  // Assuming ContextProvider provides [state, setState]
  const [appUser, setAppUser] = useContext(ContextProvider); 

  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        setKeyboardVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  const showAppToast = (message) => {
    if (toastRef.current) {
      // Re-using the Group400.png image for the toast icon
      toastRef.current.show(message, require("../../assets/CityChits.png")); 
    }
  };

  const validateInputs = () => {
    const trimmedFullName = fullName.trim();
    const trimmedPhoneNumber = phoneNumber.replace(/\s/g, "");
    const trimmedPassword = password.trim();
    const trimmedConfirmPassword = confirmPassword.trim();

    if (
      !trimmedFullName ||
      !trimmedPhoneNumber ||
      !trimmedPassword ||
      !trimmedConfirmPassword
    ) {
      showAppToast("Please fill all fields.");
      return false;
    }

    if (trimmedPassword !== trimmedConfirmPassword) {
      showAppToast("Passwords do not match.");
      return false;
    }

    if (trimmedPhoneNumber.length !== 10 || isNaN(trimmedPhoneNumber)) {
      showAppToast("Phone number must be 10 digits.");
      return false;
    }
    
    // Add simple password length check for better UX
    if (trimmedPassword.length < 6) {
        showAppToast("Password must be at least 6 characters long.");
        return false;
    }

    return true;
  };

  const handleSendOtp = async () => {
    if (!validateInputs()) {
      return;
    }
    setLoading(true);
    try {
      const payload = {
        phone_number: phoneNumber.replace(/\s/g, ""),
        full_name: fullName.trim(),
      };
      
      const apiEndpoint = `${url}/user/send-register-otp`; 
      console.log("Attempting to send OTP to:", apiEndpoint); 
      console.log("Sending OTP payload:", payload);

      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const contentType = response.headers.get("content-type");
      if (response.ok && contentType && contentType.includes("application/json")) {
        const data = await response.json();
        console.log("OTP send success response:", data);
        showAppToast(data.message || "OTP sent successfully!");
        
        // Navigate to OTP verification screen on success
        navigation.navigate("RegisterOtpVerify", {
          mobileNumber: phoneNumber.replace(/\s/g, ""),
          fullName: fullName.trim(),
          password: password.trim(),
        });
      } else {
        let errorMessage = "Failed to send OTP. Please try again.";
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
          console.error("OTP send error (JSON response):", errorData);
        } else {
          const errorText = await response.text();
          console.error("OTP send error (non-JSON response):", response.status, errorText);
          errorMessage = `Server Error (${response.status}). Please check your backend route or server logs.`;
        }
        showAppToast(errorMessage);
      }
    } catch (error) {
      console.error("Network or unexpected error sending OTP:", error);
      showAppToast("An unexpected error occurred. Please check your network and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={PRIMARY_COLOR} />
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={
          // Adjust for keyboard visibility if needed, or use a simpler offset
          Platform.OS === "ios" ? 0 : -screenHeight * 0.15 
        }
      >
        <ScrollView
          contentContainerStyle={styles.scrollViewContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {!keyboardVisible && (
            <View style={styles.topSection}>
              <Image
                source={require("../../assets/CityChits.png")}
                style={styles.logo}
                resizeMode="contain"
              />
              <Text style={styles.title}>Demo Rider</Text>
            </View>
          )}

          <View style={[styles.bottomSection, { paddingTop: 20 }]}>
            <Text style={styles.registerTitle}>Register</Text>
            <Text style={styles.registerSubtitle}>Create your account</Text>

            {/* Full Name Input */}
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              placeholderTextColor={HINT_COLOR}
              value={fullName}
              onChangeText={setFullName}
              accessible
              accessibilityLabel="Full name input"
              autoCapitalize="words"
              autoCorrect={false}
              editable={!loading}
            />

            {/* Phone Number Input */}
            <TextInput
              style={styles.input}
              placeholder="Phone Number"
              placeholderTextColor={HINT_COLOR}
              keyboardType="phone-pad"
              value={phoneNumber}
              onChangeText={(text) =>
                setPhoneNumber(text.replace(/[^0-9]/g, ""))
              }
              maxLength={10}
              accessible
              accessibilityLabel="Phone number input"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />

            {/* Password Input */}
            <View style={styles.passwordInputContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Create Password"
                placeholderTextColor={HINT_COLOR}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                accessible
                accessibilityLabel="Password input"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
                accessible
                accessibilityLabel="Toggle password visibility"
                disabled={loading}
              >
                <AntDesign
                  name={showPassword ? "eye" : "eyeo"}
                  size={20}
                  color={HINT_COLOR}
                />
              </TouchableOpacity>
            </View>

            {/* Confirm Password Input */}
            <View style={styles.passwordInputContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Confirm Password"
                placeholderTextColor={HINT_COLOR}
                secureTextEntry={!showConfirmPassword}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                accessible
                accessibilityLabel="Confirm password input"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.eyeIcon}
                accessible
                accessibilityLabel="Toggle confirm password visibility"
                disabled={loading}
              >
                <AntDesign
                  name={showConfirmPassword ? "eye" : "eyeo"}
                  size={20}
                  color={HINT_COLOR}
                />
              </TouchableOpacity>
            </View>

            {/* Send OTP Button */}
            <TouchableOpacity
              style={[styles.registerButton, loading && { opacity: 0.7 }]}
              onPress={handleSendOtp}
              accessible
              accessibilityLabel="Send OTP"
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.registerButtonText}>Send OTP</Text>
              )}
            </TouchableOpacity>

            {/* Login Link */}
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate("Login")}
                accessible
                accessibilityLabel="Navigate to Login"
                disabled={loading}
              >
                <Text style={styles.loginButtonText}>Log in</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Optional Loading Overlay (Removed the duplicate here to keep it simple, the button handles loading state) */}
        </ScrollView>
      </KeyboardAvoidingView>

      <Toast ref={toastRef} />
    </SafeAreaView>
  );
}

// --- Stylesheet ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: PRIMARY_COLOR, // Violet
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: "space-between",
  },
  topSection: {
    flex: 0.6,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: PRIMARY_COLOR, // Violet
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingVertical: 20,
    width: "100%",
  },
  logo: {
    width: 300,
    height: 150,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: 1,
  },
  bottomSection: {
    flex: 1,
    backgroundColor: BACKGROUND_COLOR, // Light background
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 20,
    paddingTop: 20,
    alignItems: "center",
    width: "100%",
  },
  registerTitle: {
    color: TEXT_COLOR,
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 5,
  },
  registerSubtitle: {
    color: TEXT_COLOR,
    fontSize: 14,
    textAlign: "center",
    marginBottom: 10,
  },
  input: {
    width: "90%",
    height: 50,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 15,
    fontSize: 14,
    color: PRIMARY_COLOR, // Violet text color
    marginBottom: 12,
    borderWidth: 1,
    borderColor: ACCENT_COLOR, // Lighter violet border
  },
  passwordInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "90%",
    height: 50,
    backgroundColor: "#F0F8FF", // Very light blue for subtle contrast
    borderRadius: 12,
    borderWidth: 1,
    borderColor: ACCENT_COLOR,
    marginBottom: 12,
  },
  passwordInput: {
    flex: 1,
    height: 50,
    paddingHorizontal: 15,
    fontSize: 14,
    color: PRIMARY_COLOR, // Violet text color
  },
  eyeIcon: {
    padding: 12,
  },
  registerButton: {
    backgroundColor: PRIMARY_COLOR, // Violet button
    borderRadius: 120,
    paddingVertical: 12,
    width: "70%",
    alignItems: "center",
    marginBottom: 18,
    justifyContent: 'center', // Center indicator
  },
  registerButtonText: {
    color: "white",
    fontSize: 16,
  },
  loginContainer: {
    flexDirection: "row",
    marginTop: 15,
    alignItems: "center",
  },
  loginText: {
    color: HINT_COLOR,
    fontSize: 14,
  },
  loginButtonText: {
    color: PRIMARY_COLOR, // Violet login link
    fontSize: 14,
    fontWeight: "bold",
  },
  // Toast Styles (Adjusted text color to violet)
  toastContainer: {
    position: "absolute",
    top: 40,
    left: "5%",
    right: "5%",
    backgroundColor: "rgba(238, 243, 247, 0.9)",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    zIndex: 9999,
    alignItems: "center",
  },
  toastContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  toastText: {
    color: "black", // Violet toast text
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 10,
  },
  toastImage: {
    width: 30,
    height: 30,
  },
});