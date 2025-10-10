// Enrollment.jsx
import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  StatusBar,
  SafeAreaView,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import url from "../data/url";
import Header from "../components/layouts/Header";
import { NetworkContext } from "../context/NetworkProvider";
import { ContextProvider } from "../context/UserProvider";
import Toast from "react-native-toast-message";

// Format number Indian style
const formatNumberIndianStyle = (num) => {
  if (num === null || num === undefined) return "0";
  const parts = num.toString().split(".");
  let integerPart = parts[0];
  const decimalPart = parts.length > 1 ? "." + parts[1] : "";
  let isNegative = false;
  if (integerPart.startsWith("-")) {
    isNegative = true;
    integerPart = integerPart.substring(1);
  }
  const lastThree = integerPart.substring(integerPart.length - 3);
  const otherNumbers = integerPart.substring(0, integerPart.length - 3);
  if (otherNumbers !== "") {
    const formattedOtherNumbers = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",");
    return (isNegative ? "-" : "") + formattedOtherNumbers + "," + lastThree + decimalPart;
  } else {
    return (isNegative ? "-" : "") + lastThree + decimalPart;
  }
};

// Theme
const theme = {
  background: "#6A1B9A", // deep violet
  surface: "#ffffff",
  violet: "#8E24AA",
  violetLight: "#BA68C8",
  textPrimary: "#000000",
  textSecondary: "#444",
  success: "#43A047",
  danger: "#E53935",
};

