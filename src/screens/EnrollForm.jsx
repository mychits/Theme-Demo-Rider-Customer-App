import React, { useState, useEffect, useContext, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import axios from "axios";
import url from "../data/url";
import Header from "../components/layouts/Header";
import { NetworkContext } from "../context/NetworkProvider";
import Toast from "react-native-toast-message";
import { ContextProvider } from "../context/UserProvider";

const Colors = {
  violet: "#6A0DAD",
  violetDark: "#4B0082",
  white: "#FFFFFF",
  whiteAccent: "#F8F6FF",
  gray: "#F2F2F2",
  borderGray: "#DAD7E0",
  darkGray: "#777",
  textDark: "#2C2C2C",
};

// Indian numbering format helper
const formatNumberIndianStyle = (num) => {
  if (num === null || num === undefined) return "0";
  const parts = num.toString().split(".");
  let integerPart = parts[0];
  let decimalPart = parts.length > 1 ? "." + parts[1] : "";
  let isNegative = false;
  if (integerPart.startsWith("-")) {
    isNegative = true;
    integerPart = integerPart.substring(1);
  }
  const lastThree = integerPart.substring(integerPart.length - 3);
  const otherNumbers = integerPart.substring(0, integerPart.length - 3);
  if (otherNumbers !== "") {
    const formattedOtherNumbers = otherNumbers.replace(
      /\B(?=(\d{2})+(?!\d))/g,
      ","
    );
    return (
      (isNegative ? "-" : "") +
      formattedOtherNumbers +
      "," +
      lastThree +
      decimalPart
    );
  } else {
    return (isNegative ? "-" : "") + lastThree + decimalPart;
  }
};

// Date formatting (only YYYY-MM-DD)
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toISOString().split("T")[0];
};

