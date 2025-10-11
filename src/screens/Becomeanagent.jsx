import React, { useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from "react-native";
import Toast from "react-native-toast-message";
import { Ionicons } from "@expo/vector-icons";
import { ContextProvider } from "../context/UserProvider";
import axios from "axios";
import url from "../data/url";

const Colors = {
  violet: "#4B0082",
  violetLight: "#f0ebfa",
  white: "#fff",
  grayText: "#666",
  inputBg: "#f0ebfa",
  border: "#DAD2FF",
  buttonDark: "#4B0082",
  buttonLight: "#B7A6FF",
};

const BecomeAnAgent = ({ navigation }) => {
  const [appUser] = useContext(ContextProvider);
  const currentUserId = appUser?.userId || null;

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    idType: "",
    idNumber: "",
    bankNumber: "",
    ifsc: "",
    experience: "",
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (name, value) => {
    setForm({ ...form, [name]: value });
  };

  const validateForm = () => {
    for (let key in form) {
      if (!form[key]) {
        Toast.show({
          type: "error",
          text1: "Missing Information",
          text2: "Please fill in all required fields.",
          position: "bottom",
        });
        return false;
      }
    }
    if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      Toast.show({
        type: "error",
        text1: "Invalid Email",
        text2: "Enter a valid email address.",
        position: "bottom",
      });
      return false;
    }
    if (!/^\d{10}$/.test(form.phone)) {
      Toast.show({
        type: "error",
        text1: "Invalid Phone Number",
        text2: "Enter a 10-digit phone number.",
        position: "bottom",
      });
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    if (!currentUserId) {
      Toast.show({
        type: "error",
        text1: "User Not Authenticated",
        text2: "Please log in to submit your application.",
        position: "bottom",
      });
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        userId: currentUserId,
        fullName: form.fullName,
        email: form.email,
        phoneNumber: form.phone,
        address: form.address,
        idProofType: form.idType,
        idProofNumber: form.idNumber,
        bankAccountNumber: form.bankNumber,
        ifscCode: form.ifsc,
        experience: form.experience,
        status: "pending",
        appliedAt: new Date().toISOString(),
      };

      const response = await axios.post(`${url}/become-agent/agents/become`, payload);

      if (response.status === 200 || response.status === 201) {
        Toast.show({
          type: "success",
          text1: "Application Submitted!",
          text2: "We'll review your application soon.",
          position: "bottom",
        });
        setForm({
          fullName: "",
          email: "",
          phone: "",
          address: "",
          idType: "",
          idNumber: "",
          bankNumber: "",
          ifsc: "",
          experience: "",
        });
      } else {
        Toast.show({
          type: "info",
          text1: "Submission Issue",
          text2: response.data?.message || "Something went wrong.",
          position: "bottom",
        });
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Submission Failed",
        text2: error.response?.data?.message || error.message || "Failed to submit application.",
        position: "bottom",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar backgroundColor={Colors.violet} barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Agent Application Form</Text>
        <Text style={styles.headerSub}>Fill in your details below to apply.</Text>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={styles.formContainer}
          contentContainerStyle={{ paddingBottom: 80 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            {[
              { label: "Full Name", key: "fullName" },
              { label: "Email Address", key: "email", keyboardType: "email-address" },
              { label: "Phone Number", key: "phone", keyboardType: "numeric" },
              { label: "Full Address", key: "address", multiline: true },
              { label: "ID Proof Type", key: "idType" },
              { label: "ID Proof Number", key: "idNumber" },
              { label: "Bank Account Number", key: "bankNumber", keyboardType: "numeric" },
              { label: "IFSC Code", key: "ifsc" },
              { label: "Relevant Experience", key: "experience", multiline: true },
            ].map((input, i) => (
              <View key={i}>
                <Text style={styles.label}>{input.label}</Text>
                <TextInput
                  style={[styles.input, input.multiline && styles.textArea]}
                  placeholder={`Enter ${input.label.toLowerCase()}`}
                  placeholderTextColor="#888"
                  value={form[input.key]}
                  onChangeText={(text) => handleChange(input.key, text)}
                  keyboardType={input.keyboardType || "default"}
                  multiline={input.multiline || false}
                />
              </View>
            ))}

            <TouchableOpacity
              style={[styles.submitBtn, isLoading && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitText}>Submit Application</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Toast />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    backgroundColor: Colors.violet,
    paddingVertical: 25,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    alignItems: "center",
    position: "relative",
  },
  backBtn: {
    position: "absolute",
    left: 20,
    top: 30,
    zIndex: 10,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
  },
  headerSub: {
    color: "#ddd",
    fontSize: 14,
    marginTop: 4,
    textAlign: "center",
  },
  formContainer: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 15,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  label: {
    color: "#000",
    fontSize: 15,
    marginBottom: 6,
    fontWeight: "600",
  },
  input: {
    backgroundColor: Colors.inputBg,
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
    fontSize: 15,
    color: "#000",
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  submitBtn: {
    backgroundColor: Colors.buttonDark,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: Colors.buttonLight,
  },
  submitText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});

export default BecomeAnAgent;