const Enrollment = ({ route, navigation }) => {
  const { groupFilter } = route.params || {};
  const [appUser] = useContext(ContextProvider);
  const userId = appUser.userId || {};
  const { isConnected, isInternetReachable } = useContext(NetworkContext);

  const [cardsData, setCardsData] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("AllGroups");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isJoining, setIsJoining] = useState(false);
  const [joinGroupId, setJoinGroupId] = useState(null);
  const [moreFiltersModalVisible, setMoreFiltersModalVisible] = useState(false);
  const [enrollmentModalVisible, setEnrollmentModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  const NoGroupsIllustration = require("../../assets/Nogroup.png");

  const fetchVacantSeats = async (groupId) => {
    try {
      const ticketsResponse = await axios.post(`${url}/enroll/get-next-tickets/${groupId}`);
      const fetchedTickets = Array.isArray(ticketsResponse.data.availableTickets)
        ? ticketsResponse.data.availableTickets
        : [];
      return fetchedTickets.length;
    } catch {
      return 0;
    }
  };

  const fetchGroups = async () => {
    if (!isConnected || !isInternetReachable) {
      setIsLoading(false);
      setError("No internet connection.");
      Toast.show({ type: "error", text1: "Offline", text2: "Cannot load groups." });
      return;
    }

    setIsLoading(true);
    setError(null);

    let endpoint = `${url}/group/get-group`;
    if (selectedGroup === "NewGroups") endpoint = `${url}/group/get-group-by-filter/NewGroups`;
    else if (selectedGroup === "OngoingGroups") endpoint = `${url}/group/get-group-by-filter/OngoingGroups`;

    try {
      const response = await fetch(endpoint);
      if (!response.ok) throw new Error("Failed to fetch groups.");
      const data = await response.json();
      const groupsWithVacantSeats = await Promise.all(
        data.map(async (group) => {
          const vacantSeats = await fetchVacantSeats(group._id);
          return { ...group, vacantSeats };
        })
      );
      setCardsData(groupsWithVacantSeats);
    } catch {
      setError("Error loading groups.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, [selectedGroup, isConnected, isInternetReachable]);

  useEffect(() => {
    if (groupFilter) {
      const normalizedFilter =
        groupFilter === "New Groups"
          ? "NewGroups"
          : groupFilter === "Ongoing Groups"
          ? "OngoingGroups"
          : groupFilter;
      setSelectedGroup(normalizedFilter);
    }
  }, [groupFilter]);

  const formatDate = (date) => new Date(date).toLocaleDateString("en-GB");

  const handleEnrollment = (card) => {
    if (!isConnected || !isInternetReachable) {
      setModalMessage("You are offline. Connect to internet to view details.");
      setEnrollmentModalVisible(true);
      return;
    }
    navigation.navigate("EnrollForm", { groupId: card._id, userId });
  };

  const handleJoinNow = async (card) => {
    if (!isConnected || !isInternetReachable) {
      Toast.show({ type: "error", text1: "No Internet Connection" });
      return;
    }
    if (card.vacantSeats === 0) {
      Toast.show({ type: "info", text1: "No Seats Available" });
      return;
    }

    setJoinGroupId(card._id);
    setIsJoining(true);
    const payload = {
      group_id: card._id,
      user_id: userId,
      no_of_tickets: 1,
      chit_asking_month: Number(card?.group_duration) || 0,
    };

    try {
      await axios.post(`${url}/mobile-app-enroll/add-mobile-app-enroll`, payload);
      Toast.show({ type: "success", text1: "Enrollment Successful!" });
      navigation.navigate("EnrollConfirm", { group_name: card.group_name, userId });
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Join Failed",
        text2: err.response?.data?.message || "Please try again.",
      });
    } finally {
      setIsJoining(false);
      setJoinGroupId(null);
      fetchGroups();
    }
  };

  const CardContent = ({ card }) => {
    const isCurrentCardJoining = isJoining && joinGroupId === card._id;
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{card.group_name}</Text>
          <Text style={styles.cardValue}>₹ {formatNumberIndianStyle(card.group_value)}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Start: {formatDate(card.start_date)}</Text>
          <Text style={styles.infoLabel}>End: {formatDate(card.end_date)}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Members: {card.group_members}</Text>
          <Text style={styles.infoLabel}>Vacant Seats: {card.vacantSeats}</Text>
        </View>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.outlineBtn, { borderColor: theme.violetLight }]}
            onPress={() => handleEnrollment(card)}
          >
            <Text style={[styles.btnText, { color: theme.violetLight }]}>View Details</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filledBtn,
              { backgroundColor: theme.violetLight },
              card.vacantSeats === 0 && { opacity: 0.6 },
            ]}
            onPress={() => handleJoinNow(card)}
            disabled={isCurrentCardJoining || card.vacantSeats === 0}
          >
            {isCurrentCardJoining ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.filledBtnText}>
                {card.vacantSeats === 0 ? "No Seats" : "Join Now"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={theme.background} />
        <Header userId={userId} navigation={navigation} />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.violetLight} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.background} />
      <Header userId={userId} navigation={navigation} />

      <View style={styles.inner}>
        {/* Filter Chips */}
        <View style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {[
              { key: "AllGroups", label: "All", icon: "grid" },
              { key: "NewGroups", label: "New", icon: "sparkles" },
              { key: "OngoingGroups", label: "Ongoing", icon: "hourglass" },
            ].map((chip) => {
              const isSelected = selectedGroup === chip.key;
              return (
                <TouchableOpacity
                  key={chip.key}
                  style={[styles.chip, isSelected && styles.selectedChip]}
                  onPress={() => setSelectedGroup(chip.key)}
                >
                  <Ionicons
                    name={chip.icon}
                    size={16}
                    color={isSelected ? "#fff" : theme.violet}
                  />
                  <Text
                    style={[
                      styles.chipText,
                      { color: isSelected ? "#fff" : theme.violet },
                    ]}
                  >
                    {chip.label}
                  </Text>
                </TouchableOpacity>
              );
            })}

            <TouchableOpacity
              style={styles.chip}
              onPress={() => setMoreFiltersModalVisible(true)}
            >
              <Ionicons name="filter" size={18} color={theme.violet} />
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Cards */}
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
          {cardsData.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Image source={NoGroupsIllustration} style={styles.noGroupsImage} />
              <Text style={styles.noGroupsTitle}>No Groups Found</Text>
              <Text style={styles.noGroupsText}>Please check back later.</Text>
            </View>
          ) : (
            cardsData.map((card) => <CardContent key={card._id} card={card} />)
          )}
        </ScrollView>
      </View>

      {/* Modals */}
      <Modal visible={enrollmentModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{modalMessage}</Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setEnrollmentModalVisible(false)}
            >
              <Text style={styles.modalCloseButtonText}>Got It!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={moreFiltersModalVisible} transparent animationType="slide">
        <View style={styles.moreFiltersModalOverlay}>
          <View style={styles.moreFiltersModalContent}>
            <Text style={styles.moreFiltersTitle}>Select a Filter</Text>
            {["AllGroups", "NewGroups", "OngoingGroups"].map((grp) => (
              <TouchableOpacity
                key={grp}
                style={styles.moreFiltersOption}
                onPress={() => {
                  setSelectedGroup(grp);
                  setMoreFiltersModalVisible(false);
                }}
              >
                <Text style={styles.moreFiltersOptionText}>
                  {grp === "AllGroups"
                    ? "All Groups"
                    : grp === "NewGroups"
                    ? "New Groups"
                    : "Ongoing Groups"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

// Styles
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  inner: { flex: 1, paddingHorizontal: 12 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },

  // Filter Chips
  filterContainer: { flexDirection: "row", marginVertical: 12 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 10,
    backgroundColor: theme.surface,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: theme.violet,
  },
  selectedChip: {
    backgroundColor: theme.violet,
    borderColor: theme.violet,
  },
  chipText: { marginLeft: 6, fontSize: 14, fontWeight: "bold" },

  // Card
  card: {
    backgroundColor: theme.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  cardTitle: { color: theme.textPrimary, fontWeight: "bold", fontSize: 18 },
  cardValue: { color: theme.violet, fontWeight: "bold", fontSize: 16 },
  infoRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  infoLabel: { color: theme.textSecondary, fontSize: 14 },
  buttonRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 12 },
  outlineBtn: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderRadius: 8,
    marginRight: 8,
    alignItems: "center",
  },
  filledBtn: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    marginLeft: 8,
    alignItems: "center",
  },
  btnText: { fontSize: 14, fontWeight: "bold" },
  filledBtnText: { color: "#fff", fontSize: 14, fontWeight: "bold" },

  // Empty state
  emptyContainer: { justifyContent: "center", alignItems: "center", marginTop: 50 },
  noGroupsImage: { width: 180, height: 180, marginBottom: 12, resizeMode: "contain" },
  noGroupsTitle: { color: "black", fontWeight: "bold", fontSize: 18 },
  noGroupsText: { color: theme.textSecondary, fontSize: 14 },

  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    backgroundColor: theme.surface,
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
  },
  modalTitle: { color: "black", fontSize: 16, marginBottom: 14, textAlign: "center" },
  modalCloseButton: {
    backgroundColor: theme.violet,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  modalCloseButtonText: { color: "white", fontWeight: "bold", fontSize: 14 },

  moreFiltersModalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  moreFiltersModalContent: {
    backgroundColor: theme.surface,
    padding: 20,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  moreFiltersTitle: { color: "black", fontSize: 18, fontWeight: "bold", marginBottom: 14 },
  moreFiltersOption: { paddingVertical: 12 },
  moreFiltersOptionText: { color: "black", fontSize: 16 },
});

export default Enrollment;