const EnrollForm = ({ navigation, route }) => {
  const [appUser] = useContext(ContextProvider);
  const userId = appUser.userId || {};
  const { groupId } = route.params || {};
  const [ticketCount, setTicketCount] = useState(1);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [cardsData, setCardsData] = useState(null);
  const [availableTickets, setAvailableTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const { isConnected, isInternetReachable } = useContext(NetworkContext);

  const fetchData = useCallback(async () => {
    if (!isConnected || !isInternetReachable) {
      setError("No internet connection.");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const groupRes = await fetch(`${url}/group/get-by-id-group/${groupId}`);
      const groupData = await groupRes.json();
      if (groupRes.ok) setCardsData(groupData);
      else throw new Error(groupData.message);

      const ticketRes = await axios.post(
        `${url}/enroll/get-next-tickets/${groupId}`
      );
      const fetchedTickets = Array.isArray(ticketRes.data.availableTickets)
        ? ticketRes.data.availableTickets
        : [];
      setAvailableTickets(fetchedTickets);
      setTicketCount(fetchedTickets.length > 0 ? 1 : 0);
    } catch (err) {
      console.error(err);
      setError("Failed to load data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [groupId, isConnected, isInternetReachable]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleEnroll = async () => {
    if (!termsAccepted) {
      Toast.show({
        type: "error",
        text1: "Please accept Terms & Conditions",
      });
      return;
    }
    if (ticketCount <= 0) {
      Toast.show({
        type: "error",
        text1: "Invalid Ticket Count",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        group_id: groupId,
        user_id: userId,
        no_of_tickets: ticketCount,
        chit_asking_month: Number(cardsData?.group_duration) || 0,
      };

      await axios.post(`${url}/mobile-app-enroll/add-mobile-app-enroll`, payload);

      Toast.show({
        type: "success",
        text1: "Enrollment Successful",
      });
      navigation.navigate("EnrollConfirm", {
        group_name: cardsData?.group_name,
        userId,
      });
    } catch (err) {
      console.error(err);
      Toast.show({
        type: "error",
        text1: "Enrollment Failed",
        text2: "Please try again later.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color={Colors.violet} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={fetchData} style={styles.retryButton}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Status bar color and spacing */}
      <StatusBar translucent backgroundColor={Colors.violet} barStyle="light-content" />

      {/* Violet area behind status bar */}
      <View style={styles.statusBarSpacer} />

      {/* Header (slightly below status bar) */}
      <View style={styles.headerContainer}>
        <Header userId={userId} navigation={navigation} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Add spacing below header */}
        <View style={{ height: 20 }} />

        {/* Group Card */}
        <View style={styles.cardWrapper}>
          <LinearGradient
            colors={[Colors.white, Colors.whiteAccent]}
            style={styles.groupCard}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardHeaderText}>Group Details</Text>
            </View>

            <View style={styles.cardContent}>
              <Text style={styles.groupValue}>
                ₹ {formatNumberIndianStyle(cardsData?.group_value)}
              </Text>
              <Text style={styles.groupName}>{cardsData?.group_name}</Text>

              <View style={styles.infoSection}>
                <View style={styles.infoRow}>
                  <MaterialIcons name="credit-card" size={18} color={Colors.violetDark} />
                  <Text style={styles.infoText}>
                    Installment: ₹ {formatNumberIndianStyle(cardsData.group_install)}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <MaterialIcons name="event-seat" size={18} color={Colors.violetDark} />
                  <Text style={styles.infoText}>
                    Vacant Seats: {availableTickets.length}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <MaterialIcons name="timer" size={18} color={Colors.violetDark} />
                  <Text style={styles.infoText}>
                    Duration: {cardsData.group_duration} Months
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <MaterialIcons name="calendar-today" size={18} color={Colors.violetDark} />
                  <Text style={styles.infoText}>
                    Start Date: {formatDate(cardsData.start_date)}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <MaterialIcons name="event-available" size={18} color={Colors.violetDark} />
                  <Text style={styles.infoText}>
                    End Date: {formatDate(cardsData.end_date)}
                  </Text>
                </View>
                {/* <View style={styles.infoRow}>
                  <MaterialIcons name="people" size={18} color={Colors.violetDark} />
                  <Text style={styles.infoText}>
                    Total Members: {cardsData.total_members}
                  </Text>
                </View> */}
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Ticket Count */}
        <View style={styles.ticketBox}>
          <Text style={styles.ticketTitle}>Select Tickets</Text>
          <View style={styles.stepperRow}>
            <TouchableOpacity
              style={[styles.stepButton, ticketCount <= 1 && styles.stepButtonDisabled]}
              onPress={() => setTicketCount(ticketCount - 1)}
              disabled={ticketCount <= 1}
            >
              <AntDesign name="minus" size={20} color={Colors.violet} />
            </TouchableOpacity>
            <Text style={styles.ticketCount}>{ticketCount}</Text>
            <TouchableOpacity
              style={[
                styles.stepButton,
                ticketCount >= availableTickets.length && styles.stepButtonDisabled,
              ]}
              onPress={() => setTicketCount(ticketCount + 1)}
              disabled={ticketCount >= availableTickets.length}
            >
              <AntDesign name="plus" size={20} color={Colors.violet} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Terms */}
        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => setTermsAccepted(!termsAccepted)}
        >
          <MaterialIcons
            name={termsAccepted ? "check-box" : "check-box-outline-blank"}
            size={24}
            color={termsAccepted ? Colors.violet : Colors.darkGray}
          />
          <Text style={styles.checkboxLabel}>
            I agree to the{" "}
            <Text style={styles.link} onPress={() => navigation.navigate("TermsConditions")}>
              Terms & Conditions
            </Text>{" "}
            and{" "}
            <Text style={styles.link} onPress={() => navigation.navigate("PrivacyPolicy")}>
              Privacy Policy
            </Text>
            .
          </Text>
        </TouchableOpacity>

        {/* Enroll Button */}
        <TouchableOpacity
          style={[
            styles.enrollButton,
            (!termsAccepted || isSubmitting) && styles.enrollButtonDisabled,
          ]}
          onPress={handleEnroll}
          disabled={!termsAccepted || isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={styles.enrollText}>Enroll Now</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      <Toast />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  statusBarSpacer: {
    height: Platform.OS === "android" ? StatusBar.currentHeight : 40,
    backgroundColor: Colors.violet,
  },
  headerContainer: {
    backgroundColor: Colors.violet,
    paddingBottom: 5,
  },
  scrollContainer: {
    paddingHorizontal: 15,
    paddingBottom: 40,
  },
  cardWrapper: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 25,
  },
  groupCard: {
    width: "95%",
    borderRadius: 16,
    borderWidth: 1.3,
    borderColor: Colors.borderGray,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    backgroundColor: Colors.white,
  },
  cardHeader: {
    backgroundColor: Colors.violet,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    paddingVertical: 10,
  },
  cardHeaderText: {
    color: Colors.white,
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 16,
  },
  cardContent: { padding: 18, alignItems: "center" },
  groupValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.violetDark,
    textAlign: "center",
    marginBottom: 6,
  },
  groupName: {
    fontSize: 18,
    color: Colors.textDark,
    textAlign: "center",
    marginBottom: 14,
  },
  infoSection: { width: "100%", marginTop: 5 },
  infoRow: { flexDirection: "row", alignItems: "center", marginVertical: 5 },
  infoText: { color: Colors.textDark, marginLeft: 8, fontSize: 15 },

  ticketBox: {
    backgroundColor: Colors.white,
    borderRadius: 15,
    padding: 15,
    shadowColor: Colors.violetDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
    marginBottom: 20,
  },
  ticketTitle: {
    textAlign: "center",
    fontSize: 18,
    color: Colors.violetDark,
    fontWeight: "bold",
    marginBottom: 10,
  },
  stepperRow: { flexDirection: "row", justifyContent: "center", alignItems: "center" },
  stepButton: {
    backgroundColor: Colors.whiteAccent,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.violetDark,
    marginHorizontal: 15,
  },
  stepButtonDisabled: { opacity: 0.5 },
  ticketCount: { fontSize: 22, fontWeight: "bold", color: Colors.violetDark },

  checkboxContainer: { flexDirection: "row", alignItems: "center", marginBottom: 15 },
  checkboxLabel: { flex: 1, color: Colors.textDark, marginLeft: 10 },
  link: {
    color: Colors.violet,
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
  enrollButton: {
    backgroundColor: Colors.violet,
    borderRadius: 15,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 30,
    shadowColor: Colors.violetDark,
    shadowOpacity: 0.3,
    elevation: 5,
  },
  enrollButtonDisabled: { backgroundColor: Colors.darkGray },
  enrollText: { color: Colors.white, fontWeight: "bold", fontSize: 16 },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.whiteAccent,
  },
  errorText: { color: Colors.violetDark, fontSize: 16, marginBottom: 10 },
  retryButton: {
    backgroundColor: Colors.violet,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  retryText: { color: Colors.white, fontWeight: "600" },
});

export default EnrollForm;
